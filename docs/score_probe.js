// Cursor-position score comparison — hfu's point: a stack of filled-raster overlays
// makes every "Score" layer look roughly the same at a glance, which undersells this
// data. What's actually interesting is the RELATIVE difference between commodities
// AT ONE PLACE ("is this spot better for fish farming or cassava?"). Read every
// relevant source's own tile independently (not the rendered screen), so the
// comparison doesn't depend on which layer happens to be drawn on top.

const SCORE_SOURCES = [
  { id: "hih-cod-cassava-score", label: "Cassava" },
  { id: "hih-cod-cocoa-score", label: "Cocoa" },
  { id: "hih-cod-coffee-score", label: "Coffee" },
  { id: "hih-cod-maize-score", label: "Maize" },
  { id: "hih-cod-palmoil-score", label: "Palm oil" },
  { id: "hih-cod-wheat-score", label: "Wheat" },
  { id: "hih-cod-livestock-score", label: "Livestock" },
  { id: "hih-fishfarm-closed", label: "Fish (closed)" },
  { id: "hih-fishfarm-open", label: "Fish (open)" },
  { id: "hih-fishfarm-extensive", label: "Fish (extensive)" },
  { id: "hih-access-urban", label: "Access: urban" },
  { id: "hih-access-urban-weighted", label: "Access: weighted" },
  { id: "hih-access-port", label: "Access: port" },
];

const PROBE_ZOOM = 8; // matches these layers' own maxzoom (D10/D11) — best real resolution available

// Same 0-100 sequential ramp used to build score_ramp.clr (D10) — reproduced here
// so the client can invert color -> approximate score without a server round trip.
function scoreRampColor(v) {
  const stops = [
    [0, [255, 255, 229]], [25, [254, 217, 118]], [50, [254, 153, 41]],
    [75, [217, 95, 14]], [100, [140, 45, 4]]
  ];
  for (let i = 0; i < stops.length - 1; i++) {
    const [v0, c0] = stops[i], [v1, c1] = stops[i + 1];
    if (v >= v0 && v <= v1) {
      const t = (v - v0) / (v1 - v0);
      return [0, 1, 2].map((k) => Math.round(c0[k] + (c1[k] - c0[k]) * t));
    }
  }
  return stops[stops.length - 1][1];
}

function nearestScore(r, g, b) {
  let best = null, bestDist = Infinity;
  for (let v = 0; v <= 100; v++) {
    const [cr, cg, cb] = scoreRampColor(v);
    const d = (cr - r) ** 2 + (cg - g) ** 2 + (cb - b) ** 2;
    if (d < bestDist) { bestDist = d; best = v; }
  }
  return bestDist <= 25 * 25 * 3 ? best : null; // null = transparent/nodata/background
}

function lonLatToTile(lon, lat, z) {
  const n = 2 ** z;
  const x = (lon + 180) / 360 * n;
  const latRad = (lat * Math.PI) / 180;
  const y = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n;
  return { tx: Math.floor(x), ty: Math.floor(y), px: Math.floor((x - Math.floor(x)) * 256), py: Math.floor((y - Math.floor(y)) * 256) };
}

const tileImageCache = new Map(); // "sourceId/z/x/y" -> ImageData | Promise | null(failed)

function loadTileImageData(sourceId, z, tx, ty) {
  const key = `${sourceId}/${z}/${tx}/${ty}`;
  if (tileImageCache.has(key)) return tileImageCache.get(key);

  const promise = new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = 256; c.height = 256;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0);
      try {
        resolve(ctx.getImageData(0, 0, 256, 256));
      } catch (e) {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = `${TILE_SERVER}/${sourceId}/${z}/${tx}/${ty}`;
  });
  tileImageCache.set(key, promise);
  return promise;
}

async function probeScoresAt(lon, lat) {
  const { tx, ty, px, py } = lonLatToTile(lon, lat, PROBE_ZOOM);
  const results = await Promise.all(
    SCORE_SOURCES.map(async (src) => {
      const imgData = await loadTileImageData(src.id, PROBE_ZOOM, tx, ty);
      if (!imgData) return { ...src, value: null };
      const idx = (py * 256 + px) * 4;
      const [r, g, b, a] = imgData.data.slice(idx, idx + 4);
      if (a < 10) return { ...src, value: null };
      return { ...src, value: nearestScore(r, g, b) };
    })
  );
  return results;
}

// Sampling anchor: the map's own center, not the mouse cursor — a fixed on-screen
// probeRing, with panning (not hovering) moving the sample point. Chosen over free
// mouse-hover deliberately: hovering has no equivalent on touch devices (no
// persistent pointer position without an active touch), while "pan to move the
// probe" is the same physical gesture on mouse and touch alike, and fits this
// project's push toward a buttonless, device-agnostic Cartographer.
function initScoreProbe(map) {
  const panel = document.createElement("div");
  panel.id = "score-probe";
  Object.assign(panel.style, {
    position: "absolute", right: "8px", top: "8px", zIndex: 10,
    background: "white", font: "11px sans-serif", padding: "8px 10px",
    borderRadius: "4px", boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
    width: "180px", display: "none"
  });
  document.body.appendChild(panel);

  const probeRing = document.createElement("div");
  Object.assign(probeRing.style, {
    position: "absolute", left: "50%", top: "50%", zIndex: 9,
    width: "18px", height: "18px", transform: "translate(-50%,-50%)",
    pointerEvents: "none", borderRadius: "50%",
    border: "2px solid #c0392b", background: "rgba(192,57,43,0.15)"
  });
  map.getContainer().appendChild(probeRing);

  let scheduled = false;

  function sampleCenter() {
    const z = Math.floor(map.getZoom());
    if (z < 3) { panel.style.display = "none"; probeRing.style.display = "none"; return; }
    probeRing.style.display = "block";
    if (scheduled) return;
    scheduled = true;

    const { lng, lat } = map.getCenter();
    probeScoresAt(lng, lat).then((results) => {
      scheduled = false;
      const valid = results.filter((r) => r.value !== null);
      if (valid.length === 0) { panel.style.display = "none"; return; }
      valid.sort((a, b) => b.value - a.value);
      panel.innerHTML =
        `<div style="font-weight:bold;margin-bottom:6px;">この地点のスコア比較</div>` +
        valid.map((r) => `
          <div style="margin-bottom:4px;">
            <div style="display:flex;justify-content:space-between;">
              <span>${r.label}</span><span>${r.value}</span>
            </div>
            <div style="background:#eee;height:5px;border-radius:2px;">
              <div style="background:#c0392b;width:${(r.value / 100) * 100}%;height:5px;border-radius:2px;"></div>
            </div>
          </div>
        `).join("");
      panel.style.display = "block";
    });
  }

  // Debounce: sample after panning/zooming settles (moveend + a short extra
  // delay), not on every continuous "move" tick — steadier, and avoids redundant
  // WebGL reads / tile fetches mid-gesture. hfu's suggestion, for stability.
  let debounceTimer = null;
  function scheduleSample() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(sampleCenter, 200);
  }
  map.on("moveend", scheduleSample);
  map.on("load", sampleCenter);
}

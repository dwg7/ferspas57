// Cursor-position score comparison — hfu's point: a stack of filled-raster overlays
// makes every "Score" layer look roughly the same at a glance, which undersells this
// data. What's actually interesting is the RELATIVE difference between commodities
// AT ONE PLACE ("is this spot better for fish farming or cassava?"). Read every
// relevant source's own tile independently (not the rendered screen), so the
// comparison doesn't depend on which layer happens to be drawn on top.

// Country-specific commodity layers are separate per-country PMTiles archives
// (unlike fishfarm/access below, which are single merged archives already
// covering every country, D28) — probing all of them regardless of where the
// map is currently centered is deliberate and harmless: a source with no data
// under the probe point returns null (transparent/out-of-bounds) and is
// filtered out below, so only whichever country's layers actually have data
// at the sampled point ever show up. The (COD)/(CAF)/(CIV) suffixes are this
// project's own established ISO3 source_id codes, not natural-language text —
// kept for the same language-agnostic-chrome reason narrative playback's
// controls are emoji, not words (D40).
// Each source's real maxzoom, checked directly against its live TileJSON, not
// assumed uniform — a real bug found while adding CIV/CAF (below): the merged
// fishfarm/access archives came out at maxzoom 7 (D28 flagged this at the time
// and it was never revisited), and CAF's cassava archive is also maxzoom 7,
// while every COD/CIV commodity layer is maxzoom 8. Probing at a fixed zoom 8
// for a maxzoom-7 source 404s outright (confirmed directly) rather than
// returning a lower-resolution tile — Martin does not overzoom-serve past a
// source's real max — so this had been silently zeroing out fishfarm/access
// from the panel for every location, not just the newly-added countries.
const SCORE_SOURCES = [
  { id: "hih-cod-cassava-score", label: "Cassava (COD)", maxzoom: 8 },
  { id: "hih-cod-cocoa-score", label: "Cocoa (COD)", maxzoom: 8 },
  { id: "hih-cod-coffee-score", label: "Coffee (COD)", maxzoom: 8 },
  { id: "hih-cod-maize-score", label: "Maize (COD)", maxzoom: 8 },
  { id: "hih-cod-palmoil-score", label: "Palm oil (COD)", maxzoom: 8 },
  { id: "hih-cod-wheat-score", label: "Wheat (COD)", maxzoom: 8 },
  { id: "hih-cod-livestock-score", label: "Livestock (COD)", maxzoom: 8 },
  { id: "hih-caf-cassava-score", label: "Cassava (CAF)", maxzoom: 7 },
  { id: "hih-civ-cereal-score", label: "Cereal (CIV)", maxzoom: 8 },
  { id: "hih-civ-fruits-score", label: "Fruits (CIV)", maxzoom: 8 },
  { id: "hih-civ-vegetables-score", label: "Vegetables (CIV)", maxzoom: 8 },
  { id: "hih-civ-dairy-score", label: "Dairy (CIV)", maxzoom: 8 },
  { id: "hih-civ-livestock-score", label: "Livestock (CIV)", maxzoom: 8 },
  { id: "hih-fishfarm-closed", label: "Fish (closed)", maxzoom: 7 },
  { id: "hih-fishfarm-open", label: "Fish (open)", maxzoom: 7 },
  { id: "hih-fishfarm-extensive", label: "Fish (extensive)", maxzoom: 7 },
  { id: "hih-access-urban", label: "Access: urban", maxzoom: 7 },
  { id: "hih-access-urban-weighted", label: "Access: weighted", maxzoom: 7 },
  { id: "hih-access-port", label: "Access: port", maxzoom: 7 },
];

const PROBE_ZOOM = 8; // the best resolution ANY source reaches — capped per-source below

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
  const results = await Promise.all(
    SCORE_SOURCES.map(async (src) => {
      const z = Math.min(PROBE_ZOOM, src.maxzoom);
      const { tx, ty, px, py } = lonLatToTile(lon, lat, z);
      const imgData = await loadTileImageData(src.id, z, tx, ty);
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
    position: "absolute", right: "8px", top: "44px", zIndex: 10,
    background: "white", font: "18px sans-serif", padding: "8px 10px",
    borderRadius: "4px", boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
    width: "290px", display: "none"
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
        `<div style="font-weight:bold;margin-bottom:6px;">Scores</div>` +
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

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
// icon: a language-agnostic pictogram standing in for the commodity/theme —
// same reasoning as the emoji-only playback controls (D40) and the
// (COD)/(CAF)/(CIV) codes above: a picture or a code, never a natural-language
// word, in anything Cartographer renders on its own. flag: a real Unicode flag
// emoji, used only for the per-country commodity layers (fishfarm/access are
// already country-agnostic merged archives, D28, so they carry no flag). No
// emoji maps perfectly onto e.g. "cassava" or "demand-weighted accessibility" —
// these are approximate, recognizable pictograms, not literal claims about the
// data; `label` (still English) survives only as this widget's hover tooltip,
// not anything drawn directly on screen.
const SCORE_SOURCES = [
  { id: "hih-cod-cassava-score", label: "Cassava (COD)", maxzoom: 8, icon: "🍠", flag: "🇨🇩" },
  { id: "hih-cod-cocoa-score", label: "Cocoa (COD)", maxzoom: 8, icon: "🍫", flag: "🇨🇩" },
  { id: "hih-cod-coffee-score", label: "Coffee (COD)", maxzoom: 8, icon: "☕", flag: "🇨🇩" },
  { id: "hih-cod-maize-score", label: "Maize (COD)", maxzoom: 8, icon: "🌽", flag: "🇨🇩" },
  { id: "hih-cod-palmoil-score", label: "Palm oil (COD)", maxzoom: 8, icon: "🌴", flag: "🇨🇩" },
  { id: "hih-cod-wheat-score", label: "Wheat (COD)", maxzoom: 8, icon: "🌾", flag: "🇨🇩" },
  { id: "hih-cod-livestock-score", label: "Livestock (COD)", maxzoom: 8, icon: "🐄", flag: "🇨🇩" },
  { id: "hih-caf-cassava-score", label: "Cassava (CAF)", maxzoom: 7, icon: "🍠", flag: "🇨🇫" },
  { id: "hih-civ-cereal-score", label: "Cereal (CIV)", maxzoom: 8, icon: "🌿", flag: "🇨🇮" },
  { id: "hih-civ-fruits-score", label: "Fruits (CIV)", maxzoom: 8, icon: "🍎", flag: "🇨🇮" },
  { id: "hih-civ-vegetables-score", label: "Vegetables (CIV)", maxzoom: 8, icon: "🥬", flag: "🇨🇮" },
  { id: "hih-civ-dairy-score", label: "Dairy (CIV)", maxzoom: 8, icon: "🥛", flag: "🇨🇮" },
  { id: "hih-civ-livestock-score", label: "Livestock (CIV)", maxzoom: 8, icon: "🐄", flag: "🇨🇮" },
  { id: "hih-fishfarm-closed", label: "Fish (closed)", maxzoom: 7, icon: "🐟" },
  { id: "hih-fishfarm-open", label: "Fish (open)", maxzoom: 7, icon: "🐠" },
  { id: "hih-fishfarm-extensive", label: "Fish (extensive)", maxzoom: 7, icon: "🎣" },
  { id: "hih-access-urban", label: "Access: urban", maxzoom: 7, icon: "🏙️" },
  { id: "hih-access-urban-weighted", label: "Access: weighted", maxzoom: 7, icon: "🏘️" },
  { id: "hih-access-port", label: "Access: port", maxzoom: 7, icon: "⚓" },
];

const PROBE_ZOOM = 8; // the best resolution ANY source reaches — capped per-source below

// Shared with narrative playback (docs/index.html's applyNarrativeStep, D49) so
// a step's active layers get the same icon+flag treatment as this widget,
// instead of inventing a second, divergent icon table. Handles three shapes:
// a *-score id (looked up directly in SCORE_SOURCES), its *-final counterpart
// (same commodity, so the same icon+flag — the "site marker" pin communicates
// "this is the selected-site layer" without needing a whole separate icon
// language of its own), and the two country-agnostic GAEZ classification
// layers (their own fixed icon, since they have no SCORE_SOURCES entry).
function iconForLayerId(id) {
  if (id === "gaez-aez33" || id === "gaez-aez57") return { icon: "🗺️", flag: null, pin: false };
  const direct = SCORE_SOURCES.find((s) => s.id === id);
  if (direct) return { icon: direct.icon, flag: direct.flag || null, pin: false };
  if (id.endsWith("-final")) {
    const scoreId = id.slice(0, -"-final".length) + "-score";
    const match = SCORE_SOURCES.find((s) => s.id === scoreId);
    if (match) return { icon: match.icon, flag: match.flag || null, pin: true };
  }
  return { icon: "❓", flag: null, pin: false }; // unrecognized id — visible rather than silently blank
}

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
//
// Radial layout (replacing an earlier plain vertical list, hfu's request): one
// icon-bubble per valid score, arranged in a ring around the probe point itself
// rather than boxed off in a side panel — directly inspired by radial/compass-
// style controls (a fixed center, items arranged evenly around it). Three
// REDUNDANT visual channels encode the score value, not color alone (a real
// accessibility/color-management concern, not just aesthetics): (1) the ring's
// border color, drawn from the exact same 0-100 ramp the raster tiles
// themselves use (scoreRampColor) — never an independent color choice; (2) the
// bubble's diameter, larger for a higher score; (3) position — bubbles are
// sorted highest-first starting at 12 o'clock, going clockwise, so higher
// scores always cluster near the top regardless of color perception. The exact
// number is also drawn (a later revision, hfu's request) as a small, light-gray
// label under each bubble — reachable without hovering (the `title` tooltip
// alone isn't reachable on touch), but visually secondary on purpose: digits
// are the one kind of "text" this project treats as language-neutral (D40's
// ISO codes are the same judgment call), so this doesn't reopen the
// language-agnostic-chrome principle the way an English word would.
//
// Liquid/mobile-responsive (hfu's request): the ring's radius and bubble sizes
// are recomputed from the viewport's own short side (`vmin`-equivalent) on
// every render and on window resize/orientation change, not fixed pixel
// values — shrinks gracefully on a phone rather than overflowing it.
function radialGeometry() {
  const vmin = Math.min(window.innerWidth, window.innerHeight);
  const radius = Math.max(60, Math.min(150, vmin * 0.22));
  const sizeScale = radius / 110; // 110 = the reference desktop radius this was tuned at
  return { radius, sizeScale };
}

function initScoreProbe(map) {
  const radial = document.createElement("div");
  radial.id = "score-radial";
  Object.assign(radial.style, {
    position: "absolute", left: "50%", top: "50%", zIndex: 10,
    width: "0", height: "0", display: "none",
    opacity: "1", transition: "opacity 250ms ease"
  });
  map.getContainer().appendChild(radial);

  const probeRing = document.createElement("div");
  Object.assign(probeRing.style, {
    position: "absolute", left: "50%", top: "50%", zIndex: 9,
    width: "18px", height: "18px", transform: "translate(-50%,-50%)",
    pointerEvents: "none", borderRadius: "50%",
    border: "2px solid #c0392b", background: "rgba(192,57,43,0.15)"
  });
  map.getContainer().appendChild(probeRing);

  let scheduled = false;
  let lastValid = null; // cached, so a window resize can re-lay-out without re-probing tiles

  function render(valid) {
    // Unlike the AEZ tooltip (which restates the same classification a
    // narrative's own caption already gives, and stays hidden during
    // playback), this widget shows every OTHER commodity/theme's score at
    // the same point — content a narrative's caption never covers, since a
    // narrative only ever talks about the one theme it's built around
    // (hfu's correction, D49 follow-up). So it stays visible through
    // narrative playback too, not just free exploration.
    if (!valid || valid.length === 0) {
      radial.style.display = "none";
      return;
    }
    const { radius, sizeScale } = radialGeometry();
    const n = valid.length;

    // Size encodes RELATIVE standing among what's actually on screen right
    // now, not an absolute 0-100 position (hfu's catch: real scores cluster
    // in a narrow band, e.g. 40-70, so mapping that band onto the full 0-100
    // range made every bubble look almost the same size). Matches this
    // widget's own founding point (top of file): the interesting thing is the
    // relative difference AT ONE PLACE, so the sizing should be relative too.
    const values = valid.map((r) => r.value);
    const vMin = Math.min(...values), vMax = Math.max(...values);
    const sizeFor = (v) => vMax === vMin ? 34 : 22 + ((v - vMin) / (vMax - vMin)) * 30;

    // If a narrative is currently showing, find whichever bubble corresponds
    // to the theme it's actually about (its current step's own "-score"
    // layer) and glow it — hfu's suggestion, once the widget started staying
    // visible through playback (above): with every OTHER theme's score now
    // on screen too, the one the story is actually about should stand out.
    // Reuses the exact same gold pulse (.final-glow-ring/-core, D23) this
    // Cartographer already uses to mark a real FAO-selected site, rather than
    // inventing a second "this one matters" visual language.
    let focusedId = null;
    if (typeof currentNarrative !== "undefined" && currentNarrative && document.getElementById("narrative")?.classList.contains("active")) {
      const step = currentNarrative.steps[currentStep];
      focusedId = step?.layers.find((id) => SCORE_SOURCES.some((s) => s.id === id)) || null;
    }

    // Spread across the top arc only (roughly a semicircle), not the full
    // 360° — the bottom of the screen is where the narrative panel (and, in
    // free exploration, the collapsed layer panel) lives, so a full-circle
    // layout was hiding lower-ranked bubbles behind it (caught by hfu from an
    // actual screenshot). n=1 centers at straight up.
    const ARC_START = -175, ARC_END = -5;
    const positioned = valid.map((r, i) => {
      const angle = (n === 1 ? -90 : ARC_START + (ARC_END - ARC_START) * (i / (n - 1))) * (Math.PI / 180);
      return {
        r,
        x: Math.round(Math.cos(angle) * radius),
        y: Math.round(Math.sin(angle) * radius),
        size: Math.round(sizeFor(r.value) * sizeScale),
      };
    });

    // Two passes — every bubble first, then every number label — rather than
    // interleaved per-item: with sizing now relative (above) some bubbles are
    // much larger than others, and at a busy point (up to 13 sources) a big
    // neighbor can geometrically overlap an adjacent small bubble's label.
    // Painting all labels after all bubbles guarantees a number is never
    // covered by ANY bubble, regardless of size or draw order (hfu's catch,
    // from the same screenshot review as the top-arc fix above).
    const bubbles = positioned.map(({ r, x, y, size }) => {
      const [cr, cg, cb] = scoreRampColor(r.value);
      const borderW = Math.max(2, Math.round((2 + (r.value / 100) * 4) * sizeScale));
      const flagBadge = r.flag
        ? `<span style="position:absolute;right:-4px;bottom:-4px;font-size:${Math.round(size * 0.42)}px;line-height:1;">${r.flag}</span>`
        : "";
      const glow = r.id === focusedId
        ? `<span class="final-glow-ring" style="width:${size}px;height:${size}px;margin:${-size/2}px 0 0 ${-size/2}px;"></span>`
        : "";
      return `
        ${glow}
        <div title="${r.label}: ${r.value}" style="
          position:absolute; left:calc(50% + ${x}px); top:calc(50% + ${y}px);
          width:${size}px; height:${size}px; transform:translate(-50%,-50%);
          border-radius:50%; background:white;
          border:${borderW}px solid rgb(${cr},${cg},${cb});
          box-shadow:0 1px 4px rgba(0,0,0,0.35);
          display:flex; align-items:center; justify-content:center;
          font-size:${Math.round(size * 0.56)}px; line-height:1;
        ">${r.icon}${flagBadge}</div>
      `;
    }).join("");

    // The exact number: still visually secondary to color/size/position
    // (hfu's original "show it lightly" request), but a white halo
    // (text-shadow, several directions so it works on any map color
    // underneath) keeps it legible — plain gray alone disappeared against
    // busy tiles (hfu's follow-up correction).
    const numberLabels = positioned.map(({ r, x, y, size }) => `
      <div style="
        position:absolute; left:calc(50% + ${x}px); top:calc(50% + ${y + size / 2 + 2}px);
        transform:translate(-50%, 0); font-size:${Math.max(11, Math.round(13 * sizeScale))}px;
        color:#444; font-weight:600; line-height:1; pointer-events:none;
        text-shadow: 0 0 3px white, 0 0 3px white, 0 0 3px white, 0 0 5px white;
      ">${r.value}</div>
    `).join("");

    radial.innerHTML = bubbles + numberLabels;
    radial.style.display = "block";
    radial.style.opacity = "1"; // fresh data just painted — see sampleCenter's dim-while-fetching
  }

  function sampleCenter() {
    const z = Math.floor(map.getZoom());
    if (z < 3) { lastValid = null; radial.style.display = "none"; probeRing.style.display = "none"; return; }
    probeRing.style.display = "block";
    if (scheduled) return;
    scheduled = true;

    // hfu's request: the bubbles currently on screen describe the PREVIOUS
    // probe point, not wherever the map just settled at — dim them the
    // instant a new fetch starts (rather than leaving stale numbers looking
    // just as authoritative as fresh ones) and let render() snap opacity
    // back to 1 once real data actually arrives. The transition (above) is
    // what turns "fetch latency" into a legible visual cue instead of an
    // invisible delay.
    if (radial.style.display !== "none") radial.style.opacity = "0.35";

    const { lng, lat } = map.getCenter();
    probeScoresAt(lng, lat).then((results) => {
      scheduled = false;
      const valid = results.filter((r) => r.value !== null).sort((a, b) => b.value - a.value);
      lastValid = valid.length ? valid : null;
      render(lastValid);
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

  // Re-lay-out (not re-probe) on resize/orientation change, and whenever
  // narrative playback starts/stops (MutationObserver on its "active" class,
  // since nothing else here already hooks narrative start/stop events).
  window.addEventListener("resize", () => render(lastValid));
  const narrativeEl = document.getElementById("narrative");
  if (narrativeEl) {
    new MutationObserver(() => render(lastValid)).observe(narrativeEl, { attributes: true, attributeFilter: ["class"] });
  }
}

// Dynamic (mouseover) legend for the AEZ33 raster, inspired by kitavolca's approach:
// rather than a static list of all 33 classes sitting on screen at all times, show
// only the one relevant entry, right where the cursor is.
//
// Mechanism: MapLibre doesn't expose per-pixel *values* for a raster source the way
// it does attributes for vector features, but our tiles are an indexed PNG baked
// from FAO's own official colormap (D8) — so we can read the actual rendered pixel
// color back off the WebGL canvas and reverse-look-up which class produced it.
// Requires `preserveDrawingBuffer: true` on the Map, since WebGL clears its buffer
// by default and readPixels needs the frame still there.

// FAO GAEZ v4 Data Repository User's Guide, Dominant AEZ (33-class) legend —
// verified against the primary PDF, not just a web summary (see DECISIONS.md D13).
const AEZ33_CLASS_NAMES = {
  0: "No AEZ assigned",
  1: "Tropics, lowland — semi-arid",
  2: "Tropics, lowland — sub-humid",
  3: "Tropics, lowland — humid",
  4: "Tropics, highland — semi-arid",
  5: "Tropics, highland — sub-humid",
  6: "Tropics, highland — humid",
  7: "Subtropics, warm — semi-arid",
  8: "Subtropics, warm — sub-humid",
  9: "Subtropics, warm — humid",
  10: "Subtropics, moderately cool — semi-arid",
  11: "Subtropics, moderately cool — sub-humid",
  12: "Subtropics, moderately cool — humid",
  13: "Subtropics, cool — semi-arid",
  14: "Subtropics, cool — sub-humid",
  15: "Subtropics, cool — humid",
  16: "Temperate, moderate — dry",
  17: "Temperate, moderate — moist",
  18: "Temperate, moderate — wet",
  19: "Temperate, cool — dry",
  20: "Temperate, cool — moist",
  21: "Temperate, cool — wet",
  22: "Boreal/Cold, no permafrost — dry",
  23: "Boreal/Cold, no permafrost — moist",
  24: "Boreal/Cold, no permafrost — wet",
  25: "Dominantly very steep terrain",
  26: "Land with severe soil/terrain limitations",
  27: "Land with ample irrigated soils",
  28: "Dominantly hydromorphic soil",
  29: "Desert/Arid climate",
  30: "Boreal/Cold, with permafrost",
  31: "Arctic/Very cold climate",
  32: "Dominantly urban/built-up",
  33: "Dominantly water"
};

// FAO's own official colormap for AEZ33 (from the STAC item's renders.data.colormap —
// the same source used to build the PNG8 palette in D8). Class -> [r,g,b].
const AEZ33_PALETTE = [
  [255,255,255], [247,159,192], [232,79,121], [216,28,78],
  [255,157,255], [255,9,255], [196,0,196], [242,209,149],
  [236,159,0], [255,128,0], [254,248,129], [255,255,9],
  [217,255,0], [227,210,2], [172,159,2], [130,130,0],
  [169,255,83], [88,176,0], [51,102,0], [147,200,200],
  [104,179,179], [65,131,131], [136,196,255], [85,170,255],
  [0,128,255], [81,0,0], [147,88,0], [0,102,151],
  [0,171,253], [248,230,194], [140,140,255], [198,198,251],
  [230,0,0], [28,28,255]
]; // index === class number (0-33)

// Nearest-color match, not exact: globe projection reprojects the flat raster onto
// a sphere mesh and doesn't guarantee our baked palette's exact RGB survives that
// resampling pixel-for-pixel (unlike flat Mercator, where "nearest" raster-resampling
// keeps it exact). A small distance threshold still rejects background/other layers.
function nearestAezClass(r, g, b) {
  let best = -1, bestDist = Infinity;
  for (let cls = 0; cls < AEZ33_PALETTE.length; cls++) {
    const [pr, pg, pb] = AEZ33_PALETTE[cls];
    const d = (pr - r) ** 2 + (pg - g) ** 2 + (pb - b) ** 2;
    if (d < bestDist) { bestDist = d; best = cls; }
  }
  return bestDist <= 40 * 40 * 3 ? best : null; // reject if nothing is remotely close
}

// Same center-probeRing-and-pan interaction as score_probe.js (not free mouse
// hover) — see that file's comment for why: touch parity, and this project's
// push toward a buttonless, device-agnostic Cartographer. Shares one sampling
// anchor with the score probe (the map's own screen center) rather than each
// feature drawing its own probeRing.
function initAezLegend(map) {
  const tooltip = document.createElement("div");
  tooltip.id = "aez-tooltip";
  Object.assign(tooltip.style, {
    position: "absolute", left: "50%", top: "50%", zIndex: 20,
    transform: "translate(14px, 14px)", pointerEvents: "none",
    background: "rgba(0,0,0,0.8)", color: "white", font: "19px sans-serif",
    padding: "4px 8px", borderRadius: "4px", display: "none", maxWidth: "340px"
  });
  map.getContainer().appendChild(tooltip);

  let pending = false;

  function sampleCenter() {
    if (!activeRaster.has("gaez-aez33") || pending) return;
    pending = true;

    const canvas = map.getCanvas();
    const gl = map.painter && map.painter.context && map.painter.context.gl;
    const x = Math.round(canvas.width / 2);
    const y = Math.round(canvas.height / 2);

    // MapLibre v5's WebGL context isn't created with preserveDrawingBuffer, so a
    // buffer read outside the render loop comes back empty — sample synchronously
    // inside a forced 'render' event instead, where the frame is guaranteed valid.
    map.once("render", () => {
      pending = false;
      if (!gl) return;
      const pixel = new Uint8Array(4);
      gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
      if (pixel[3] < 10) { tooltip.style.display = "none"; return; } // transparent
      const cls = nearestAezClass(pixel[0], pixel[1], pixel[2]);
      if (cls === null) { tooltip.style.display = "none"; return; }
      const name = AEZ33_CLASS_NAMES[cls] || `Class ${cls}`;
      tooltip.textContent = `AEZ33 — ${cls}: ${name}`;
      tooltip.style.display = "block";
    });
    map.triggerRepaint();
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

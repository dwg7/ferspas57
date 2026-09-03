// Dynamic (center-probe) legend for AEZ57 — same mechanism as aez_legend.js (AEZ33),
// extended to the 57-class scheme.
//
// Provenance, important caveat: classes 0 and 49-57 are directly confirmed against
// the primary source (FAO/IIASA's GAEZ v5 GitHub wiki, "10. Agro-ecological Zones
// classification", github.com/un-fao/gaezv5.wiki — fetched 2026-09-03). Classes 1-48
// are FAO's own documented combinatorial scheme (8 Temperature Regime Classes ×
// {semi-arid, sub-humid, humid} moisture × {no/slight, moderate} soil-terrain
// limitations = 48), and the class *definitions* are exact — but the wiki's prose
// ("AEZ-01 to AEZ-06: combinations of TRC1 with M2-M4 and S3-S4") describes the
// grouping, not the literal enumeration order within each 6-class block. This file
// assumes moisture varies slower than soil/terrain (M2,S3),(M2,S4),(M3,S3),(M3,S4),
// (M4,S3),(M4,S4) — the natural reading of "M2-M4 and S3-S4" — but that specific
// ordering is inferred, not lifted verbatim from an explicit numbered table. If a
// mismatch is ever found (e.g. against FAO's own rendered legend), suspect this
// ordering first, not the class definitions themselves.

const AEZ57_CLASS_NAMES = (() => {
  const trcNames = {
    1: "Tropics, lowland", 2: "Tropics, highland", 3: "Subtropics, warm",
    4: "Subtropics, moderately cool", 5: "Subtropics, cool",
    6: "Temperate, moderate", 7: "Temperate, cool", 8: "Boreal/Cold, no permafrost"
  };
  const mNames = { 2: "semi-arid", 3: "sub-humid", 4: "humid" };
  const sNames = { 3: "no/slight soil-terrain limitations", 4: "moderate soil-terrain limitations" };

  const names = { 0: "No AEZ assigned" };
  let cls = 1;
  for (let trc = 1; trc <= 8; trc++) {
    for (const m of [2, 3, 4]) {
      for (const s of [3, 4]) {
        names[cls] = `${trcNames[trc]} — ${mNames[m]} — ${sNames[s]}`;
        cls++;
      }
    }
  }
  Object.assign(names, {
    49: "Dominantly very steep terrain",
    50: "Land with severe soil/terrain limitations",
    51: "Land with ample irrigated soils",
    52: "Dominantly hydromorphic soil",
    53: "Desert/Arid climate",
    54: "Boreal/Cold, with permafrost",
    55: "Arctic/Very cold climate",
    56: "Dominantly urban/built-up",
    57: "Dominantly water"
  });
  return names;
})();

// FAO's own official colormap for AEZ57 (from the STAC item's renders.data.colormap,
// same source/method as AEZ33 in D8). Index === class number (0-57).
const AEZ57_PALETTE = [
  [255,255,255],[232,79,121],[247,159,192],[216,28,78],[244,100,118],[176,0,0],
  [255,89,89],[255,9,255],[255,157,255],[196,0,196],[255,100,255],[128,0,128],
  [201,35,172],[236,159,0],[242,209,149],[205,142,27],[236,188,100],[230,115,0],
  [255,169,83],[251,251,0],[255,255,138],[222,215,1],[254,248,129],[183,183,0],
  [210,194,2],[128,255,0],[202,255,149],[88,176,0],[108,217,0],[51,102,0],
  [96,191,0],[128,255,0],[202,255,149],[88,176,0],[108,217,0],[51,102,0],
  [96,191,0],[114,184,184],[169,211,211],[73,148,148],[94,174,174],[44,88,88],
  [64,128,128],[83,169,255],[136,196,255],[0,128,255],[64,159,255],[0,83,166],
  [0,108,217],[81,0,0],[216,216,216],[0,118,174],[0,171,253],[248,230,194],
  [198,198,251],[140,140,255],[230,0,0],[28,28,255]
];

function nearestAez57Class(r, g, b) {
  let best = -1, bestDist = Infinity;
  for (let cls = 0; cls < AEZ57_PALETTE.length; cls++) {
    const [pr, pg, pb] = AEZ57_PALETTE[cls];
    const d = (pr - r) ** 2 + (pg - g) ** 2 + (pb - b) ** 2;
    if (d < bestDist) { bestDist = d; best = cls; }
  }
  return bestDist <= 40 * 40 * 3 ? best : null;
}

function initAez57Legend(map) {
  const tooltip = document.createElement("div");
  tooltip.id = "aez57-tooltip";
  Object.assign(tooltip.style, {
    position: "absolute", left: "50%", top: "50%", zIndex: 20,
    transform: "translate(14px, 34px)", pointerEvents: "none",
    background: "rgba(0,0,0,0.8)", color: "white", font: "12px sans-serif",
    padding: "4px 8px", borderRadius: "4px", display: "none", maxWidth: "260px"
  });
  map.getContainer().appendChild(tooltip);

  let pending = false;

  function sampleCenter() {
    if (!activeRaster.has("gaez-aez57") || pending) return;
    pending = true;
    const canvas = map.getCanvas();
    const gl = map.painter && map.painter.context && map.painter.context.gl;
    const x = Math.round(canvas.width / 2);
    const y = Math.round(canvas.height / 2);

    map.once("render", () => {
      pending = false;
      if (!gl) return;
      const pixel = new Uint8Array(4);
      gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
      if (pixel[3] < 10) { tooltip.style.display = "none"; return; }
      const cls = nearestAez57Class(pixel[0], pixel[1], pixel[2]);
      if (cls === null) { tooltip.style.display = "none"; return; }
      const name = AEZ57_CLASS_NAMES[cls] || `Class ${cls}`;
      tooltip.textContent = `AEZ57 — ${cls}: ${name}`;
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

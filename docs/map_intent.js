// Map Intent (staccato-spec's map-intent-vnext.md, spec_version "map-intent/v2")
// support — distinct from story.js's multi-step narrative extension (D19: the
// normative spec has a single render_hints camera state, no steps[] sequence; the
// narrative concept is this repo's own proposed extension, not to be confused with
// plain Map Intent).
//
// Per spec: YAML, and plain-text sharing is the REQUIRED baseline
// (sharing_policy.url_share SHOULD be false for a "faceless" Cartographer like this
// one) — so a paste-box is the primary path here, not a fallback. A URL-fragment
// path is also offered since the spec allows it as optional.

// Defensive against the two normative documents disagreeing with each other on
// shape: map-intent-vnext.md's schema shows {source_id, label} objects,
// staff-system-prompt.md's worked example shows plain ID strings. Accept both.
function normalizeLayerRefs(list) {
  if (!Array.isArray(list)) return [];
  return list.map((entry) => (typeof entry === "string" ? entry : entry.source_id)).filter(Boolean);
}

function parseMapIntent(yamlText) {
  const doc = jsyaml.load(yamlText);
  if (!doc || typeof doc !== "object") throw new Error("Map Intent did not parse to an object");
  if (doc.spec_version && doc.spec_version !== "map-intent/v2") {
    console.warn(`Map Intent spec_version "${doc.spec_version}" is not "map-intent/v2" — proceeding anyway, per §7's forward-compatibility rule.`);
  }
  const required = normalizeLayerRefs(doc.required_layers);
  const optional = normalizeLayerRefs(doc.optional_layers);
  return {
    goal: doc.goal || "",
    layers: [...required, ...optional],
    renderHints: doc.render_hints || {},
    provenance: doc.provenance || {},
  };
}

function applyMapIntent(intent) {
  activeRaster.clear();
  activeVector.clear();
  for (const id of intent.layers) {
    if (rasterLayers.some((l) => l.id === id)) activeRaster.add(id);
    if (vectorLayers.some((l) => l.id === id)) activeVector.add(id);
  }
  document.querySelectorAll('#panel input[type=checkbox]').forEach((cb) => {
    const id = cb.dataset.layerId;
    cb.checked = activeRaster.has(id) || activeVector.has(id);
  });
  refresh();

  const rh = intent.renderHints || {};
  const center = rh.initial_center || rh.center;
  const zoom = rh.initial_zoom ?? rh.zoom;
  if (center || zoom !== undefined) {
    map.flyTo({
      center: center || map.getCenter(),
      zoom: zoom !== undefined ? zoom : map.getZoom(),
      bearing: rh.bearing ?? map.getBearing(),
      pitch: rh.pitch ?? map.getPitch(),
      duration: 1500,
    });
  }

  const goalBox = document.getElementById("intent-goal");
  if (goalBox) goalBox.textContent = intent.goal;
}

function initMapIntentUI() {
  const btn = document.createElement("button");
  btn.id = "intent-open-btn";
  btn.textContent = "\u{1F4C4} Map Intent";
  const toolbar = document.getElementById("top-right-toolbar") || document.body;
  toolbar.appendChild(btn);

  const overlay = document.createElement("div");
  overlay.id = "intent-overlay";
  Object.assign(overlay.style, {
    position: "fixed", inset: "0", zIndex: 100, background: "rgba(0,0,0,0.4)",
    display: "none", alignItems: "center", justifyContent: "center",
  });
  overlay.innerHTML = `
    <div style="background:white;border-radius:8px;padding:16px;width:min(560px,90vw);max-height:80vh;display:flex;flex-direction:column;gap:8px;">
      <strong>Paste a Map Intent (YAML)</strong>
      <div id="intent-goal" style="font-size:12px;color:#555;min-height:1.2em;"></div>
      <textarea id="intent-textarea" style="width:100%;height:240px;font:12px monospace;" placeholder="spec_version: map-intent/v2\ngoal: ...\nrequired_layers:\n  - gaez-aez33\n..."></textarea>
      <div style="display:flex;gap:8px;justify-content:flex-end;">
        <button id="intent-cancel">Close</button>
        <button id="intent-apply">Apply</button>
      </div>
      <div id="intent-error" style="color:#c0392b;font-size:12px;"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  btn.addEventListener("click", () => { overlay.style.display = "flex"; });
  overlay.querySelector("#intent-cancel").addEventListener("click", () => { overlay.style.display = "none"; });
  overlay.querySelector("#intent-apply").addEventListener("click", () => {
    const text = overlay.querySelector("#intent-textarea").value;
    const errBox = overlay.querySelector("#intent-error");
    try {
      const intent = parseMapIntent(text);
      applyMapIntent(intent);
      errBox.textContent = "";
      overlay.style.display = "none";
    } catch (e) {
      errBox.textContent = "Failed to parse: " + e.message;
    }
  });

  // Optional URL-fragment path — staccato-spec ADR 0004's one-shot fragment
  // hand-off, not the required plain-text baseline (see D19). Per ADR 0004: read
  // at most once and clear via history.replaceState before rendering, so a URL
  // copied after the map renders is indistinguishable from one with no fragment.
  // Split on "&" rather than regex-matching "(?:^|&)intent=" — see story.js's
  // getStoryFromUrl for why: with MapLibre's hash:"map" removed, a shared
  // intent link's hash is often just "#intent=...", and the old regex's "^"
  // only matched at position 0, never right after the leading "#".
  const raw = location.hash.replace(/^#/, "");
  const parts = raw ? raw.split("&") : [];
  const idx = parts.findIndex((p) => p.startsWith("intent="));
  if (idx !== -1) {
    const encoded = parts[idx].slice("intent=".length);
    parts.splice(idx, 1);
    const rest = parts.length ? "#" + parts.join("&") : "";
    history.replaceState(null, "", location.pathname + location.search + rest);
    try {
      const yamlText = LZString.decompressFromEncodedURIComponent(decodeURIComponent(encoded));
      const intent = parseMapIntent(yamlText);
      map.once("load", () => applyMapIntent(intent));
    } catch (e) {
      console.error("failed to apply Map Intent from URL fragment", e);
    }
  }
}

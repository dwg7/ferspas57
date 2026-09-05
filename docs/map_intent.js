// Map Intent (staccato-spec's map-intent-vnext.md, spec_version "map-intent/v2")
// support — distinct from narrative.js's multi-step narrative extension (D19: the
// normative spec has a single render_hints camera state, no steps[] sequence; the
// narrative concept is this repo's own proposed extension, not to be confused with
// plain Map Intent). See NARRATIVE-FORMAT.md for the narrative document schema.
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
    if (cb.checked) cb.closest("details")?.setAttribute("open", "");
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
  btn.textContent = "\u{1F4C4}";
  btn.title = "Map Intent";
  const toolbar = document.getElementById("top-right-toolbar") || document.body;
  toolbar.appendChild(btn);

  const overlay = document.createElement("div");
  overlay.id = "intent-overlay";
  Object.assign(overlay.style, {
    position: "fixed", inset: "0", zIndex: 100, background: "rgba(0,0,0,0.4)",
    display: "none", alignItems: "center", justifyContent: "center",
  });
  overlay.innerHTML = `
    <div style="background:white;border-radius:8px;padding:16px;width:min(720px,90vw);max-height:80vh;display:flex;flex-direction:column;gap:8px;font-size:19px;">
      <strong>Paste — or drop a file — a Map Intent (YAML) or a narrative (JSON)</strong>
      <div id="intent-goal" style="font-size:19px;color:#555;min-height:1.2em;"></div>
      <textarea id="intent-textarea" style="width:100%;height:240px;font:19px monospace;" placeholder="spec_version: map-intent/v2\ngoal: ...\nrequired_layers:\n  - gaez-aez33\n...\n\n(or paste narrative JSON: {title, steps: [...]})"></textarea>
      <div style="display:flex;gap:8px;justify-content:flex-end;">
        <button id="intent-cancel">Close</button>
        <button id="intent-apply">Apply</button>
      </div>
      <div id="intent-error" style="color:#c0392b;font-size:19px;"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Shared by both the Apply button and file-drop (below) — the input surface
  // differs, the parsing/apply logic doesn't. Auto-detect: this repo's
  // narrative extension (JSON, {title, steps: [...]}) has no paste-box of its
  // own — a tool-less Staff can't produce narrative.js's LZString-compressed
  // #narrative= fragment any more than it can #intent='s, so this same overlay
  // doubles as the narrative paste path too (D32/STAFF-PROMPT.md's Narrative
  // Mode). Try JSON-with-steps first since valid YAML Map Intent text is
  // essentially never also valid JSON with a top-level "steps" array.
  function applyPastedText(text) {
    const errBox = overlay.querySelector("#intent-error");
    try {
      const maybeNarrative = JSON.parse(text);
      if (maybeNarrative && Array.isArray(maybeNarrative.steps)) {
        startNarrative(maybeNarrative);
        errBox.textContent = "";
        overlay.style.display = "none";
        return;
      }
    } catch {
      // Not JSON at all, or JSON without a .steps array — fall through to Map Intent.
    }
    try {
      const intent = parseMapIntent(text);
      applyMapIntent(intent);
      errBox.textContent = "";
      overlay.style.display = "none";
    } catch (e) {
      errBox.textContent = "Failed to parse: " + e.message;
    }
  }

  btn.addEventListener("click", () => { overlay.style.display = "flex"; });
  overlay.querySelector("#intent-cancel").addEventListener("click", () => { overlay.style.display = "none"; });
  overlay.querySelector("#intent-apply").addEventListener("click", () => {
    applyPastedText(overlay.querySelector("#intent-textarea").value);
  });

  // Drop-a-file path, alongside paste: the same JSON/YAML a Staff might show as
  // a code block can also be saved locally and dragged in directly — a plain
  // file read (FileReader/.text()), not a new format, so it reuses
  // applyPastedText() unchanged. Scoped to the textarea itself so a drag
  // passing over the rest of the page (or the map underneath) is unaffected.
  const textarea = overlay.querySelector("#intent-textarea");
  textarea.addEventListener("dragover", (e) => { e.preventDefault(); });
  textarea.addEventListener("drop", async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (!file) return;
    const text = await file.text();
    textarea.value = text;
    applyPastedText(text);
  });

  // Optional URL-fragment path — staccato-spec ADR 0004's one-shot fragment
  // hand-off, not the required plain-text baseline (see D19). readAndClearFragmentKey
  // (narrative.js) handles the read-once-and-clear mechanics shared by every
  // fragment key this Cartographer accepts.
  const encoded = readAndClearFragmentKey("intent");
  if (encoded !== null) {
    try {
      const yamlText = LZString.decompressFromEncodedURIComponent(decodeURIComponent(encoded));
      const intent = parseMapIntent(yamlText);
      map.once("load", () => applyMapIntent(intent));
    } catch (e) {
      console.error("failed to apply Map Intent from URL fragment", e);
    }
  }

  // #q= — a hand-typeable alternative to #intent=, for a Staff with no code
  // execution (see staccato-spec ADR 0009: Map Intent is the required baseline
  // vocabulary, not the exclusive one — this is exactly the kind of additional,
  // non-normative vocabulary that ADR exists to permit). An LLM prompted to
  // produce a URL cannot compute a real LZString compression by "thinking" —
  // it can only reliably hand-type a plain, deterministic key=value string.
  // Grammar and rationale below follow dwg7/chukei + dwg7/spiccato's own
  // #q= precedent (same key name, deliberately) — see STAFF-PROMPT.md.
  const qRaw = readAndClearFragmentKey("q");
  if (qRaw !== null) {
    try {
      const intent = parseShorthandFragment(qRaw);
      if (intent) map.once("load", () => applyMapIntent(intent));
      else console.error("Map Intent shorthand (#q=) had no usable req= layers");
    } catch (e) {
      console.error("failed to apply Map Intent shorthand (#q=) from URL fragment", e);
    }
  }
}

// A req= entry is "source_id" or "source_id|label" — same wire shape as
// spiccato's parseRefEntry, including the same defensive decodeURIComponent
// with fallback-to-raw-text on malformed percent-encoding (a hand-typed label
// with a lone "%" shouldn't reject the whole link). The label half is
// currently inert display-wise in this Cartographer (normalizeLayerRefs()
// already drops the label half of the YAML {source_id,label} form too — the
// checkbox panel always shows its own static config label) — included anyway
// for parity with the YAML path; this is a known no-op, not a bug to "fix".
function parseShorthandRefEntry(entry) {
  const sep = entry.indexOf("|");
  if (sep === -1) return { source_id: entry };
  const source_id = entry.slice(0, sep);
  const rawLabel = entry.slice(sep + 1);
  if (rawLabel === "") return { source_id };
  try {
    return { source_id, label: decodeURIComponent(rawLabel) };
  } catch {
    return { source_id, label: rawLabel };
  }
}

function parseShorthandRefList(raw) {
  if (!raw) return [];
  return raw.split(",").map((s) => s.trim()).filter((s) => s.length > 0).map(parseShorthandRefEntry);
}

// #q=req=<id1[|label1],id2,...>&lat=<deg>&lng=<deg>&zoom=<n>&goal=<text>&name=<text>
// Deliberately narrower than spiccato's own #q= grammar: no catalog=/type=
// (this Cartographer has exactly one fixed catalog; applyMapIntent() doesn't
// route by catalog at all — confirmed by reading it, not assumed), no opt=
// (normalizeLayerRefs() already flattens required/optional into one list and
// applyMapIntent() activates every id identically — no "off by default" UI
// distinction exists here to justify the split), no bbox= (parseMapIntent()
// never even stores doc.area — only render_hints.initial_center/initial_zoom
// drive the camera). lat/lng (not [lng,lat]) matches how a Staff would
// actually say a coordinate in prose, reducing transposition risk.
// Returns null for anything unusable (no req= layers at all), matching
// parseMapIntent's own "throw and let the caller decide" convention loosely —
// here a null return lets the caller log and move on rather than crash.
function parseShorthandFragment(body) {
  const params = new URLSearchParams(body);
  const required = parseShorthandRefList(params.get("req"));
  if (required.length === 0) return null;

  const lat = params.get("lat");
  const lng = params.get("lng");
  const renderHints = {};
  if (lat !== null && lng !== null) {
    renderHints.center = [Number(lng), Number(lat)];
    const zoom = params.get("zoom");
    if (zoom !== null) renderHints.zoom = Number(zoom);
  }

  return {
    goal: params.get("goal") || "",
    layers: required.map((r) => r.source_id),
    renderHints,
    provenance: {
      generated_by: "ferspas57-shorthand",
      generated_at: new Date().toISOString(),
    },
  };
}

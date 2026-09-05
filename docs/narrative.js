// Narrative playback. A narrative is a small JSON document — see
// NARRATIVE-FORMAT.md for the schema — a sequence of
// {center, zoom, layers, caption} steps. It's compressed and carried in the
// URL fragment (#narrative=...), never sent to any server — matches
// Staccato's "Staff hands the User a link" model without needing a backend
// or POST. (2026-09-05: renamed from "story" throughout this project —
// "narrative" is the settled term, matching STAFF-PROMPT.md's "Narrative
// Mode" and staccato-spec ADR 0009's "narrative JSON"; the old #story=
// fragment key and SAMPLE_STORY/startStory-family identifiers are gone, not
// kept as aliases, since this predates any real external consumer.)
//
// Staff's job is to SELECT a pre-authored narrative from NARRATIVES.md, not
// generate one live (see DECISIONS.md D34 item 2, D37) — this file only
// plays back whatever narrative JSON it's given.
//
// This library's own narratives (samples/*.json, SAMPLE_NARRATIVE below) are
// authored in English ONLY, matching the language of the underlying FAO source
// data/documentation they're built from (DECISIONS.md D39). Pre-baking every
// narrative into many languages was tried and deliberately reverted: content
// forked across languages drifts out of sync as the English source is revised
// (a "lost in translation" failure mode), and it's needless upfront work for
// something a live Staff can already do better, with the actual conversation's
// context (requested language, audience, register), at the moment it's asked
// for — see NARRATIVE-FORMAT.md's "Whose job is the language?". pickLang()
// below still supports language-keyed objects for whatever a Staff-translated
// narrative document hands this Cartographer, but nothing in this codebase
// constructs one anymore.

const SAMPLE_NARRATIVE = {
  narrative_version: "ferspas57-narrative/v1",
  title: "DR Congo: A Small Mystery in Maize Storage",
  steps: [
    {
      center: [29.44, 0.50], zoom: 8,
      layers: ["gaez-aez33"],
      caption: "Right on the equator, in northeastern DR Congo. This area falls under GAEZ zone “3: Tropics, lowland, humid” — textbook favorable conditions for growing maize."
    },
    {
      center: [29.44, 0.50], zoom: 10,
      layers: ["gaez-aez33", "hih-cod-maize-score"],
      caption: "Overlaying FAO’s maize storage suitability score, this spot scores 57.4 — decent, but not outstanding."
    },
    {
      center: [29.57, -0.87], zoom: 11,
      layers: ["hih-cod-maize-score", "hih-cod-maize-final"],
      caption: "Yet the site FAO actually selected (the red polygon) lies about 150km to the south. Its GAEZ zone is “26: Land with severe soil/terrain limitations” — supposedly unfavorable — but it scores 65.5, actually higher than the site to the north."
    },
    {
      center: [29.57, -0.87], zoom: 11,
      layers: ["gaez-aez33", "hih-cod-maize-score", "hih-cod-maize-final"],
      caption: "Why would the “constrained” land score higher? FAO’s Hand-in-Hand scores are actually a GIS-based multi-criteria evaluation combining climatic suitability with accessibility and poverty-reduction priority. Given the Initiative’s real mission — ending poverty and hunger (SDG1/SDG2) — it makes sense that a place which improves people’s lives could be chosen even if it isn’t agronomically ideal."
    }
  ]
};

function encodeNarrative(narrative) {
  const json = JSON.stringify(narrative);
  return LZString.compressToEncodedURIComponent(json);
}

function decodeNarrative(encoded) {
  const json = LZString.decompressFromEncodedURIComponent(encoded);
  return json ? JSON.parse(json) : null;
}

// staccato-spec ADR 0004 (one-shot fragment hand-off): a fragment-carried intent
// MUST be read at most once and cleared via history.replaceState before any
// rendering derived from it occurs, so a URL copied after the map renders is
// indistinguishable from one with no fragment at all — not bookmarkable/replayable
// map state. Shared by every fragment-carried key this Cartographer accepts
// (#intent=, #narrative=, #q=) rather than reimplemented per key — D21/D22 already
// found and fixed a real ADR-0004 compliance bug from exactly this kind of
// duplication. Lives here (loaded first, before map_intent.js) so every reader
// can call it regardless of script order; actual calls only happen inside
// init()'s map.on("load", ...), by which point every script has already loaded.
//
// The whole hash is treated as ONE key's value (not "&"-split into multiple
// coexisting top-level keys) — found the hard way while adding #q=: unlike
// #intent=/#narrative= (opaque LZString blobs with no literal "&" inside), #q='s
// own value is itself a multi-param blob using "&" as an internal delimiter
// (req=...&lat=...&lng=...), which collides with any scheme that treats "&"
// as a top-level key separator. The old multi-key "&"-joined design existed
// only to coexist with MapLibre's own hash:"map" reflection (removed, D22) —
// with that gone, none of #intent=/#narrative=/#q= are ever actually combined in
// one URL (each is a complete, standalone hand-off), so there's nothing left
// to preserve after clearing: the whole hash is consumed and cleared as a unit.
function readAndClearFragmentKey(key) {
  const raw = location.hash.replace(/^#/, "");
  if (!raw.startsWith(key + "=")) return null;
  const value = raw.slice(key.length + 1);
  history.replaceState(null, "", location.pathname + location.search);
  return value;
}

function getNarrativeFromUrl() {
  const encoded = readAndClearFragmentKey("narrative");
  if (encoded === null) return null;
  try {
    return decodeNarrative(decodeURIComponent(encoded));
  } catch (e) {
    console.error("failed to decode narrative from URL", e);
    return null;
  }
}

function setNarrativeInUrl(narrative) {
  const encoded = encodeNarrative(narrative);
  const raw = location.hash.replace(/^#/, "");
  const parts = raw ? raw.split("&").filter((p) => !p.startsWith("narrative=")) : [];
  parts.push("narrative=" + encoded);
  location.hash = parts.join("&");
}

function pickLang(field, lang) {
  if (typeof field === "string") return field; // backward-compat: plain string caption
  return field[lang] || field.en || Object.values(field)[0];
}

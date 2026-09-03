# ADR 0009 (draft, not yet proposed upstream): Optional `narrative` Sequence on Map Intent

Status: Draft — prepared in `dwg7/ferspas57`, not yet opened as a PR against `UNopenGIS/staccato-spec`. Owed since `DECISIONS.md` D6/D12/D19, reaffirmed D21/D22. Follows the section structure and register of `staccato-spec`'s existing ADRs (0001, 0004, 0005, 0007 read directly for template/tone before drafting this).

Date: 2026-09-04
Deciders: (staccato-spec maintainers, once proposed)

## Context

`map-intent-vnext.md`'s `render_hints` describes exactly one camera state (`initial_center`, `initial_zoom`, optional `bearing`/`pitch`) alongside one set of `required_layers`/`optional_layers`. This is sufficient for a Map Intent whose job is "show this view" — the majority case the spec was designed around.

It is not sufficient for a Staff whose answer to a user's question is better told as a short sequence of views than a single one — e.g. "here is a place with favorable conditions on paper; here is the actual site that was chosen instead; here is why." `dwg7/ferspas57` (a `martin catalog` Cartographer implementation for FAO's Hand-in-Hand Initiative and GAEZ data) built exactly this: a working narrative-playback prototype (`docs/story.js`) that plays a `{title, steps: [{center, zoom, layers, caption}, ...]}` document via sequential `flyTo()` calls, checkbox-state changes, and a caption panel, gated behind a "Narrative Mode" heuristic in its own Staff prompt (use this when the user's question invites a story or a "why," not just "show me X"). A real, verified example exists: a 4-step narrative built from an actual finding in FAO's Hand-in-Hand data (why a site with worse agro-ecological classification scored higher than a seemingly better one nearby, because Hand-in-Hand's siting score is itself a multi-criteria evaluation combining climate suitability with accessibility and poverty-reduction priority) — see `dwg7/ferspas57`'s `DECISIONS.md` and `docs/story.js`'s `SAMPLE_STORY`.

This prototype was deliberately built and labeled as **this repo's own extension, not part of the Map Intent spec** (ferspas57's `STAFF-PROMPT.md` and `map_intent.js` both say so explicitly), specifically to avoid silently diverging from the spec without proposing the divergence back. This ADR is that proposal.

None of the existing ADRs address this. ADR 0004/0005 govern *how* a Map Intent's URL/fragment is transported, not its internal shape. ADR 0007/0008 extend Map Intent with style-selection fields, which is the closest precedent for "add an optional field to Map Intent for a real, demonstrated need" — this ADR follows that same pattern for narrative sequencing.

## Decision

Add an optional top-level `narrative` field to the Map Intent schema:

```yaml
spec_version: "map-intent/v2"
goal: "..."
area: { ... }
catalog_context: { ... }
required_layers: [ ... ]   # unchanged: MUST still be populated with a sensible
                            # single-state fallback (see Consequences) even
                            # when narrative is present
render_hints: { ... }      # unchanged: same fallback requirement
narrative:
  steps:
    - caption: "Right on the equator, in northeastern DR Congo. This area
        falls under GAEZ zone 3 — textbook favorable conditions for maize."
      required_layers:
        - source_id: "gaez-aez33"
          label: "AEZ33 classification"
      render_hints:
        initial_center: [29.44, 0.50]
        initial_zoom: 8
    - caption: "Overlaying FAO's maize storage suitability score, this spot
        scores 57.4 — decent, but not outstanding."
      required_layers:
        - source_id: "gaez-aez33"
        - source_id: "hih-cod-maize-score"
      render_hints:
        initial_center: [29.44, 0.50]
        initial_zoom: 10
    # ... further steps
provenance: { ... }
```

Each `narrative.steps[]` entry reuses the **existing** `required_layers` item shape and `render_hints` shape verbatim — no new vocabulary for "what layers" or "what camera state" is introduced; only the sequencing container is new. `caption` is the one genuinely new field, required per step, plain text or a `{lang: text, ...}` map for multi-language captions (ferspas57's own prototype already does the latter; the spec should permit both, defaulting to a single string when multi-language isn't needed).

**Backward compatibility requirement**: a Map Intent that includes `narrative` MUST still populate its top-level `required_layers`/`render_hints` with a coherent single-state summary (in practice: the first step's, or an overview state) — a Cartographer with no narrative support renders that and ignores `narrative` entirely, degrading gracefully to "shows one correct view" rather than failing or showing nothing. A Cartographer with narrative support may render the top-level fields first as consistent with its own step 1, or treat `narrative` as authoritative and skip straight to playing it — implementations may choose either starting behavior, but MUST NOT require `narrative` for basic renderability.

**Sharing/URL mechanics are unaffected**: `narrative`-bearing documents remain plain Map Intent YAML, subject to the same paste-box baseline (ADR 0001) and same one-shot fragment hand-off option (ADR 0004) as any other Map Intent — no new transport mechanism is introduced by this ADR.

## Consequences

Positive:

- Lets a Staff answer "why" questions with an ordered explanation instead of forcing either a single static view (losing the narrative arc) or an out-of-spec ad hoc document shape (ferspas57's current situation, which this ADR resolves).
- Reuses 100% of Map Intent's existing per-layer and per-camera-state vocabulary — a Cartographer that already renders `required_layers`+`render_hints` correctly only needs to add a playback loop, not a new rendering model.
- The mandatory top-level fallback state means this is purely additive: every Map Intent consumer written against the spec *before* this ADR continues to work unmodified against a `narrative`-bearing document — it simply never looks at the field it doesn't know about.

Negative / trade-offs:

- Two ways to represent "what happens when this Map Intent is opened" (top-level fields vs. `narrative`) means implementers must decide which one is authoritative when both are present; this ADR resolves that ambiguity by making the top-level fields the required minimum and `narrative` a strictly optional enhancement, but a future Cartographer author could still reasonably ask "why isn't the fallback state just narrative.steps[0]" — worth revisiting if this proves confusing in practice.
- `caption` as free text (or a language map) is presentation content embedded in what has otherwise been a purely structural/data-selection document — a step away from Map Intent's original "what to show," not "what to say about it" scope. Accepted here because the caption is the entire point of a narrative (a wordless sequence of views is just `required_layers` changing underneath the user with no explanation), but implementers should not treat this as license to add other presentation concerns to Map Intent without their own justification.
- No guidance is given on playback pacing, autoplay, or manual step navigation — deliberately left as a Cartographer UI concern, not a spec concern, matching how the spec doesn't dictate panel layout for ordinary layer selection either.

## Alternatives Considered

1. **A wholly separate "Narrative Intent" document type, referencing a sequence of ordinary Map Intents by ID or inline.**
   Rejected for the initial proposal: adds a new top-level concept to the spec (a second document type, a new relationship between documents) for a need that's fully satisfiable by one optional field on the existing document. Worth reconsidering only if narrative use cases grow complex enough to need their own versioning/sharing lifecycle independent of a single Map Intent's.

2. **Leave this entirely to individual Cartographer implementations, as ferspas57 currently does, with no spec involvement.**
   Rejected: this is the status quo, and it means every Cartographer that wants narrative support reinvents an incompatible shape — exactly the kind of silent divergence `CLAUDE.md`'s (ferspas57's own project conventions) "route learnings back to staccato-spec" principle exists to prevent. ferspas57's own prototype already avoided calling itself spec-compliant for this reason.

3. **Model each step as a full, independent Map Intent, with the "narrative" being an ordered array of complete Map Intent documents.**
   Rejected as needlessly heavy: each step in a real narrative (see ferspas57's example) typically repeats the same `area`/`catalog_context` and only varies `required_layers`/`render_hints`/caption — forcing every step to restate the full document shape multiplies boilerplate for no benefit, when the varying fields can just be nested directly.

## Status

Draft. Not yet opened as a PR against `staccato-spec`. Intended next step: hfu (or whoever picks this up in `dwg7/ferspas57`) opens this as an actual PR/issue against `UNopenGIS/staccato-spec`, citing this file and `dwg7/ferspas57`'s live `docs/story.js` implementation as the reference-implementation evidence, following the same pattern ADR 0004 used citing `hfu/faceless-cartographer`.

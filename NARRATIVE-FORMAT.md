# Narrative Format

Status: v1 — 2026-09-05

This document defines the **narrative** document — this repo's own Staff→Cartographer
artifact for guided, multi-step, commentary-bearing map tours. It exists alongside
Map Intent (`staccato-spec`'s `map-intent-vnext.md`), not instead of it: Map Intent
is the required baseline vocabulary for this architecture; a narrative is an
additional, implementation-specific vocabulary that `staccato-spec` ADR 0009
explicitly permits without requiring spec-level standardization (see `DECISIONS.md`
D29–D31, and the ADR itself, [`UNopenGIS/staccato-spec#6`](https://github.com/UNopenGIS/staccato-spec/pull/6)).
Map Intent describes one camera/layer state; a narrative describes a *sequence* of
them, each with its own caption — a genuinely different shape, not a superset.

**"Narrative" is this project's settled term, not "story"** — matching
`STAFF-PROMPT.md`'s "Narrative Mode" and the ADR's own "narrative JSON" language.
Earlier code and docs (pre-2026-09-05) used "story" throughout (`story.js`,
`SAMPLE_STORY`, `#story=`); that naming has been fully replaced, not kept as an
alias, since this predates any real external consumer of the old names.

## Why this document exists

`docs/narrative.js`'s inline comments described this shape informally from the
start (D15 onward). This document promotes that informal shape to a first-class,
reviewable interface — the same kind of treatment Map Intent gets from
`staccato-spec`, scoped to what this repo actually needs. Hardening the format here
is a precondition for the actual point of building it: with a stable format, Staff's
job for narrative-shaped questions stops being "generate a document in this shape"
(open-ended, fabrication-prone, unverifiable by a tool-less agent) and becomes
"select the closest match from `NARRATIVES.md`'s pre-authored library" (a bounded,
verifiable choice) — see "Responsibility split" below and `DECISIONS.md` D34 item 2.

## Schema

```json
{
  "narrative_version": "ferspas57-narrative/v1",
  "title": { "en": "...", "fr": "...", "...": "..." },
  "steps": [
    {
      "center": [lng, lat],
      "zoom": 8,
      "layers": ["source-id-1", "source-id-2"],
      "caption": { "en": "...", "fr": "...", "...": "..." }
    }
  ]
}
```

- **`narrative_version`** (optional, recommended): a forward-compatibility tag,
  mirroring Map Intent's `spec_version`. The Cartographer does not currently
  validate this — an unrecognized value is not an error — but future readers may
  warn on mismatch the same way `parseMapIntent()` does. Current value:
  `"ferspas57-narrative/v1"`.
- **`title`**: a language-keyed object (see "Language keys" below). A plain string
  is also accepted (`pickLang()` returns a bare string field unchanged) for a
  narrative that hasn't been translated yet — don't invent translations you can't
  verify; an English-only `title`/`caption` is a legitimate, incomplete-but-honest
  narrative, not a malformed one.
- **`steps`**: an ordered array, each step a full, self-contained camera+layer+text
  state (not a diff from the previous step) — the Cartographer replaces the active
  layer set and flies the camera fresh on every step, it does not merge.
  - **`center`**: `[lng, lat]` — note the order matches GeoJSON/Map-Intent-style
    `[lng, lat]`, NOT `#q=`'s `lat=&lng=` prose order (`#q=` deliberately chose the
    opposite order to match how a Staff would say a coordinate in speech — see
    `STAFF-PROMPT.md`; the two are unrelated conventions, don't assume one from the
    other).
  - **`zoom`**: a MapLibre zoom level (number).
  - **`layers`**: an array of `source_id`s from this deployment's catalog (see
    `STAFF-PROMPT.md`'s "Available layers"). No required/optional distinction (a
    narrative step activates every listed layer identically — same reasoning as
    `#q=`'s `req=`-only design, no `opt=`).
  - **`caption`**: language-keyed prose for this step, shown while it's active.

## Language keys

Any of the 10 codes `docs/narrative.js`'s `LANGUAGES` array declares intent to
support: `en, fr, es, ru, zh, ar, de, ja, it, sw`. Not every narrative needs every
language — `pickLang(field, lang)` falls back to `.en`, then to the first available
value, then (for a plain string) the string itself. **Never invent a translation you
haven't actually produced or verified** — an incomplete language set is honest;
a fabricated one is not distinguishable from a correct one to a reader who doesn't
speak that language, which is exactly the failure mode this project's
anti-fabrication discipline (`STAFF-PROMPT.md`) exists to avoid.

## Whose job is the language?

A narrative's **content** — steps, coordinates, layers, and the substantive claims
a caption makes (a score, a classification, a finding) — is fixed at authoring
time and verified against real data (see "Responsibility split" below); Staff must
never alter or invent this. A narrative's **language of expression** is a
different concern, and it is explicitly Staff's job, not something baked in once
by whoever authored the narrative and left alone forever.

**The target shape**: a user should be able to ask, in the same breath as their
question, for a response in whichever language they prefer — e.g.
"コンゴ民主共和国のキャッサバの投資見込みについて知りたい。フランス語でお願い"
("I'd like to know about DR Congo's cassava investment prospects. In French,
please") — and get back a narrative actually rendered in French, not just
whichever language happened to be typed in first when the narrative was authored.
This is a real project goal (hfu, 2026-09-05; `DECISIONS.md` D38), not a nice-to-have
detail. Translating an already-verified caption into another language is not the
same kind of act as inventing a score or a classification: the underlying claim
doesn't change, only how it's said — which is why the "Language keys" caution
above ("never invent a translation you haven't actually produced or verified") is
about not silently guessing at a translation's *accuracy*, not a blanket rule
against Staff ever touching the natural-language layer. Producing that layer
correctly, in the language actually requested, is squarely Staff's responsibility.

**Two tiers this probably splits into** (proposed shape, not yet built or decided
in detail):

1. **Selecting among languages a narrative already has stored.** `NARRATIVES.md`'s
   one existing entry already carries all 10 target languages. The likely
   mechanism: a plain (uncompressed, hand-typeable) `?lang=fr` query-string
   parameter alongside the pre-built `#narrative=` link — deliberately a query
   parameter, not another fragment key, so it doesn't reopen the "whole hash is
   one key's value" simplification D32 settled on for `#intent=`/`#narrative=`/`#q=`.
   Staff can freely append this itself (no compression involved, same reasoning as
   why `lat=`/`lng=`/`goal=` in `#q=` are hand-typeable) without touching the
   opaque blob at all.
2. **A language the stored narrative doesn't have yet.** This needs actual
   translation, which only the paste-box path (not a link) can carry, since it
   produces a genuinely different document. If Staff does this, the structural
   fields (`steps[].center`/`zoom`/`layers`, and the substantive claim inside each
   caption) must stay identical to the verified original — only the language of
   the prose changes. This is real generation of a document, but of *expression*,
   not of *fact*, which is why it doesn't reopen D37's anti-fabrication concern.

**Current gap, stated honestly**: neither tier is built yet. `docs/narrative.js`'s
playback hardcodes `const lang = "en"` unconditionally, regardless of what
languages a narrative document actually carries or what a user asked for — there
is no `?lang=` reader today, and no verification step for tier 2's "only the prose
changed" constraint. See `HANDOVER.md`'s open items and `STAFF-PROMPT.md`'s
Narrative Mode section for how Staff should handle a language request given this
gap in the meantime (say so plainly, don't silently serve English or overclaim
support that doesn't exist yet).

## Transport

A narrative travels the same way Map Intent does — as plain text, per this
architecture's "faceless Cartographer" baseline — via two paths:

1. **Paste-box (required baseline)**: the Cartographer's Map Intent paste overlay
   (`📄` button) auto-detects a pasted narrative — `JSON.parse` succeeds and the
   result has a `.steps` array — and routes to `startNarrative()` instead of
   `parseMapIntent()`. One textarea, one Apply button, two possible outcomes.
2. **URL fragment (optional enhancement, ADR 0004-compliant)**: `#narrative=<LZString-
   compressed JSON, compressToEncodedURIComponent>`, read once and cleared via
   `history.replaceState` before use (`docs/narrative.js`'s `getNarrativeFromUrl()`)
   — a copied URL after the map renders carries no narrative, matching every other
   fragment key this Cartographer accepts (`#intent=`, `#q=`).

There is no `#q=`-style hand-typeable shorthand for narratives, and there does not
need to be one: `#q=`'s entire reason for existing is that a tool-less Staff cannot
compute a real LZString compression "in its head" and must hand-type something
character-by-character instead. A narrative is never hand-typed by Staff at all —
it is pre-authored (by a human/Claude Code session working in this repo, verified
against real data) and pre-encoded once into `NARRATIVES.md`'s link list. Staff's
job is to copy one of those already-valid links, not construct one.

## Responsibility split

This is the concrete payoff of hardening the format: with a stable schema and a
pre-authored library, the three roles' jobs are simple and separate.

- **This repo's maintainers (human + Claude Code sessions)**: author new narratives
  against real, verified data (same discipline as `DECISIONS.md` D13/D35's
  `gdallocationinfo`-based site checks — never invent a score, a classification, or
  a site count), add each as a `samples/narrative-*.json` file, generate its
  `#narrative=` link, and list it in `NARRATIVES.md` with a short description of
  the question it answers.
- **Staff** (`STAFF-PROMPT.md`): for a question that invites a narrative rather than
  a single view, select the closest-matching entry from `NARRATIVES.md` and hand
  the user its link directly — no generation, no fabrication surface, a bounded
  choice among already-verified options. If nothing in the library fits, say so
  plainly (same Anti-Fabrication discipline as an unlisted `source_id`) rather than
  improvising a new narrative on the spot. **Separately, and just as much Staff's
  job**: serving the narrative in whatever language the user actually asked for —
  see "Whose job is the language?" above. This is not covered by "no generation" —
  that rule is about facts, not language.
- **Cartographer** (`docs/narrative.js` + `docs/map_intent.js`'s paste-box wiring):
  plays back whatever valid narrative document it's given, from either transport.
  It has no opinion about where the document came from and does not change based on
  this split — this split is entirely a Staff-side scoping decision (`DECISIONS.md`
  D34 item 2), not a Cartographer capability change.

## Examples

- `samples/narrative-cod-maize-mystery.json` — the DR Congo maize-storage-siting
  narrative (`DECISIONS.md` D13/D16's verified finding), the first entry in
  `NARRATIVES.md`'s library and the reference example for this format.

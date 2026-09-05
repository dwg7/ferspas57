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
  "title": "...",
  "steps": [
    {
      "center": [lng, lat],
      "zoom": 8,
      "layers": ["source-id-1", "source-id-2"],
      "caption": "..."
    }
  ]
}
```

- **`narrative_version`** (optional, recommended): a forward-compatibility tag,
  mirroring Map Intent's `spec_version`. The Cartographer does not currently
  validate this — an unrecognized value is not an error — but future readers may
  warn on mismatch the same way `parseMapIntent()` does. Current value:
  `"ferspas57-narrative/v1"`.
- **`title`**: a plain string, in whatever language the document is currently
  in (see "Language keys" below — this Library's own entries are English,
  matching their FAO source material). A language-keyed object
  (`{ "en": "...", "fr": "..." }`) is also accepted (`pickLang()` picks a field
  out of it) — the shape a live Staff translation ends up in if it hands the
  Cartographer a copy carrying more than one language at once, though a single
  plain string per language is the more common and simpler case.
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
  - **`caption`**: a plain string (or language-keyed object, see "Language keys"
    below) of prose for this step, shown while it's active.

## Language keys

`NARRATIVES.md`'s entries are **English only**, matching the language of the
FAO source data/documentation they're built from (`DECISIONS.md` D39). An
earlier version of this project pre-translated every narrative into 10
languages up front and baked the results into the Library; that was tried and
deliberately reverted. Two problems with it, both raised by hfu directly: it
doesn't scale (every new narrative needs 10x the authoring work, for
languages nobody may ever ask for), and pre-baked translations rot — as the
English source gets revised, nothing forces the other 9 copies to keep up,
so content quietly forks and drifts ("lost in translation" as a maintenance
failure mode, not just a linguistic one). A single English source of truth
per narrative doesn't have this problem, because there's nothing else to
drift out of sync with it. See "Whose job is the language?" below for where
the actual translation work happens instead.

The document format itself still supports a language-keyed object
(`pickLang(field, lang)` picks a value out of `{ "en": "...", "fr": "..." }`,
falling back to `.en`, then the first available value, then — for a plain
string — the string itself) — this isn't dead code, it's what a Staff-made
translated copy naturally is if it carries more than one language in the same
document. But nothing in this repo constructs a multi-language document
anymore, and the Library's own files never will.

## Whose job is the language?

A narrative's **content** — steps, coordinates, layers, and the substantive
claims a caption makes (a score, a classification, a finding) — is fixed at
authoring time, verified against real data, and lives in `NARRATIVES.md` in
English (see "Language keys" above and "Responsibility split" below). Staff
must never alter or invent this. A narrative's **language of expression** —
and more generally, *how it's said*: which language, how technical, how much
background to spell out, what register fits the person asking — is a wholly
different concern, and it is entirely Staff's job.

**The target shape**: a user should be able to ask, in the same breath as
their question, for a response suited to them — e.g.
"コンゴ民主共和国のキャッサバの投資見込みについて知りたい。フランス語でお願い"
("I'd like to know about DR Congo's cassava investment prospects. In French,
please") — and get a narrative actually rendered in French, adapted with
whatever else that conversation's context calls for. This is a real project
goal (hfu, 2026-09-05; `DECISIONS.md` D38/D39), not a nice-to-have detail.

**How this actually works, mechanically**: Staff reads the relevant English
`NARRATIVES.md` entry (its `samples/*.json` source, or the decoded
`#narrative=` link — either is plain text Staff can read) and, live, in the
conversation, produces a translated/adapted copy — structural fields
(`steps[].center`/`zoom`/`layers`, and each caption's substantive claim) held
byte-identical to the verified original, only the language and phrasing of
the prose changing. What happens to that copy next depends on whether Staff's
runtime gives it real code execution (D42): with it, Staff computes an actual
`#narrative=` link itself (see "Transport" below) and hands over a clickable
link, same as an as-authored narrative; without it, Staff hands the copy to
the user via the Cartographer's paste-box instead. This is real generation of
a document, but of *expression*, not of *fact*, so it doesn't reopen D37's
anti-fabrication concern — translating an already-verified claim doesn't
change what the claim says, only how it's said.

**Why doing this live, instead of pre-generating, is the better design, not
just the lazier one**: translation quality genuinely improves when it's done
with the actual situation in view — who's asking, why, in what register —
rather than produced once, generically, ahead of any real audience. A
narrative pre-translated in isolation has no way to know whether the reader
wants deep technical rigor, a simplified explanation for a classroom, or just
the language switched with everything else the same; a live Staff, mid-conversation,
already knows. This also means language turns out to be only one instance of
a broader pattern — audience/register/complexity adaptation generally — that
this same mechanism (Staff reads the English source, produces a tailored copy,
hands it over via paste-box) already covers without any extra machinery.

**What this means for Cartographer**: nothing changes there. `docs/narrative.js`
was already, and remains, language-agnostic — it renders whatever plain string
or language-keyed object a step's `caption` field holds, exactly as it renders
today's English-only Library entries, with zero special-casing for language.
The same "Faceless Cartographer" principle that keeps its UI to emoji glyphs
(`▶`, `⏮`, `⏭`, `🔁`, `⏹` — not English words) extends to its content handling:
Cartographer never makes a judgment call about who's watching, it only plays
back whatever it's handed.

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

There is no `#q=`-style hand-typeable shorthand for the URL-fragment path, and
there does not need to be one: `#q=`'s entire reason for existing is that a
tool-less Staff cannot compute a real LZString compression "in its head" and
must hand-type something character-by-character instead. For an as-authored
narrative, Staff never needs to construct anything — it copies one of
`NARRATIVES.md`'s already-valid pre-encoded links verbatim.

For a translated/adapted copy (see "Whose job is the language?" above), which
path Staff uses depends on whether its actual runtime gives it genuine code
execution (`DECISIONS.md` D42):
- **With real, verified code execution**: Staff runs the exact same
  `LZString.compressToEncodedURIComponent()` call this Cartographer's own
  `docs/narrative.js`/`scripts/encode-narrative.mjs` use (the library is small
  enough — ~4.8KB minified — that `STAFF-PROMPT.md` embeds it verbatim, so this
  never depends on network access to unpkg), round-trip-verifies the result
  against the original document, and hands over a real `#narrative=` link —
  the same experience as an as-authored narrative. This is never approximated
  by reasoning about what the compression "should" output; it is only ever the
  result of code that actually ran.
- **Without code execution** (the tool-less case `#q=` itself was designed
  for): Staff composes plain, uncompressed JSON text and hands it over via the
  paste-box — this is the "required baseline" path in item 1, unchanged since
  D33.

Either way the JSON content is identical; only the delivery mechanism differs,
and Cartographer's own code needs zero changes to support either — it already
accepts both a pasted document and a fragment-carried one.

## Responsibility split

This is the concrete payoff of hardening the format: with a stable schema and a
pre-authored library, the three roles' jobs are simple and separate.

- **This repo's maintainers (human + Claude Code sessions)**: author new narratives
  against real, verified data (same discipline as `DECISIONS.md` D13/D35's
  `gdallocationinfo`-based site checks — never invent a score, a classification, or
  a site count), add each as an **English-only** `samples/narrative-*.json` file
  (`DECISIONS.md` D39 — no pre-translation), generate its `#narrative=` link, and
  list it in `NARRATIVES.md` with a short description of the question it answers.
- **Staff** (`STAFF-PROMPT.md`): for a question that invites a narrative rather than
  a single view, select the closest-matching entry from `NARRATIVES.md`. If the
  user's own language/register matches what's there, hand over the pre-built link
  directly — no generation, no fabrication surface. If not, translate/adapt it live
  (see "Whose job is the language?" above) and hand over a paste-box document
  instead, keeping every structural field and substantive claim byte-identical to
  the English original. If nothing in the library fits the *content* being asked
  about at all, say so plainly (same Anti-Fabrication discipline as an unlisted
  `source_id`) rather than improvising a new narrative on the spot. This
  translation/adaptation work is not covered by "no generation" — that rule is
  about facts, not expression.
- **Cartographer** (`docs/narrative.js` + `docs/map_intent.js`'s paste-box wiring):
  plays back whatever valid narrative document it's given, from either transport.
  It has no opinion about where the document came from and does not change based on
  this split — this split is entirely a Staff-side scoping decision (`DECISIONS.md`
  D34 item 2), not a Cartographer capability change.

## Examples

- `samples/narrative-cod-maize-mystery.json` — the DR Congo maize-storage-siting
  narrative (`DECISIONS.md` D13/D16's verified finding), the first entry in
  `NARRATIVES.md`'s library and the reference example for this format.

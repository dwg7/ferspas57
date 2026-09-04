# ADR 0009 (draft, not yet proposed upstream): Map Intent Is the Required Baseline Vocabulary, Not the Only One

Status: Draft — prepared in `dwg7/ferspas57`, not yet opened as a PR against `UNopenGIS/staccato-spec`. Owed since `DECISIONS.md` D6/D12/D19, reaffirmed D21/D22, redesigned D29-follow-up after reconsidering the original approach. Follows `staccato-spec`'s existing ADR template and register (0001, 0003, 0004, 0007 read directly before drafting/redrafting this — ADR 0003 in particular is the closest structural precedent: a clarifying ADR that reconciles the spec's text with a real, working implementation, without introducing new schema).

Date: 2026-09-04
Deciders: (staccato-spec maintainers, once proposed)

## Context

`dwg7/ferspas57` (a `martin catalog` Cartographer implementation for FAO's Hand-in-Hand Initiative and GAEZ data) built a working narrative-playback feature (`docs/story.js`): a Staff-produced document — `{title, steps: [{center, zoom, layers, caption}, ...]}` — played back as a guided sequence of views with commentary, for questions that invite an explanation ("why was this site chosen") rather than a single "show me X." A real, verified example exists: a 4-step narrative built from an actual finding in FAO's Hand-in-Hand data. This is explicitly labeled in ferspas57's own `STAFF-PROMPT.md` as "this repo's own extension, not part of the Map Intent spec."

An earlier draft of this ADR proposed folding this capability into Map Intent itself, as an optional `narrative.steps[]` field. On reflection, that approach doesn't fit the shape of the actual need: it requires a narrative-bearing Map Intent to *also* carry a redundant single-state fallback for non-narrative-aware consumers, producing one document trying to serve two structurally different purposes (a single instruction vs. a guided sequence with commentary) at once — an awkwardness that is itself a signal the two belong to different vocabularies, not one extended schema.

**The more useful precedent is how this spec already treats the Library role.** The Staccato architecture (User/Staff/Cartographer/Library) defines a set of *relationships*, not a single mandatory wire format for every link between roles. Library's own backing interface is a clear example already in practice: today it's typically a `martin catalog`, but nothing in the 4-role architecture requires that — a future Library could be backed by STAC directly, or something else, without changing what "Library" means architecturally. The same separation is more consistent for the Staff→Cartographer link than trying to make Map Intent the single vocabulary for every kind of thing a Staff might want to hand a Cartographer. Map Intent earns its normative, spec-defined status specifically because it's the interoperability seam ADR 0001's faceless baseline depends on (a plain-text, human-pasteable share artifact that any conformant Cartographer can accept) — that's a real, load-bearing reason for Map Intent specifically to be standardized. It is not, on its own, a reason why *every* Staff→Cartographer communication must funnel through that one schema.

**What this ADR is actually contributing back to the spec** is narrower than "please add a feature" — it's a real, working data point on a design question every layered architecture eventually has to answer: *where exactly does the mandatory contract end and implementation freedom begin?* `dwg7/ferspas57` didn't just need a narrative feature; building it, then trying to fit it into Map Intent, then finding that fit awkward, is what actually revealed where that line falls for this specific spec — the boundary is not "everything Staff sends to Cartographer" but specifically "the plain-text, portable-by-design share artifact." That's a claim worth stating on its own, with this implementation as the evidence for it, independent of whether narrative sequencing specifically ever becomes a standardized vocabulary.

## Decision

We clarify that **Map Intent (per `map-intent-vnext.md`) is the REQUIRED baseline vocabulary for Staff→Cartographer communication** — every conformant Cartographer MUST accept it, per ADR 0001's faceless/paste-box baseline and ADR 0004/0005's fragment-handoff options. This ADR does not change that requirement.

Separately, we clarify that **Map Intent is not thereby the exclusive vocabulary**. An implementation MAY define and use additional, non-normative Staff→Cartographer communication formats for use cases Map Intent's single-state model doesn't serve well (a guided narrative sequence is the motivating example, not the only conceivable one). Such additional formats:

- Are **out of scope for this spec** to define, in the same way Library's backing catalog format is out of scope — an implementation detail, not an architectural contract. `staccato-spec` does not need to know what `docs/story.js`'s narrative JSON looks like any more than it needs to know the internal shape of a specific `martin catalog` config file.
- Remain fully subject to every guarantee the spec attaches to *carrying map state* regardless of vocabulary — ADR 0001's URL policy, ADR 0004/0005's fragment-handoff rules, and any other baseline safety/privacy requirement apply to whatever format is actually moving map state around, not just to documents that happen to be named "Map Intent."
- Are not required to be portable across different Cartographer implementations the way Map Intent is. A Cartographer with no narrative support simply doesn't support that vocabulary; this is not a compliance gap, since Map Intent — the one vocabulary this spec actually requires — remains fully supported.
- MAY mature into their own spec-level proposal later, once real-world usage across more than one implementation demonstrates the shape is stable and broadly useful — this ADR deliberately does not attempt that now, for exactly one format that exists in exactly one implementation today.

## Consequences

Positive:

- Resolves ferspas57's actual situation honestly: its narrative feature is acknowledged as a legitimate implementation choice under the architecture, not an unspecified gray area or a premature schema addition to Map Intent.
- Keeps Map Intent's own schema simple and focused on the one job that requires spec-level standardization (portable share/paste-box interoperability), rather than accreting fields for every interaction pattern any single implementation invents.
- Matches the separation of concerns the spec already uses for Library, applying it consistently rather than treating Map Intent as a special case that must absorb every future Staff-side idea.
- Leaves room for a real future ADR to standardize a narrative (or other) vocabulary once it's actually proven across multiple implementations, without this ADR having to guess its final shape now.

Negative / trade-offs:

- Provides no interoperability for non-Map-Intent vocabularies — a narrative built for one Cartographer will not play in another unless that Cartographer happens to implement the same ad hoc format. This is an accepted, explicit trade-off, not an oversight: forcing early standardization of a single-implementation format risks locking in a shape that doesn't generalize, which is arguably worse than no standard yet.
- Spec readers must understand that "Cartographer accepts Map Intent" is a compliance floor, not a ceiling — a given Cartographer may support additional formats the spec says nothing about, which could be confusing without this ADR's clarification on record.

## Alternatives Considered

1. **Extend Map Intent's schema with an optional `narrative` field** (this ADR's own earlier draft).
   Rejected: requires every narrative-bearing document to also carry a redundant fallback single-state for non-narrative consumers, and entangles a fundamentally different kind of artifact (a guided, commentary-bearing sequence) with Map Intent's versioning and schema evolution. The awkwardness of the fallback requirement was itself the signal this was the wrong shape.

2. **Define a new, normative sibling document type (e.g., "Narrative Intent") in this spec now.**
   Rejected for now, not permanently: standardizing a format that exists in exactly one implementation risks freezing a shape that hasn't been tested against different Staff/Cartographer pairings. Revisit once more than one implementation wants this and their actual needs can inform the shape, rather than generalizing from a single example.

3. **Say nothing in the spec at all, leave this fully implicit.**
   Rejected: this is the status quo, and it's exactly what left ferspas57 needing to explicitly flag its own narrative feature as "not part of the spec" out of caution rather than confidence. A short clarifying ADR costs little and removes that ambiguity for this and future implementations facing the same question.

## Status

Draft. Not yet opened as a PR against `staccato-spec`. Intended next step: hfu (or whoever picks this up in `dwg7/ferspas57`) opens this as an actual PR/issue against `UNopenGIS/staccato-spec`, citing `dwg7/ferspas57`'s `docs/story.js` as the motivating (not normalized) example, following the same evidentiary pattern ADR 0003 used citing `hfu/faceless-cartographer`.

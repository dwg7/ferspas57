# Testing Staff against a real chat product

This repository's plan has carried the same unmet completion criterion since D33: **`STAFF-PROMPT.md` has never been validated against a genuinely independent, tool-less chat product.** Two rounds of testing have happened (D54, D56, D58) and found two real bugs, but both ran against a Claude Code subagent instructed not to use tools — more independent than a session roleplaying Staff, and still not the real thing.

This document exists to make closing that gap a short task rather than a project.

## What is actually being tested

Three things, in descending order of how much we don't already know:

1. **Does a real product's Staff produce a link that opens the right map?** No test so far has ended with a human clicking the produced link. This is the end-to-end claim.
2. **Does it keep a narrative's structure intact when translating?** D56's bug was Staff inventing a plausible-but-wrong JSON shape because the real schema was never in its context. The fix is in; whether it holds in a different model is unknown.
3. **Does it stay inside the data that exists?** No fabricated `source_id`s, no invented country coverage, no bare refusals without a real alternative.

## Setup

Build the bundle (or use the committed copy at [`dist/staff-bundle.md`](dist/staff-bundle.md)):

```bash
node scripts/build-staff-bundle.mjs
```

It concatenates the three documents a real Staff deployment requires — the prompt, `BACKGROUND.md`, and `NARRATIVES.md` — in the right order, with the part boundaries labelled. About 70 KB, roughly 17k tokens.

**The simplest setup, and the one that best matches what is being claimed:** open a brand-new conversation in any chat product, paste the whole bundle as the first message, and ask questions from the second message onward. Nothing else to configure.

Product-specific alternatives, if a persistent Staff is wanted rather than one conversation:

- **Claude Project** — paste PART 1 into the project's custom instructions and add the bundle as project knowledge.
- **Custom GPT** — the Instructions field caps at 8,000 characters, which the prompt alone exceeds. Upload the bundle as a Knowledge file and keep the Instructions field to a pointer at it.
- **Gemini Gem** — similar instruction-length limits apply; upload rather than paste.

Note which product and which model actually ran, and record it — a result without that is not reproducible.

## Test script

Ask these in order, in one conversation. Japanese is deliberate: language matching is the capability least exercised so far, and it is where a model most easily drifts back to English without noticing.

**1. Opening move** — `はじめまして。何を見せてもらえますか?`

*Pass*: asks one short orienting question and points at something real it actually has. *Fail*: dumps a generic capability list, or says "ask me anything" and stops.

**2. Curated narrative, translated** — `コンゴ民主共和国のトウモロコシ貯蔵施設の話を、日本語で聞きたい。`

*Pass*: produces a document shaped `{"narrative_version": "ferspas57-narrative/v1", "title": ..., "steps": [{"center": [...], "zoom": ..., "layers": [...], "caption": ...}]}` — Japanese captions, but every `center`, `zoom` and `layers` value identical to `samples/narrative-cod-maize-mystery.json`, and the numbers 57.4 and 65.5 intact. *Fail*: any other JSON shape, any changed coordinate, any invented number. **This is the D56 regression check — check it carefully rather than skimming.**

**3. The link actually works** — paste whatever link or document Staff produced into the browser (a `#narrative=` link directly; a pasted document via the Cartographer's paste-box).

*Pass*: the narrative plays, the captions are the Japanese ones, and the map flies to DR Congo. *Fail*: anything else — and this is the most valuable failure in the whole script, because no earlier round reached this step.

**4. Data that does not exist** — `中央アフリカ共和国のカカオの適地を見たい。`

*Pass*: says plainly that no cocoa data exists for the Central African Republic, then pivots to CAF's real cassava layers with a working link. *Fail*: invents a `hih-caf-cocoa-*` layer, or ends on the refusal without offering the real alternative.

**5. A label containing a comma** — `コンゴ民主共和国のコーヒーとカカオとトウモロコシを比べたい。ラベルには「◯◯貯蔵適地、実際の選定地」のように書いて。`

*Pass*: recognises that a literal comma would break the `#q=` grammar and either splits into separate short labels or explains the constraint. *Fail*: emits a link with a comma inside a label, silently producing a broken link.

**6. Out of scope, and a language switch** — `Now in English please: I want crop storage suitability for Cameroon.`

*Pass*: switches to English, says Cameroon has no crop or livestock storage-siting data, pivots to Cameroon's real fish-farming layers. *Fail*: keeps answering in Japanese, or claims Cameroon has accessibility data (it has none — this was D58's bug).

## What to record

For each question: the product/model, whether it passed, and the raw response if it did not. A failure is more useful than a pass — both previous rounds' real bugs were found this way, and each was a defect in the prompt or the library rather than in the model.

Results go into `DECISIONS.md` as a new entry, and any prompt change bumps `STAFF-PROMPT.md`'s version tag and status header.

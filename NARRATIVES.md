# Narrative Library

Pre-authored, data-verified narratives for Staff to select from and hand to a user
as a link — see `NARRATIVE-FORMAT.md` for the document schema and the
Staff/Cartographer responsibility split this library exists to enable (`DECISIONS.md`
D34 item 2, D37).

Staff's job for a narrative-shaped question is to **pick the closest match below and
hand over its link as-is** — not generate a new narrative JSON from scratch. If
nothing here fits, say so (same Anti-Fabrication discipline as `STAFF-PROMPT.md`'s
`source_id` rule) rather than improvising one.

Each entry's link is generated from its `samples/narrative-*.json` file via
`scripts/encode-narrative.mjs` — regenerate it with that script if the source file
ever changes; do not hand-edit a link.

---

## 1. DR Congo: why did FAO build the maize storage site where it did?

**Question this answers**: "Why was this site chosen?" / "Where did FAO actually
build, versus where the raw agro-ecological data looks best?" — for maize storage
siting in DR Congo.

**What it shows**: a GAEZ-favorable tropical-lowland site (score 57.4) versus the
site FAO actually selected 150km south, in a GAEZ zone flagged for severe
soil/terrain limitations, yet scoring higher (65.5) — resolved by HIH's real
multi-criteria methodology (climate + accessibility + poverty-reduction priority,
not pure agronomy). Verified finding, `DECISIONS.md` D13/D16.

**Source**: [`samples/narrative-cod-maize-mystery.json`](samples/narrative-cod-maize-mystery.json) (4 steps, English)

[Open this narrative](https://dwg7.github.io/ferspas57/#narrative=N4IgdghgTlEC4EsBuBTA+qqBnBB7MIAXCAGYrYAOEWArAOwC0kM8yKA9EgIwgA0IiOABsUREABEASgAIAwvgDmuQtICC0gMoBbCEKHSAsgE8scckekIwhiAgBeKTXFywFo-qZQUsRANqgAYxQwMyg-ACYATgA6ABZY3gAGaJoAXX47XFwtIgAOfiEII3IfQl8QBQgUOwYquwBmepB0kACICkR8MUkEBQALOGl8aTg+xxQARwBXeBdeS2swF1GUalDrKTlFXGjpABU+hCxpaFXpEl0hY6mwABNyaQBxVQBRAC1pTLBHQBwCepU9lBcBQEAEsPMhLgAO6FO7zPpTLQIW6AXAJpIAUAhGKAAHnAAEZZADW5wgSBcEDxImkAXwtwQnTAxxILmkCiBUKsCmkOnsKGiIAAvrxAsFQhEYvEkikWplskQuIkCkUSn4KnVatVGnwQIc+gwabcGDyHAwsDSoKIWm0OngCMQAPKYQpGTnSABiqntAHJjsbHKZyW5pFgpvSKQghPSLGaXCh5qMjsGKLhBjGLcd6HEMdJ7kEQvM8VNBktBrgi6YIHdOfyhSKQuRxSk6LwGMlcnQZVkcoQuFwlcVsKrdfrcIa-abze4dQg9QajbYTSQrLpmvxrQyxABNFCDFbB+mOD32k4BOAzPTRlAiU8oW7SAAUe4td+TQiMSjAAEppJGUMcKWWgxcDQiSEloIy4CMYzBoBfS7AAknAxzPO8nz4I4iY-OEABsKgADKVneHKjMGKCYP6uARuwoSwFYP4IEicCsPgWBopiIYUMmWC3m+0g3BcZKwJSjiYoWgz0sGk7HNhNApPMECnuevGHP0DyjJWUH+geEGadISxQKMNbCq0ooNmUURNi2bYdhkXbyn2IDOiqZRqtUGoNE0-DDnO45plO3mjvOvIMEukBCKurTtBuxAAOp9BYUJlkId57j8NKMnAtHfKiP6EZJsbSCpYxQAA-O6no+tIAAShEMFYDA1Xc+XpicFonmelwWBATzwRoDB4tQt7clMQiIPqUAHhN3VkboMwMtS2R4lYroBJGOiIAEwahkxS2RnACX0n0J5BFgOC7VGJxNcmmD7Qwz5TKetrSBQE0uFGuyPGw1h7vBYD0ggrCoJVFq6NyRw4MMmLBHSYBctd5D7Zdd4IrDDz3ho4iPFw7AY484TfpiEk6ISf6kYyjjqYM3UUIUQTSFChwBEdDEvbgqDHBQKDAiIlWRuzC0jXeeKOEzuDcdYZHBJYJCWOJWBgF6VNsvg2Sgp1lj3LoNapAKQA)

Authored in English only, matching the source FAO data/documentation this
narrative is built from — see `NARRATIVE-FORMAT.md`’s “Whose job is the
language?” for why this Library deliberately does not pre-translate: content
forked across languages drifts out of sync with the English source over time.
If a user wants this narrative in another language (or adapted for a different
audience — e.g. a simpler register for a younger reader), that is Staff’s job,
done live with the actual conversation’s context, not something pre-baked here.

---

## Adding a new narrative

1. Verify the underlying data yourself — real coordinates, real classification/score
   values (`gdallocationinfo -wgs84` against the actual source COG, as in
   `DECISIONS.md` D13/D35), not assumed or estimated ones. An honest negative
   finding (D35's CAF cassava result) is a valid outcome, not one to hide — it just
   doesn't necessarily earn its own narrative entry.
2. Write it as `samples/narrative-<slug>.json` per `NARRATIVE-FORMAT.md`'s schema.
3. Generate its link: `node scripts/encode-narrative.mjs samples/narrative-<slug>.json`
4. Add an entry above with the question it answers, what it shows, and the link.
5. Update `STAFF-PROMPT.md`'s Narrative Mode section if the set of covered
   questions/themes changed meaningfully.

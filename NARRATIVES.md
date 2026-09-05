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

## 2. DR Congo: why does wheat storage favor the mountains over the lowlands?

**Question this answers**: "Why was this site chosen?" / "Where does wheat storage
suitability actually peak in DR Congo?" — a different mechanism than the maize
story (crop-climate fit, not accessibility/poverty priority).

**What it shows**: two GAEZ-favorable lowland sites near Mbuji-Mayi score just
43.5/44.1 — the floor of all 15 selected wheat sites — while the strongest sites,
600km east in the steep highlands west of Uvira (GAEZ class 25, "severe terrain"),
score up to 60.9. The twist: wheat is a cool-climate crop, and in the tropics,
cool means altitude — the same mountains GAEZ flags as constrained. Verified
against all 15 real final sites (`DECISIONS.md` D41).

**Source**: [`samples/narrative-cod-wheat-highlands.json`](samples/narrative-cod-wheat-highlands.json) (4 steps, English)

[Open this narrative](https://dwg7.github.io/ferspas57/#narrative=N4IgdghgTlEC4EsBuBTA+qqBnBB7MIAXCAGYrYAOEWArAOwC0kM8yKA9EgIwgA0IiOABsUREABEASgAIAwvgDmuQtIDqACxTw5QhAFsARlmlxN0gLK4ArmDgQEYLHxBY4KCk8IBtUAGMUtuREXgBMAMwAdABsIbwMURFcXAC6-ABeuLh6RFwADPxCEACe5J5eIAoQKGkMVWlhYSCpIL4QFIj4YgAqZtZwWADWCFD90rgkFgZWAFYIDObFCLzSDtJScoq4AOTG-rawQtJCuADuhWAAJlgR0gDiAIIAogBa0r6FWFgoxqYIxucXaSAHAIQioulBcBQEL4sMtjmcIJdllgrAYGOorHoEBdALgE0kAKAQmMxYCB6FDSAwQiCAkgQJC4WAGEQUxGA0zk3zWfZFHZjdlQN4QijSVwMhDfEV2EbSEgQvQ3LonXBjCYAMXuAHleSQECQ3AERSgRL43ICTpptKLYApyTg3MY7dJNFAUBEQABfXh+AJuKDBcLRWLxRIpdKZbKEPIFYqlYIVOq1aoNZzqBDqBici4Mc1aOAMLCcl1Nfitdp4AjEABCVjgY0whSKRPJOctcAZEBtIqsCDsBgQujgjYLDPJrKbMrp7aZ5MKBiNFKsRWMECEelwrmkYFwvzAChU7K+R1OAJFPYlw5d0mmVg3ABZIjRpGPb7fEssoAgFOpa9p2TLjgyKrjj6wzkjqeooAE+ZnoaxodGAbqet6gR+t4IQAJwRLkURxJEt40M0GRZDkXDRiU2Bxqm6aZtmFp5heoj8FRGa4FmLZ5jqkBCMWLRtPB3TEnAEK7t8tbsae9pPpeuCYNIUS5Lk0gDHo0haK4yyrH+riQcKqZfgCxjXhuJyiUBACqSDDBAm5aAKf5biMzpgCYCDCuM0gADIQAM5JdIilRgEUCADBANwAMooJgK6wSgJooICdoSu8N6+k65AoMs+BHGODwvP+HbLsYII0Co4hZA4iLCI2mBDvqwq+rADh4oSY5-nOG7ueyKkMcY8kROhyxgLZQiNlwdDSBQuAOKMEAGDJ5JtaZ8InoliFei0PpBGhmHYbhET4YR4YkWRsbePG1SJvUjRMWmLFsXR+aFoxIDMTR7EMJxK48aW-HED0C0nH8cAqCQgHscsf5Aic0BgA4CjZXOQh4q1vQUJNIw2D2jbQAtxKkrjcM3BouYrMubyZEIGa6Ho8AckKyxjppZhCZC0K7BT0hkoiy5CIIVgXOShJ-jVnNcnYDg-Oo2i2c5uXPLy2nuAwDX2M5JCFAoNz3G8Hw4DqrTwQu-Y-hCNhskK0LRctY60lAWK7tILrUpLfzZZcT7s44Qmq-FADc0jqlqxgABKsgwDgMKH7sMcsFwfqgzkGNjnNWLzcy+B+voINZkUrlYrBZe57z6LTDO+P4nwIH2A5FAz7uTZgg4MC6FxWCa5YTR+YqDu+WhXCsP7GOs8i7tsxjtWJdHkzYQlFIhyTukAA)

---

## 3. Côte d'Ivoire: why does dairy processing favor the savanna over the rainforest?

**Question this answers**: "Why was this site chosen?" / "Where does dairy
processing suitability actually peak in Côte d'Ivoire?"

**What it shows**: the country's lushest rainforest belt (GAEZ class 3, humid
lowland) scores only ~51 for dairy processing suitability, while all 12 real
selected sites cluster ~350km north around Korhogo in the drier savanna (GAEZ
class 2), scoring 68.6–74.8 — the highest scores measured for any of Côte
d'Ivoire's five Hand-in-Hand commodities. FAO's own catalog names this score's
companion final-location layer "CATTLE" — dairy processing is sited where the
livestock economy is, not where the land looks greenest. Verified against all 12
real final sites (`DECISIONS.md` D41).

**Source**: [`samples/narrative-civ-dairy-north.json`](samples/narrative-civ-dairy-north.json) (4 steps, English)

[Open this narrative](https://dwg7.github.io/ferspas57/#narrative=N4IgdghgTlEC4EsBuBTA+qqBnBB7MIAXCAGYrYAOEWArAOwC0kM8yKA9EgIwgA0IiOABsUREAGEAL3BQACACYByAJJJcCKCkKyAIhA0BPWQDFcQobgDuWWXAAWc8fGEpesgHK44th7IBK+gT8WDIUWEQA2qAAxihgMlCRDDQAdACcvABsKQDMALr8AF64uAC2RAAc-EIQBuThhBEgAOYQKIUMbYU5OSAFINEQFIj4YgDKuACu9uRgslIyCipqGq6yCHMzsqUI8vIisrgkPnIkuJohsgBGKEJwKbIA4gCCAKIAWrLRNVg4JAgoGz2BA2aiyYpgOSAHAIctoACpQXAUBDRLBuCyWGpgeRuOyTHbyQC4BLJACgEJ1klhQcBkIXRkywDkuEGaiIYKGiZlwzRRECE1wg2PJHMm8SgRjs1BSIAAvrwYnEEklUhlsvkiiVyoQqiAanVsJEWl1Ou0enwQHYEHYGNFkAx5PoxQwsBzNH1+INhngCMQAPKYXUmZ4+xQ2e2GBgURGxX4bZqyLCTBBwCBXBBCJNGZ3nNYC+TkoT0uzxqb2WyTKBgGwl7YoeR4aKabQp6s0LiyKAIZp2bwOTRuSxJotbSx2MxyPEE2RnC7eG53WSjzCx9abXwAFgADKDBRjZDQt1LZfL4uQlSk13ReGlz2l+sUykQMjravUDRarTakHaHQYnS7RPw77WraYaOv8kBCG6AxDCM3ogM85iyFwABM8ZJoCgY+rIEDRHAky8kIma3OyMh5jg3jNtMsg5PusgANalLIYDnKWRwnH2XwFiE5C1thiIinmADS5yjs0uAruS8gduQ8YQEgAqQKSTxvJ8ELQsh8KIsiqLolYWI4vGkxXAwE67CkxJwg4Gjxv+NhQCKU6IoxmQVCkmS2OJdBrikVTkhaXaAt4pQoNQ5a8dO2FgEYbELHISiqOomghlObCyAAErmDAbAwGWChypSlLgdaIICh5ygMCqno0yTnpe15rre6oPoQT66q+jSGu0xrdL0gGWsBX6gb+Waun1H4gT+DDgbyUEerBYgAOp2EY8i4BhWxSQCUCyfJYCKTc8DkrAGzToFAD8sgAELshA9JxT+U5mBiNiDNSIhuMx3jHWAJAEQ8yhzMYQbJVYcyvbyXJuMCNgjSgyX5VQYBeilEEMBYr3I2120grI6YJARRiQMFebiM8cJwgAMq8bi5rIKCYNFkKHMcSYw8RuG8eRGH6TYGw+DjWAQMFTEsb2cxzvcsiWXIuXyFlYA5bTsPrKCTzKGM2yTHcCDWh2CQIBAdPyQWrD4Ep3wIKU8ByBQXHYdE0Y4KmeNGLb9KyBQuCYHAv6aPIky4cjkZ4HrRhklg4lDR7UaAjgYBxgL6F5iOPH5mwIS4NEdF0xyzGlEYtNbBQKBIgcI6RygxeCmbSb23hBN8Wsn0Ur2chbFbFC4yUdE2CyKBxIFh55NKQA)

**A note on how these narratives were found**: candidates 2 and 3 (and D35's negative
result for CAF cassava) came from a systematic sweep of DR Congo's and Côte
d'Ivoire's remaining commodities, run by background research agents, following the
exact same `gdallocationinfo`-based verification discipline as D13. One additional
candidate the sweep produced (DR Congo livestock) was **not** included here — an
independent spot-check of its numbers found the sweep's own headline claim didn't
hold up, and it was dropped rather than published with a claim that couldn't be
verified. See `DECISIONS.md` D41 for the full account, including that rejection —
worth reading before trusting any future automated narrative sweep's output at
face value.

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

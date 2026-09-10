# Demo guide

What to open, in what order, and what it is evidence of. Written for two audiences: FAO CSI colleagues looking at this for the first time, and whoever is presenting it on DWG 7's behalf.

Everything below is a public URL. Nothing requires a login, an install, or a running server on the viewer's side.

---

## Three minutes: one link

**[Why did FAO build the maize storage site where it did?](https://dwg7.unopengis.org/ferspas57/#narrative=N4IgdghgTlEC4EsBuBTA+qqBnBB7MIAXCAGYrYAOEWArAOwC0kM8yKA9EgIwgA0IiOABsUREABEASgAIAwvgDmuQtICC0gMoBbCEKHSAsgE8scckekIwhiAgBeKTXFywFo-qZQUsRANqgAYxQwMyg-ACYATgA6ABZY3gAGaJoAXX47XFwtIgAOfiEII3IfQl8QBQgUOwYquwBmepB0kACICkR8MUkEBQALOGl8aTg+xxQARwBXeBdeS2swF1GUalDrKTlFXGjpABU+hCxpaFXpEl0hY6mwABNyaQBxVQBRAC1pTLBHQBwCepU9lBcBQEAEsPMhLgAO6FO7zPpTLQIW6AXAJpIAUAhGKAAHnAAEZZADW5wgSBcEDxImkAXwtwQnTAxxILmkCiBUKsCmkOnsKGiIAAvrxAsFQhEYvEkikWplskQuIkCkUSn4KnVatVGnwQIc+gwabcGDyHAwsDSoKIWm0OngCMQAPKYQpGTnSABiqntAHJjsbHKZyW5pFgpvSKQghPSLGaXCh5qMjsGKLhBjGLcd6HEMdJ7kEQvM8VNBktBrgi6YIHdOfyhSKQuRxSk6LwGMlcnQZVkcoQuFwlcVsKrdfrcIa-abze4dQg9QajbYTSQrLpmvxrQyxABNFCDFbB+mOD32k4BOAzPTRlAiU8oW7SAAUe4td+TQiMSjAAEppJGUMcKWWgxcDQiSEloIy4CMYzBoBfS7AAknAxzPO8nz4I4iY-OEABsKgADKVneHKjMGKCYP6uARuwoSwFYP4IEicCsPgWBopiIYUMmWC3m+0g3BcZKwJSjiYoWgz0sGk7HNhNApPMECnuevGHP0DyjJWUH+geEGadISxQKMNbCq0ooNmUURNi2bYdhkXbyn2IDOiqZRqtUGoNE0-DDnO45plO3mjvOvIMEukBCKurTtBuxAAOp9BYUJlkId57j8NKMnAtHfKiP6EZJsbSCpYxQAA-O6no+tIAAShEMFYDA1Xc+XpicFonmelwWBATzwRoDB4tQt7clMQiIPqUAHhN3VkboMwMtS2R4lYroBJGOiIAEwahkxS2RnACX0n0J5BFgOC7VGJxNcmmD7Qwz5TKetrSBQE0uFGuyPGw1h7vBYD0ggrCoJVFq6NyRw4MMmLBHSYBctd5D7Zdd4IrDDz3ho4iPFw7AY484TfpiEk6ISf6kYyjjqYM3UUIUQTSFChwBEdDEvbgqDHBQKDAiIlWRuzC0jXeeKOEzuDcdYZHBJYJCWOJWBgF6VNsvg2Sgp1lj3LoNapAKQA)**

A four-step guided narrative. Press ▶ to advance. The map flies between two real locations in DR Congo, turning the relevant data layers on as it goes, with a caption for each step.

**What it is evidence of.** A single URL, containing no server-side state, reconstructs a complete guided map experience — camera, layer selection, and narration — over live FAO data. That is the whole Staccato hand-off model in one artifact: an interpreter chooses *what to show*, and the map client is told, not queried.

**What it says.** A GAEZ-favorable tropical lowland site scores 57.4. The site FAO's Hand-in-Hand process actually selected, about 150 km south, sits in a GAEZ zone flagged for severe soil and terrain limitations — and scores 65.5. That is not an error in the data. Hand-in-Hand's siting score is a multi-criteria evaluation weighing accessibility and poverty-reduction priority alongside agronomic suitability, because HIH's mission is SDG 1 and SDG 2, not agronomic optimality.

That distinction is easy to lose when a suitability score is rendered as a colour ramp and nothing else. Recovering it is what this project treats as the actual job.

---

## Ten minutes: the map itself

Open **[dwg7.unopengis.org/ferspas57](https://dwg7.unopengis.org/ferspas57/)** with no fragment.

1. **The globe.** MapLibre's globe projection, not Web Mercator — a deliberate choice, motivated by the African Union-backed resolution objecting to Mercator's visual shrinking of Africa. For a demo centred on African agricultural data, the projection is part of the argument.
2. **The layer panel.** Four raster groups (GAEZ classification, Hand-in-Hand siting scores, accessibility, fish farming) plus a vector "final sites" group. Data layers are sandwiched *below* the basemap's water, roads, boundaries and labels but *above* its land fills — so place names stay readable over the data.
3. **The score radial.** Drag the map. The radial widget samples every loaded score layer at the screen centre and shows them side by side, so a viewer can compare commodities at one place rather than toggling layers one at a time. It fades while a sample is in flight and sharpens when the numbers are current — the latency is made visible rather than hidden behind stale-looking certainty.
4. **The gold markers.** Each pulsing marker is one real FAO-selected site — one location out of a whole raster of scored candidates. There are 355 of them across the catalog.
5. **The AEZ legend.** It reads the actual rendered pixel under the screen centre and names that agro-ecological class. Zoom into the highlands and watch the class change.

Then open the other two curated narratives:

- **[DR Congo: why does wheat storage favor the mountains over the lowlands?](https://dwg7.unopengis.org/ferspas57/#narrative=N4IgdghgTlEC4EsBuBTA+qqBnBB7MIAXCAGYrYAOEWArAOwC0kM8yKA9EgIwgA0IiOABsUREABEASgAIAwvgDmuQtIDqACxTw5QhAFsARlmlxN0gLK4ArmDgQEYLHxBY4KCk8IBtUAGMUtuREXgBMAMwAdABsIbwMURFcXAC6-ABeuLh6RFwADPxCEACe5J5eIAoQKGkMVWlhYSCpIL4QFIj4YgAqZtZwWADWCFD90rgkFgZWAFYIDObFCLzSDtJScoq4AOTG-rawQtJCuADuhWAAJlgR0gDiAIIAogBa0r6FWFgoxqYIxucXaSAHAIQioulBcBQEL4sMtjmcIJdllgrAYGOorHoEBdALgE0kAKAQmMxYCB6FDSAwQiCAkgQJC4WAGEQUxGA0zk3zWfZFHZjdlQN4QijSVwMhDfEV2EbSEgQvQ3LonXBjCYAMXuAHleSQECQ3AERSgRL43ICTpptKLYApyTg3MY7dJNFAUBEQABfXh+AJuKDBcLRWLxRIpdKZbKEPIFYqlYIVOq1aoNZzqBDqBici4Mc1aOAMLCcl1Nfitdp4AjEABCVjgY0whSKRPJOctcAZEBtIqsCDsBgQujgjYLDPJrKbMrp7aZ5MKBiNFKsRWMECEelwrmkYFwvzAChU7K+R1OAJFPYlw5d0mmVg3ABZIjRpGPb7fEssoAgFOpa9p2TLjgyKrjj6wzkjqeooAE+ZnoaxodGAbqet6gR+t4IQAJwRLkURxJEt40M0GRZDkXDRiU2Bxqm6aZtmFp5heoj8FRGa4FmLZ5jqkBCMWLRtPB3TEnAEK7t8tbsae9pPpeuCYNIUS5Lk0gDHo0haK4yyrH+riQcKqZfgCxjXhuJyiUBACqSDDBAm5aAKf5biMzpgCYCDCuM0gADIQAM5JdIilRgEUCADBANwAMooJgK6wSgJooICdoSu8N6+k65AoMs+BHGODwvP+HbLsYII0Co4hZA4iLCI2mBDvqwq+rADh4oSY5-nOG7ueyKkMcY8kROhyxgLZQiNlwdDSBQuAOKMEAGDJ5JtaZ8InoliFei0PpBGhmHYbhET4YR4YkWRsbePG1SJvUjRMWmLFsXR+aFoxIDMTR7EMJxK48aW-HED0C0nH8cAqCQgHscsf5Aic0BgA4CjZXOQh4q1vQUJNIw2D2jbQAtxKkrjcM3BouYrMubyZEIGa6Ho8AckKyxjppZhCZC0K7BT0hkoiy5CIIVgXOShJ-jVnNcnYDg-Oo2i2c5uXPLy2nuAwDX2M5JCFAoNz3G8Hw4DqrTwQu-Y-hCNhskK0LRctY60lAWK7tILrUpLfzZZcT7s44Qmq-FADc0jqlqxgABKsgwDgMKH7sMcsFwfqgzkGNjnNWLzcy+B+voINZkUrlYrBZe57z6LTDO+P4nwIH2A5FAz7uTZgg4MC6FxWCa5YTR+YqDu+WhXCsP7GOs8i7tsxjtWJdHkzYQlFIhyTukAA)** — the two lowland sites near Mbuji-Mayi score 43.5 and 44.1, the floor of all 15 selected wheat sites, while the strongest sites 600 km east in the steep highlands west of Uvira score up to 60.9. Wheat is a cool-climate crop; in the tropics, cool means altitude — the same mountains GAEZ flags as terrain-constrained.
- **[Côte d'Ivoire: why does dairy processing favor the savanna over the rainforest?](https://dwg7.unopengis.org/ferspas57/#narrative=N4IgdghgTlEC4EsBuBTA+qqBnBB7MIAXCAGYrYAOEWArAOwC0kM8yKA9EgIwgA0IiOABsUREAGEAL3BQACACYByAJJJcCKCkKyAIhA0BPWQDFcQobgDuWWXAAWc8fGEpesgHK44th7IBK+gT8WDIUWEQA2qAAxihgMlCRDDQAdACcvABsKQDMALr8AF64uAC2RAAc-EIQBuThhBEgAOYQKIUMbYU5OSAFINEQFIj4YgDKuACu9uRgslIyCipqGq6yCHMzsqUI8vIisrgkPnIkuJohsgBGKEJwKbIA4gCCAKIAWrLRNVg4JAgoGz2BA2aiyYpgOSAHAIctoACpQXAUBDRLBuCyWGpgeRuOyTHbyQC4BLJACgEJ1klhQcBkIXRkywDkuEGaiIYKGiZlwzRRECE1wg2PJHMm8SgRjs1BSIAAvrwYnEEklUhlsvkiiVyoQqiAanVsJEWl1Ou0enwQHYEHYGNFkAx5PoxQwsBzNH1+INhngCMQAPKYXUmZ4+xQ2e2GBgURGxX4bZqyLCTBBwCBXBBCJNGZ3nNYC+TkoT0uzxqb2WyTKBgGwl7YoeR4aKabQp6s0LiyKAIZp2bwOTRuSxJotbSx2MxyPEE2RnC7eG53WSjzCx9abXwAFgADKDBRjZDQt1LZfL4uQlSk13ReGlz2l+sUykQMjravUDRarTakHaHQYnS7RPw77WraYaOv8kBCG6AxDCM3ogM85iyFwABM8ZJoCgY+rIEDRHAky8kIma3OyMh5jg3jNtMsg5PusgANalLIYDnKWRwnH2XwFiE5C1thiIinmADS5yjs0uAruS8gduQ8YQEgAqQKSTxvJ8ELQsh8KIsiqLolYWI4vGkxXAwE67CkxJwg4Gjxv+NhQCKU6IoxmQVCkmS2OJdBrikVTkhaXaAt4pQoNQ5a8dO2FgEYbELHISiqOomghlObCyAAErmDAbAwGWChypSlLgdaIICh5ygMCqno0yTnpe15rre6oPoQT66q+jSGu0xrdL0gGWsBX6gb+Waun1H4gT+DDgbyUEerBYgAOp2EY8i4BhWxSQCUCyfJYCKTc8DkrAGzToFAD8sgAELshA9JxT+U5mBiNiDNSIhuMx3jHWAJAEQ8yhzMYQbJVYcyvbyXJuMCNgjSgyX5VQYBeilEEMBYr3I2120grI6YJARRiQMFebiM8cJwgAMq8bi5rIKCYNFkKHMcSYw8RuG8eRGH6TYGw+DjWAQMFTEsb2cxzvcsiWXIuXyFlYA5bTsPrKCTzKGM2yTHcCDWh2CQIBAdPyQWrD4Ep3wIKU8ByBQXHYdE0Y4KmeNGLb9KyBQuCYHAv6aPIky4cjkZ4HrRhklg4lDR7UaAjgYBxgL6F5iOPH5mwIS4NEdF0xyzGlEYtNbBQKBIgcI6RygxeCmbSb23hBN8Wsn0Ur2chbFbFC4yUdE2CyKBxIFh55NKQA)** — the lushest rainforest belt scores ~51, while all 12 selected sites cluster ~350 km north around Korhogo in the drier savanna at 68.6–74.8. FAO's own catalog names this score's companion layer "CATTLE": dairy processing is sited where the livestock economy is, not where the land looks greenest.

All three findings were verified against every real selected site for that commodity, not sampled. Ten other commodity/country combinations were checked for the same pattern and did not hold up — those were dropped rather than told. See `DECISIONS.md` D35/D41.

---

## The conversational layer

[`STAFF-PROMPT.md`](STAFF-PROMPT.md) is a system prompt, not a service. Open a fresh conversation in any general-purpose chat agent — a Claude Project, a custom GPT, a Gemini Gem — paste [`dist/staff-bundle.md`](dist/staff-bundle.md) as the first message, and that agent becomes Staff: it turns a plain-language question into a link this Cartographer opens. (The bundle is the prompt plus [`BACKGROUND.md`](BACKGROUND.md) plus [`NARRATIVES.md`](NARRATIVES.md), pre-assembled in the right order by `scripts/build-staff-bundle.mjs` — about 70 KB, one paste.)

There is no backend to deploy and no API key to manage. That is the point: Staccato's Staff role is an interpretation contract, and any capable chat agent can hold up its end.

Questions worth trying, in any language:

- "I'm travelling to Kinshasa — what agricultural issues should I understand?"
- "Compare coffee, cocoa and maize storage suitability in DR Congo."
- "Why was this particular site chosen?"
- "What is maize? Tell me in Japanese."

Staff answers in whatever language it was asked in, including for narratives — the library is English-only on purpose, and Staff translates live rather than serving a pre-baked translation that would drift out of sync with its source.

**Maturity note, stated plainly:** this is the newest and least-hardened layer. It has been tested across two rounds against a tool-restricted agent, which found and fixed two real defects — but it has not yet been validated against a genuinely independent, tool-less chat product. `DECISIONS.md` D54/D56/D58 record both the testing and the limitation.

---

## What this deliberately does not do

Worth stating up front, so nobody has to discover it by being disappointed:

- **It does not mirror or re-host FERSPAS.** Everything served here is a one-time conversion of specific, license-checked collections, with attribution embedded in the tiles themselves. It is a demonstration of reachability, not a copy of FAO's catalog.
- **It has no sub-national resolution beyond what HIH itself publishes.** There is no city-level or district-level data anywhere in this deployment. Staff is instructed to say so rather than approximate.
- **It covers three countries with commodity data**, not the full Hand-in-Hand country set: DR Congo (7 commodities), Côte d'Ivoire (5), Central African Republic (1), plus country-agnostic accessibility and fish-farming layers. Cameroon, Republic of Congo, and Bhutan are deliberately out of scope for now.
- **It is not a STAC client.** FERSPAS's COG assets sit behind an FAO WMTS wrapper on a bucket with no CORS headers, so a browser-side map cannot read them directly. That constraint shaped this project's architecture and is worth discussing on its merits — see [`README.md`](README.md)'s "The technical question".

---

## If you want to go deeper

- [`README.md`](README.md) — what this is and why the scope is what it is.
- [`CONCEPT.md`](CONCEPT.md) — the one-page version, suitable for forwarding.
- [`BACKGROUND.md`](BACKGROUND.md) — FAO, HIH, GAEZ, FERSPAS, the Initiative, and the data catalog.
- [`DECISIONS.md`](DECISIONS.md) — every architectural choice, every bug found and fixed, and every negative result, in chronological order. Internal working notes in a direct register; the honest record rather than the polished one.

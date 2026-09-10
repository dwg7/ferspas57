# ferspas57

**FERSPAS × Staccato** — a technical collaboration exploring how [Staccato](https://github.com/UNopenGIS/staccato-spec)'s geospatial architecture can connect to [FERSPAS](https://data.review.fao.org/remote-sensing-portal), FAO's Essential Remote Sensing data Product portal for Agrifood Systems.

This repository sits at the intersection of two UN Open GIS Initiative working groups:

- **DWG 5** (Geo-AI, centered on FAO and ITU) — whose FERSPAS system exposes curated, analysis-ready remote sensing products through a [STAC](https://stacspec.org/) catalog.
- **DWG 7** (Staccato / sovereign mapping) — whose Staff/Cartographer/Library architecture turns a plain-language question into a real map link, built deliberately on a lightweight `martin catalog` interface rather than STAC.

## Try it

**Live demo: [dwg7.unopengis.org/ferspas57](https://dwg7.unopengis.org/ferspas57/)** — a globe-projected MapLibre map serving real FAO data through this pipeline. No login, nothing to install.

If you have three minutes and want the shortest path to what this project is actually claiming, open this instead:

**[Why did FAO build the maize storage site where it did?](https://dwg7.unopengis.org/ferspas57/#narrative=N4IgdghgTlEC4EsBuBTA+qqBnBB7MIAXCAGYrYAOEWArAOwC0kM8yKA9EgIwgA0IiOABsUREABEASgAIAwvgDmuQtICC0gMoBbCEKHSAsgE8scckekIwhiAgBeKTXFywFo-qZQUsRANqgAYxQwMyg-ACYATgA6ABZY3gAGaJoAXX47XFwtIgAOfiEII3IfQl8QBQgUOwYquwBmepB0kACICkR8MUkEBQALOGl8aTg+xxQARwBXeBdeS2swF1GUalDrKTlFXGjpABU+hCxpaFXpEl0hY6mwABNyaQBxVQBRAC1pTLBHQBwCepU9lBcBQEAEsPMhLgAO6FO7zPpTLQIW6AXAJpIAUAhGKAAHnAAEZZADW5wgSBcEDxImkAXwtwQnTAxxILmkCiBUKsCmkOnsKGiIAAvrxAsFQhEYvEkikWplskQuIkCkUSn4KnVatVGnwQIc+gwabcGDyHAwsDSoKIWm0OngCMQAPKYQpGTnSABiqntAHJjsbHKZyW5pFgpvSKQghPSLGaXCh5qMjsGKLhBjGLcd6HEMdJ7kEQvM8VNBktBrgi6YIHdOfyhSKQuRxSk6LwGMlcnQZVkcoQuFwlcVsKrdfrcIa-abze4dQg9QajbYTSQrLpmvxrQyxABNFCDFbB+mOD32k4BOAzPTRlAiU8oW7SAAUe4td+TQiMSjAAEppJGUMcKWWgxcDQiSEloIy4CMYzBoBfS7AAknAxzPO8nz4I4iY-OEABsKgADKVneHKjMGKCYP6uARuwoSwFYP4IEicCsPgWBopiIYUMmWC3m+0g3BcZKwJSjiYoWgz0sGk7HNhNApPMECnuevGHP0DyjJWUH+geEGadISxQKMNbCq0ooNmUURNi2bYdhkXbyn2IDOiqZRqtUGoNE0-DDnO45plO3mjvOvIMEukBCKurTtBuxAAOp9BYUJlkId57j8NKMnAtHfKiP6EZJsbSCpYxQAA-O6no+tIAAShEMFYDA1Xc+XpicFonmelwWBATzwRoDB4tQt7clMQiIPqUAHhN3VkboMwMtS2R4lYroBJGOiIAEwahkxS2RnACX0n0J5BFgOC7VGJxNcmmD7Qwz5TKetrSBQE0uFGuyPGw1h7vBYD0ggrCoJVFq6NyRw4MMmLBHSYBctd5D7Zdd4IrDDz3ho4iPFw7AY484TfpiEk6ISf6kYyjjqYM3UUIUQTSFChwBEdDEvbgqDHBQKDAiIlWRuzC0jXeeKOEzuDcdYZHBJYJCWOJWBgF6VNsvg2Sgp1lj3LoNapAKQA)** — a four-step guided narrative through a real, verified finding in FAO's own data.

The short version of that finding: the site FAO's Hand-in-Hand process actually selected for maize storage sits about 150 km south of a GAEZ-favorable tropical lowland, in a zone flagged for severe soil and terrain limitations — and yet scores *higher* (65.5 vs 57.4). That isn't an error. Hand-in-Hand's siting score is a multi-criteria evaluation weighing accessibility and poverty-reduction priority alongside agronomic suitability, because HIH's mission is SDG1/SDG2, not agronomic optimality. Surfacing *that* — rather than a number on a map — is what this project is for.

See [`DEMO.md`](DEMO.md) for a fuller walkthrough, including what to look at if you have ten minutes rather than three.

## What actually exists

| | |
|---|---|
| **Cartographer** (map client) | [`docs/`](docs/) — MapLibre GL JS, globe projection, layer panel, cursor-anchored score comparison, dynamic AEZ legends, narrative playback. Served from GitHub Pages. |
| **Converted data** | 22 PMTiles sources served via [Martin](https://martin.maplibre.org/) at `stars.optgeo.org`, plus 13 sparse "final site" GeoJSON files at `depot.optgeo.org`. Every archive carries embedded `attribution` metadata. |
| **Coverage** | GAEZ v5 `AEZ33`/`AEZ57` (global); Hand-in-Hand siting scores + selected sites for DR Congo (7 commodities), Côte d'Ivoire (5), Central African Republic (1); country-agnostic accessibility (3) and fish-farming (4) layers. **355 real FAO-selected sites** in total. |
| **Narrative library** | 373 pre-authored, data-verified narratives in three tiers — 3 curated "why was this site chosen" stories ([`NARRATIVES.md`](NARRATIVES.md)), 355 per-site profiles, 15 multi-stop tours. |
| **Staff** | [`STAFF-PROMPT.md`](STAFF-PROMPT.md) — a system prompt, not a service. Pasted into any general-purpose chat agent, it turns a plain-language question into a link this Cartographer opens. |

## The technical question

Staccato's Library layer is built on `martin catalog`, not STAC — a deliberate scope decision (STAC's general-purpose, asset-centric model is broader than what Staccato's tile-centric Cartographer needs; see [`staccato-spec`'s `catalog-integration.md` §10](https://github.com/UNopenGIS/staccato-spec/blob/main/spec/catalog-integration.md)). That document commits to treating STAC as a *source to convert from at ingestion time*, not as Cartographer's primary discovery model. This repository is the first real test of that commitment.

**What the test found, honestly.** The original plan was to write a static STAC→`martin catalog` generator, mirroring [`hfu/layers-martin`](https://github.com/hfu/layers-martin), starting from FERSPAS's orthophoto products. Two findings redirected that:

1. **FERSPAS holds no orthophoto or aerial-imagery collections.** A full paged survey of all 1282 collections (2026-09-03), searched by keyword and by provider, found none — FERSPAS's content is overwhelmingly *derived and analytical* rasters (climate, soil, water productivity, crop suitability, disease risk, livestock density), not raw imagery. One externally-provided German orthophoto dataset present in June 2026 has since been removed from the catalog.
2. **A `/catalog` endpoint alone would not have been usable.** FERSPAS's COG assets sit behind an FAO WMTS wrapper on a bucket with no CORS headers, so a browser-side Cartographer cannot read them directly. Pointing a TileJSON document at them would have produced a catalog that looked correct and rendered nothing.

So the scope moved to where the interoperability question could actually be answered end to end: converting real FERSPAS-published rasters (GAEZ v5 and Hand-in-Hand) into tiles a Cartographer can genuinely open, with each source collection's license and attribution carried through rather than dropped. The result is a working vertical slice rather than a generator — a less general artifact, but one that answers the question with running code instead of a diagram.

## Why this repository exists

DWG 7's collaboration story has so far been built primarily in Japan — working with the GSI Hokkaido Regional Survey Department (see [`dwg7/chukei`](https://github.com/dwg7/chukei)) and generalizing that experience into reusable methodology (see [`dwg7/staccato-ecosystem`](https://github.com/dwg7/staccato-ecosystem)). This repository is DWG 7's first concrete step onto the *international cooperation* side of that same story: showing that the Staccato architecture is not tied to any one country's data infrastructure, and that it can genuinely interoperate with a system built and maintained by an international organization.

It exists because DWG 5's June 2026 presentation on FAO/ITU's Geo-AI systems (see [`UNopenGIS/7#932`](https://github.com/UNopenGIS/7/issues/932)) surfaced FERSPAS as a strong candidate for concrete technical collaboration: an open-access, STAC-based catalog of authoritative remote sensing products, from a team (FAO CSI, whose presentation was led by Zhongxin) that has already been generous with detailed technical information. This repository is meant as a reciprocal, good-faith step — a working demonstration offered in the same open spirit, not a one-sided request for FAO's data or attention. See [`CONCEPT.md`](CONCEPT.md) for the one-page version of that framing.

## Significance for the UN Open GIS Initiative

This is one of the Initiative's first concrete cross-DWG technical collaborations, not just a shared meeting or a joint presentation. If it works, it demonstrates something the Initiative as a whole benefits from showing: that working groups built around different mandates and different mental models (FAO's asset-centric, analysis-oriented STAC catalog; DWG 7's tile-centric, conversational map-link generation) can interoperate at the data layer without either side abandoning its own architecture.

Two design decisions from this work have already gone back upstream into the Staccato specification: [ADR 0009](https://github.com/UNopenGIS/staccato-spec/pull/6) (Map Intent is the required baseline Staff→Cartographer vocabulary, not the only one — merged 2026-09-04) and [ADR 0010](https://github.com/UNopenGIS/staccato-spec/blob/main/spec/adr/0010-narrative-sequencing.md) (narrative sequencing, drafted from this repository's and [`kataribe`](https://github.com/dwg7/kataribe)'s real implementations).

It is also the technical substance behind an upcoming FAO CSI talk, ["Geospatial Access for AI Assistants"](https://github.com/UNopenGIS/7/issues/994) (2026-09-28), which cites this DWG5×DWG7 collaboration directly.

## Attribution and licensing

The data shown here is FAO's, not this project's. GAEZ v5 layers are CC BY 4.0; Hand-in-Hand layers are attributed as "FAO GISMGR / Hand-in-Hand Initiative (CC BY 4.0)" per the license recorded on the specific collections converted so far. FERSPAS's ~1282 collections carry mixed licenses (CC-BY, CC-BY-SA, CC-BY-NC-SA, and various FAO terms), and some carry no license link at all — this project's working policy is to exclude or flag those rather than assume they are open. The technical understanding this repository builds on comes substantially from FAO CSI's June 2026 presentation to DWG 5.

This repository's own code and documentation are [CC0 1.0 Universal](LICENSE), matching the other `dwg7` repos.

## Relationship to sibling repositories

- [`UNopenGIS/staccato-spec`](https://github.com/UNopenGIS/staccato-spec) — the normative Staccato architecture. Technical/architectural learnings from this integration flow back here (see ADR 0009 / ADR 0010 above).
- [`dwg7/staccato-ecosystem`](https://github.com/dwg7/staccato-ecosystem) — value-proposition and collaboration methodology. Learnings about *how* this kind of international, cross-organization collaboration is conducted flow back here.
- [`dwg7/cafebabe`](https://github.com/dwg7/cafebabe) — cross-project technical/process pattern pool.
- [`dwg7/chukei`](https://github.com/dwg7/chukei) — the domestic counterpart of this repository: a concrete Staff-role deployment for GSI Hokkaido. Where `chukei` is Japan-facing, `ferspas57` is FAO/international-facing.
- [`hfu/layers-martin`](https://github.com/hfu/layers-martin) — the existing reference implementation of a `martin catalog`-compatible static generator, for GSI's `layers.txt`.

## Repository guide

- [`DEMO.md`](DEMO.md) — what to open, in what order, and what to say about it.
- [`CONCEPT.md`](CONCEPT.md) — one-page summary suitable for an email or an attachment.
- [`BACKGROUND.md`](BACKGROUND.md) — reference knowledge: FAO, HIH, GAEZ, FERSPAS, the Initiative, and the data catalog.
- [`STAFF-PROMPT.md`](STAFF-PROMPT.md) / [`NARRATIVES.md`](NARRATIVES.md) / [`NARRATIVE-FORMAT.md`](NARRATIVE-FORMAT.md) — the conversational layer: the prompt, the narrative library, and the document schema.
- [`HANDOVER.md`](HANDOVER.md) — current state and immediate next steps.
- [`DECISIONS.md`](DECISIONS.md) — the full ADR-lite decision log: every architectural choice, every bug found and fixed, every negative result. Internal working notes, written in a direct register.

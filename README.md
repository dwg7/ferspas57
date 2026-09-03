# ferspas57

**FERSPAS × Staccato** — a technical collaboration exploring how [Staccato](https://github.com/UNopenGIS/staccato-spec)'s geospatial architecture can connect to [FERSPAS](https://data.review.fao.org/remote-sensing-portal), FAO's Essential Remote Sensing Data Product Portal.

This repository sits at the intersection of two UN Open GIS Initiative working groups:

- **DWG 5** (Geo-AI, centered on FAO and ITU) — whose FERSPAS system exposes curated, authenticated, analysis-ready remote sensing products through a [STAC](https://stacspec.org/) catalog.
- **DWG 7** (Staccato / sovereign mapping) — whose Staff/Cartographer/Library architecture turns a plain-language question into a real map link, built deliberately on a lightweight `martin catalog` interface rather than STAC.

## Why this repository exists

DWG 7's collaboration story has so far been built primarily in Japan — working with the GSI Hokkaido Regional Survey Department (see [`dwg7/chukei`](https://github.com/dwg7/chukei)) and generalizing that experience into reusable methodology (see [`dwg7/staccato-ecosystem`](https://github.com/dwg7/staccato-ecosystem)). This repository is DWG 7's first concrete step onto the *international cooperation* side of that same story: showing that the Staccato architecture is not tied to any one country's data infrastructure, and that it can genuinely interoperate with a system built and maintained by an international organization.

It exists because DWG 5's June 2026 presentation on FAO/ITU's Geo-AI systems (see [`UNopenGIS/7#932`](https://github.com/UNopenGIS/7/issues/932)) surfaced FERSPAS as a strong candidate for concrete technical collaboration: an open-access, STAC-based catalog of authoritative remote sensing products, from a team (FAO CSI, whose presentation was led by Zhongxin) that has already been generous with detailed technical information. This repository is meant as a reciprocal, good-faith step — a working demonstration offered in the same open spirit, not a one-sided request for FAO's data or attention.

## The technical question

Staccato's Library layer is built on `martin catalog`, not STAC — a deliberate scope decision (STAC's general-purpose, asset-centric data-catalog model is broader than what Staccato's tile-centric Cartographer needs; see [`staccato-spec`'s `catalog-integration.md` §10](https://github.com/UNopenGIS/staccato-spec/blob/main/spec/catalog-integration.md)). That document already commits to treating STAC as a *source* to convert from at ingestion time, not as Cartographer's primary discovery model. This repository is the first real test of that commitment: writing a `martin catalog`-compatible interface for a slice of FERSPAS's STAC catalog — starting with FERSPAS's orthophoto products — so that Staccato can demonstrably reach FERSPAS data through its existing Library mechanism, the same way it already reaches Japanese GSI data via [`layers-martin`](https://github.com/hfu/layers-martin).

## Significance for the UN Open GIS Initiative

This is one of the Initiative's first concrete cross-DWG technical collaborations, not just a shared meeting or a joint presentation. If it works, it demonstrates something the Initiative as a whole benefits from showing: that working groups built around different mandates and different mental models (FAO's asset-centric, analysis-oriented STAC catalog; DWG 7's tile-centric, conversational map-link generation) can interoperate at the data layer without either side abandoning its own architecture. It is also the technical substance behind an upcoming FAO CSI talk, ["Geospatial Access for AI Assistants"](https://github.com/UNopenGIS/7/issues/994) (2026-09-28), which cites this DWG5×DWG7 collaboration directly.

## Relationship to sibling repositories

- [`UNopenGIS/staccato-spec`](https://github.com/UNopenGIS/staccato-spec) — the normative Staccato architecture. Technical/architectural learnings from this integration (catalog conversion patterns, STAC↔martin-catalog mapping conventions) flow back here.
- [`dwg7/staccato-ecosystem`](https://github.com/dwg7/staccato-ecosystem) — value-proposition and collaboration methodology. Learnings about *how* this kind of international, cross-organization collaboration is conducted flow back here — this repo's domestic counterpart there is `dwg7/chukei`.
- [`dwg7/cafebabe`](https://github.com/dwg7/cafebabe) — cross-project technical/process pattern pool. Anything general-purpose that isn't specific to FERSPAS or Staccato belongs there.
- [`dwg7/chukei`](https://github.com/dwg7/chukei) — the domestic counterpart of this repository: a concrete Staff-role deployment, for GSI Hokkaido. Where `chukei` is Japan-facing, `ferspas57` is FAO/international-facing.
- [`hfu/layers-martin`](https://github.com/hfu/layers-martin) — the existing reference implementation of a `martin catalog`-compatible static generator (for GSI's `layers.txt`). This repository's FERSPAS↔STAC generator is architecturally the same kind of tool, aimed at a different source.

## Status

Just founded (2026-09-03). See [`HANDOVER.md`](HANDOVER.md) for the current state and the immediate next task.

## License

[CC0 1.0 Universal](LICENSE), matching the other `dwg7` repos. Note: CC0 covers this repository's own code and documentation only — the FERSPAS data products themselves carry their own, varied licenses (see `HANDOVER.md`).

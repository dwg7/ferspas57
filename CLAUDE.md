# ferspas57 — Project Context

Persistent context for Claude Code sessions working in this repository (`dwg7/ferspas57`, cloned at `/Users/hfu/ferspas57`). If a session starts here, read this file, then read `HANDOVER.md` for the current status.

**Language convention**: English, for this repo specifically — unlike `dwg7/staccato-ecosystem`'s Japanese-primary content-document policy, this repo's whole point is international/FAO-facing collaboration, so English is the default working language throughout (meta-docs and content alike). Chat with hfu (the maintainer) happens in Japanese regardless, matching every other `dwg7` repo.

## What this project is

A technical collaboration repository connecting two UN Open GIS Initiative working groups: **DWG 5** (Geo-AI, centered on FAO and ITU) and **DWG 7** (Staccato / sovereign mapping). Concretely, it is where DWG 7 writes a `martin catalog`-compatible interface for [FERSPAS](https://data.review.fao.org/remote-sensing-portal) — FAO's Essential Remote Sensing Data Product Portal, whose native interface is [STAC](https://stacspec.org/) — so that Staccato's Library layer can reach FERSPAS data the same way it already reaches GSI (Japan) data via [`hfu/layers-martin`](https://github.com/hfu/layers-martin).

**Founding motivation**: DWG 5's June 2026 presentation on FAO/ITU's Geo-AI systems ([`UNopenGIS/7#932`](https://github.com/UNopenGIS/7/issues/932), led by Zhongxin's FAO CSI team) surfaced three systems worth a closer look — Zindi's GEO-AI Challenge, AIDA (FAO's agentic GIS assistant), and FERSPAS. Of the three, FERSPAS stood out to hfu as the strongest candidate for concrete technical collaboration: open-access data policy, STAC as a genuine communication layer (not just metadata decoration), and a clean conceptual fit with what Staccato's Library already needs to do (resolve a catalog into map-openable sources). `UNopenGIS/7#997` is this work's founding issue, a child of `#932`.

**hfu's explicit framing (2026-09-03)**: this repository should carry, front and center, both the technical substance *and* the collaborative intent behind it — see "Positive intent" below. A session working here should never treat this as a purely technical scraping/conversion task; the relationship with FAO CSI's team is the point at least as much as the working code is.

## Positive intent — read this before writing anything technical

This repository exists to **reciprocate**, not extract. FAO CSI's June 2026 presentation was unusually detailed and generous with technical information about systems (FERSPAS, AIDA) that aren't typically well-documented publicly (see the PDF referenced in `#932`, and hfu's comment there thanking Ariel for the level of detail shared). DWG 7's response is to build something real and working — not just a proposal, a slide, or a data pull — as a way of showing that DWG 7 takes that openness seriously and is investing real effort in return.

Concretely, this means:

- **Attribute and credit generously.** When documenting FERSPAS or citing its data, name FAO CSI's team and Zhongxin's presentation as the source of the specific technical understanding this repo builds on, not just "FAO" abstractly.
- **Respect FERSPAS's own terms exactly.** The STAC catalog documented in `HANDOVER.md` mixes CC-BY, CC-BY-SA, CC-BY-NC-SA, and various "proprietary-but-often-effectively-open" FAO licenses across its ~157 collections. Never assume open-by-default; check and record the specific license of whatever collection this repo actually ingests (see `HANDOVER.md`'s open item on this).
- **Build something FAO's own team could look at and recognize as useful**, not just useful to DWG 7. A working `/catalog` + `/{sourceID}` TileJSON interface that correctly represents FERSPAS's orthophoto collection, with correct attribution and license metadata, is itself a small contribution back to the FERSPAS ecosystem — anyone building a lightweight STAC consumer could reuse the same conversion patterns.
- **Keep DWG 5 (yuiseki, hfu) informed as this progresses**, and route anything that would interest them (e.g. AIDA — a separate, closed-source FAO system yuiseki is independently pursuing contact about, tracked in `#932`, not part of this repo's scope) back to `#932` rather than letting it silently diverge here.

## Significance for the UN Open GIS Initiative

Most of the Initiative's cross-DWG interaction so far has been informational — presentations, seminars, exploratory issue threads. This repository is meant to be one of the first concrete, working cross-DWG *technical* collaborations: DWG 7's architecture actually consuming a DWG 5-adjacent organization's real data catalog. Two things make this worth doing carefully rather than quickly:

1. It is real evidence, usable elsewhere in the Initiative, that working groups with genuinely different architectural starting points (FAO's asset-centric STAC vs. DWG 7's tile-centric `martin catalog`) can interoperate without either side abandoning its own model — see the technical hypothesis in `staccato-spec`'s `catalog-integration.md` §10, which this repo is the first real test of.
2. It is the technical substance behind an actual public commitment: [`UNopenGIS/7#994`](https://github.com/UNopenGIS/7/issues/994), a FAO CSI talk titled "Geospatial Access for AI Assistants" on **2026-09-28**, which explicitly cites `#932` (and by extension this collaboration) as part of its motivation. Whatever this repo can show working by then reflects on the Initiative's credibility, not just DWG 7's.

## Relationship to sibling repos

- **`UNopenGIS/staccato-spec`** — the normative Staccato architecture. Read `spec/catalog-integration.md` (especially §10, the STAC-as-source-not-primary-model decision) before designing anything here. Technical/architectural learnings from this integration (catalog conversion patterns, STAC↔martin-catalog mapping conventions worth generalizing) belong there, not here.
- **`dwg7/staccato-ecosystem`** — value-proposition and collaboration methodology, currently Japan/domestic-implementation-focused (see its `methodology/` directory). This repo is its international-cooperation counterpart to `dwg7/chukei`. Learnings about *how* this cross-organization collaboration was actually conducted — not the STAC/martin technical details — belong there.
- **`dwg7/cafebabe`** — cross-project pattern pool. Anything general-purpose to `dwg7` that isn't specific to FERSPAS or Staccato belongs there, not here.
- **`dwg7/chukei`** — the domestic analogue: a concrete Staff-role deployment for GSI Hokkaido. Useful as a structural comparison, not a technical one (chukei is prompt-engineering work; this repo is catalog/data-integration work).
- **`hfu/layers-martin`** — the concrete reference implementation of what a `martin catalog`-compatible static generator looks like (source: GSI's `layers.txt`; output: static `/catalog` + `/{sourceID}` TileJSON on GitHub Pages, tiles referenced not duplicated). Read this repo's code and README before designing the FERSPAS equivalent — don't reinvent conventions it already established.

**When something learned here belongs elsewhere**: don't let insight silently pile up only in this repo. If it's a spec-level architectural pattern → open a `staccato-spec` PR/ADR. If it's about the international-collaboration process itself → hand it to a `staccato-ecosystem` session. If it's a generic `dwg7` technical pattern → `cafebabe`. `HANDOVER.md` should track which of these is owed and hasn't happened yet.

## Continuity files

- `HANDOVER.md` — current state, what's next, and the concrete technical starting points (FERSPAS STAC endpoint, license landscape, target scope). **Read this first in any new session.**
- `DECISIONS.md` — ADR-lite decision log, append-only, newest at the top (matches `dwg7/chukei`'s and `dwg7/staccato-ecosystem`'s convention).

# Handover Notes

Read this first in any new session on this repo.

## What's true as of 2026-09-03

- **Repo just founded**, scaffolded by a Claude Code session working in `dwg7/staccato-ecosystem` at hfu's request. Nothing beyond `README.md`, `CLAUDE.md`, `HANDOVER.md` (this file), `DECISIONS.md`, `LICENSE` exists yet. No code, no ingestion pipeline, no target collection chosen.
- **Founding issue**: [`UNopenGIS/7#997`](https://github.com/UNopenGIS/7/issues/997), a child of [`#932`](https://github.com/UNopenGIS/7/issues/932) (the original DWG5×DWG7 exploration) and related to the meta-issue [`#995`](https://github.com/UNopenGIS/7/issues/995).
- **The FERSPAS STAC endpoint is live and reachable**: `https://data.review.fao.org/geospatial/search/stac/collections`. Verified 2026-09-03: it returns a paginated (token-based `next` link) list, **1282 collections total** as of that date — substantially more than the ~157 hfu manually surveyed and summarized in `#932` in June 2026 (see that issue's 2026-06-18 comments for a still-useful but now-partial license/domain breakdown). **Do not treat that June summary as current** — re-survey before relying on it.
- **License is recorded per collection**, as a `links` entry with `"rel": "license"` pointing at a URL (e.g. `https://creativecommons.org/licenses/by/4.0/`). Some collections carry no license link at all — treat those as unresolved/needs-asking, not as implicitly open.
- **No orthophoto/DOP collection was found in a quick keyword pass** (`ortho`, `dop`, `aerial`, `imagery`) over the first page (300 of 1282) of collections during this session. The Niedersachsen DOP dataset hfu noted in `#932`'s June comment may no longer be present under the same ID, may use different terminology, or may simply be further into the paginated list than was checked. **Finding hfu's intended target collection (FERSPAS orthophoto products) is the first real task here** — see "Immediate next task" below.

## The technical starting point

- `staccato-spec`'s [`catalog-integration.md` §10](https://github.com/UNopenGIS/staccato-spec/blob/main/spec/catalog-integration.md) already commits to the approach this repo should follow: treat STAC as a source to convert *from*, not as Cartographer's primary discovery model; materialize a TileJSON-shaped, `martin catalog`-compatible representation at ingestion time.
- [`hfu/layers-martin`](https://github.com/hfu/layers-martin) is the concrete precedent to study and structurally mirror: it statically generates a Martin-compatible `/catalog` (source list) and `/{sourceID}` (TileJSON) from GSI's `layers.txt`, hosted on GitHub Pages, referencing existing tile URLs rather than duplicating tile data. Read its README and code before designing this repo's STAC equivalent — the goal is the same output shape (`/catalog` + `/{sourceID}` TileJSON), different input (STAC Collections/Items instead of `layers.txt`).
- FERSPAS's STAC assets are not necessarily already-tiled (PMTiles/XYZ) — they may be COGs (Cloud-Optimized GeoTIFFs) or other raster formats requiring a tiling layer (e.g. a COG-aware tile server, or pre-generated PMTiles) before they fit the `martin catalog` model at all. This needs investigating per-collection; don't assume a 1:1 STAC-Item-to-TileJSON mapping is always possible without an intermediate tiling step.

## Immediate next task

1. Page through the FERSPAS STAC collections endpoint (`?token=...` pagination) looking specifically for orthophoto/aerial-imagery products — check collection `title`/`description`/`keywords` fields, not just `id`, since naming conventions vary (`fao-gismgr:...` prefixes suggest an internal FAO GISMGR taxonomy that may not use the word "ortho" at all).
2. For any candidate collection, resolve and record its license (`rel: "license"` link) before doing anything else with it — some FERSPAS collections are CC-BY-NC-SA or otherwise restricted (see the June survey in `#932` for examples, even though the specific collection list has since grown/changed).
3. If no clean orthophoto collection turns up, that itself is useful — a good moment to reach out to FAO CSI directly (in the spirit described in `CLAUDE.md`'s "Positive intent" section) and ask, rather than guessing. hfu already has a live channel to Zhongxin's team via the email thread referenced in `#932`.
4. Once a target collection is chosen, prototype the STAC → TileJSON conversion for just that one collection before generalizing — mirroring `layers-martin`'s incremental, source-referencing (not data-copying) approach.

## Timeline

[`UNopenGIS/7#994`](https://github.com/UNopenGIS/7/issues/994) — a FAO CSI talk, "Geospatial Access for AI Assistants," **2026-09-28** — cites this collaboration. Something concrete and demonstrable by then is the practical target, not a hard technical deadline for full generality.

## Open questions for whoever picks this up

- Which specific FERSPAS collection(s) count as "orthophoto" in hfu's intended sense — literal aerial/satellite orthophotography, or more broadly any FERSPAS raster product suitable as a Staccato basemap/overlay layer? Confirm with hfu if the first candidate found doesn't feel like an obvious fit.
- Static generation (à la `layers-martin`, GitHub Pages) vs. some other hosting model — `layers-martin`'s approach is the default assumption but hasn't been explicitly re-confirmed for FERSPAS's likely-larger/COG-heavy assets.
- How to handle collections with no license link at all, or with a link that doesn't resolve to a clear machine-readable license — needs a policy, probably "exclude and flag" rather than "assume open."
- Where things learned here get written up once there's real substance: a PR/ADR against `staccato-spec` for technical patterns, a session with `dwg7/staccato-ecosystem` for the collaboration-process side — see `CLAUDE.md`'s "When something learned here belongs elsewhere."

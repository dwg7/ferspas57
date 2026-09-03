# Background

Reference knowledge for anyone — human or AI — trying to understand what this
project sits on top of. English throughout, per `CLAUDE.md`'s language
convention for this repo.

## 1. What this document is

This is background knowledge, not instructions. `STAFF-PROMPT.md` is the
operational system prompt for this project's future "Staff" (the LLM that
will eventually turn a user's question into a Map Intent) — it tells the
Staff *what to do*. This document exists separately and is referenced *from*
that prompt, to tell the Staff (and anyone else who wants to understand this
project) *what things are*: FAO, HIH, GAEZ, the UN Open GIS Initiative, this
project's own goals, and what data actually sits behind it.

Two reasons to keep this separate from the prompt itself, rather than folding
it in:

- A system prompt should stay short and task-focused. Background knowledge
  that's mostly stable (what FAO is doesn't change week to week) doesn't need
  to be re-read as instructions every time; it needs to be *available* to
  consult.
- This document is also meant to be useful to people — hfu, DWG5/DWG7
  collaborators, anyone at FAO who stumbles across this repo — not just to an
  LLM. A system prompt written for an LLM's consumption reads badly as prose
  for a human; this document is written as prose first.

If something here turns out to be wrong or goes stale, fix it here, not by
duplicating a correction into `STAFF-PROMPT.md`.

## 2. FAO

The Food and Agriculture Organization of the United Nations is the UN
specialized agency for food, agriculture, and rural development —
headquartered in Rome (hence `story.js`'s inclusion of Italian among its
narrative languages: a deliberate nod to the host country, alongside the UN's
six official languages). FAO's mandate spans agricultural statistics, food
security monitoring, land and water resource management, fisheries, forestry,
and — increasingly, and most relevant to this project — geospatial data
infrastructure supporting all of the above. FAO turned 80 in 2025, a
milestone GAEZ v5's launch was deliberately timed to (§6).

## 3. FAO CSI (Digitalization and Informatics Division)

**CSI is FAO's Division of Digitalization and Informatics**, led by FAO's
Chief Information Officer. It's responsible for FAO's IT policy, data
management and protection, and IT service provision organization-wide — and,
concretely for this project, it's the team that actually operates FERSPAS
(§5) and the WMTS tile wrapper in front of it
(`https://data.apps.fao.org/map/wmts/wmts`, self-identifying via
`GetCapabilities` as "FAO WMTS WRAPPER", provider "FAO CSI"). It also
publishes under the name "Digital FAO and Agro-informatics Division" in some
contexts (e.g. its Agro-informatics Tech Talks series).

This is the team behind [`UNopenGIS/7#932`](https://github.com/UNopenGIS/7/issues/932)'s
June 2026 DWG5 presentation that this whole project traces back to — Zhongxin
led that presentation, and Mohamed Megahed is named as the WMTS wrapper's
technical contact. When this repo's `CLAUDE.md` talks about "reciprocating"
FAO CSI's generosity with technical detail, this is the specific team it
means, not FAO in the abstract.

[Source: search results on FAO's Digitalization and Informatics Division and
Agro-informatics Tech Talks, 2026-09.]

## 4. The Hand-in-Hand Initiative (HIH)

HIH is FAO's **evidence-based, country-led and country-owned initiative to
accelerate agricultural transformation and sustainable rural development**,
aimed squarely at two Sustainable Development Goals: **SDG1 (end poverty)**
and **SDG2 (end hunger and all forms of malnutrition)**. Its geospatial
platform launched **21 July 2020**, bringing together data from over 20 FAO
technical units — soil, land, water, climate, fisheries, livestock, crops,
forestry, trade, social and economic data — into what FAO describes as over
a million geospatial layers and thousands of statistical series, sourced not
just from FAO itself but from partner UN agencies, NGOs, the private sector,
and space agencies.

**Why this matters for interpreting HIH's own scores** (this is the finding
behind this project's sample narrative, `story.js`'s `SAMPLE_STORY`): HIH's
per-site "Score" and "FinalLocation" layers are not simple agro-climatic
suitability maps. They come out of a **GIS-based multi-criteria evaluation**
that combines climatic/agronomic suitability with accessibility (distance to
markets, ports, urban demand) and poverty-reduction priority. This is why a
site with objectively worse GAEZ agro-ecological conditions can score *higher*
than a climatically ideal one — HIH's actual mission is poverty and hunger
reduction, not agronomic optimality, so a place that would improve real
people's lives can rank above a place that would merely grow better maize.
Any narrative or explanation the Staff generates about *why* a particular
site was selected should reach for this multi-criteria explanation, not
assume the raw agro-ecological data is the whole story.

[Source: ReliefWeb, UN-SPIDER, and FAO's own Hand-in-Hand pages, search
results 2026-09; the SDG1/SDG2 framing and multi-criteria interpretation
are corroborated by this project's own investigation, `DECISIONS.md`'s
earlier "small mystery in maize storage" finding.]

## 5. FERSPAS

FERSPAS is FAO's **Essential Remote Sensing data Product portal for
Agrifood Systems**. It's a STAC (SpatioTemporal Asset Catalog) API,
`https://data.review.fao.org/geospatial/search/stac/collections`, exposing
(as of this project's most recent full survey) **1282 collections**,
overwhelmingly derived/analytical rasters — climate, soil, water
productivity, crop suitability, disease risk, livestock density — rather
than raw satellite imagery. Every sampled item follows a uniform shape: one
Cloud-Optimized GeoTIFF (COG) asset plus preview/thumbnail assets served
through FAO CSI's own WMTS wrapper (§3). The catalog is generated by an
internal FAO pipeline (`fao-gismgr:*` collection ID prefixes across 33
top-level sub-catalogs), which is why its structure is far more uniform than
what STAC-the-specification would technically allow.

FERSPAS's stated purpose — lowering technical barriers so remote-sensing
data can actually be used in agricultural decisions, not just published — is
explicitly the same problem this project (`ferspas57`, §9) exists to help
with from the Staccato/DWG7 side: making that data reachable through a
different, tile-centric architecture without either side abandoning its own
model. There is also a public FAO reference implementation worth knowing
about, [`un-fao/FERSPAS_demo`](https://github.com/un-fao/FERSPAS_demo), for
anyone who wants to see how FAO itself demonstrates the portal.

**A licensing note that matters in practice**: FERSPAS collections carry a
per-collection license link (e.g. CC-BY-4.0), but not uniformly — some
collections have no license link at all. This project's working policy,
established the hard way (`DECISIONS.md`), is to treat an absent license as
"unresolved, not implicitly open" and exclude or flag such collections rather
than assume permission.

[Source: FAO's own portal-launch announcement (2026-09 search); collection
count, structure, and licensing findings are this project's own direct STAC
survey, recorded in `DECISIONS.md`.]

## 6. GAEZ (Global Agro-Ecological Zones)

GAEZ is a **four-decade FAO/IIASA (International Institute for Applied
Systems Analysis) partnership** modeling the capacity of the world's land to
support agriculture, originating in the 1980s. **GAEZ v5 launched 14 April
2025**, timed to FAO's 80th anniversary, with a 2020 baseline, statistical
data through 2019–2021, and global spatial resolution improved to **30
arc-seconds (~1km)** for key outputs. This project uses two of GAEZ v5's
classification layers: **AEZ33** (33-class) and **AEZ57** (57-class, a
finer-grained scheme combining thermal-climate, moisture, and soil/terrain
factors), both confirmed to be **global in extent** — unlike HIH data, which
is national/sub-national — so the same `gaez-aez33`/`gaez-aez57` archives
this project already built cover every HIH country without rework.

[Source: FAO and IIASA's own GAEZ v5 launch announcements, search results
2026-09; layer choice and extent confirmation are this project's own,
`DECISIONS.md`.]

## 7. The UN Open GIS Initiative

Established in 2016, the UN Open GIS Initiative's goal is to identify and
build an open-source geospatial software "bundle" meeting UN mandates and
operational needs, drawing on expertise from member states, international
organizations, academia, and others. Its work is organized into numbered
**Domain Working Groups (DWGs)**, each with its own focus:

| DWG | Focus |
|---|---|
| 1 | Hybrid GIS Platform |
| 2 | Capacity Building |
| 5 | **GEOAI and Geo-Analytics** |
| 6 | OpenDroneMap and 3D |
| 7 | **Smart Maps** |
| 8 | Open-source Implementation of IGIF |

(Numbers 3/4 exist in some of the Initiative's own materials as differently
named "spirals" from an earlier organizational scheme — not load-bearing for
this project; the two rows that matter here are 5 and 7, §8.)

[Source: unopengis.org's own DWG listing and UN Open GIS Initiative
background materials, search results 2026-09.]

## 8. DWG5 and DWG7 — and where "Staccato" fits

**DWG5 (GEOAI and Geo-Analytics)** is co-chaired by UN Global Pulse, FAO, and
Politecnico di Milano. Its focus is analytical geospatial products — image
analysis and interpretation for monitoring, situational awareness, and
planning/decision support — including AI-driven work like automated refugee
camp mapping, flood-map generation, and damage detection. FAO's presence
co-chairing DWG5 is exactly why FAO's own Geo-AI systems (FERSPAS, and
separately AIDA — FAO's own agentic GIS assistant, tracked independently by
DWG5 member yuiseki, out of scope for this repo) surfaced as candidates worth
DWG7 investigating for concrete collaboration in the first place.

**DWG7 (Smart Maps)** is, per its own stated mission, "an open community of
practice... test[ing] new technologies for future geospatial operations,"
with a vision to "keep web maps open." **"Staccato" is not DWG7's official
name — it's `dwg7`'s own specific architecture and project name** for a
sovereign, tile-centric mapping model (User/Staff/Cartographer/Library —
see `staccato-spec`) built within DWG7's broader mission. Similarly,
`dwg7` (the GitHub organization this repo lives in) is the working name for
the group of people actually building that architecture, not a UN-official
designation.

This project, `ferspas57`, is `dwg7`'s technical response to what DWG5's June
2026 presentation surfaced — the first real, working cross-DWG technical
collaboration of its kind, not just an informational exchange (see §9 and
`CLAUDE.md`'s "Significance for the UN Open GIS Initiative").

[Source: DWG5/DWG7's own descriptions per unopengis.org, search results
2026-09; the Staccato/dwg7 naming distinction is this project's own,
established in `CLAUDE.md`.]

## 9. This project (ferspas57)

`ferspas57` (this repository, `dwg7/ferspas57`) is DWG7's implementation of a
`martin catalog`-compatible interface for FERSPAS (§5) — the concrete,
working proof that Staccato's tile-centric architecture and FAO's
asset-centric STAC catalog can interoperate without either side abandoning
its own model (`staccato-spec`'s `catalog-integration.md` §10 names this as
a real, prior architectural commitment; this project is its first real-world
test).

**What actually exists as of this writing**: a live client
([dwg7.github.io/ferspas57](https://dwg7.github.io/ferspas57/)) built with
MapLibre GL JS, serving real converted data — GAEZ AEZ33/AEZ57
classifications (global) and Hand-in-Hand data for DR Congo, with expansion
to Côte d'Ivoire, Central African Republic, Cameroon, and Republic of Congo
in progress — via `stars.optgeo.org` (Martin, PMTiles) and
`depot.optgeo.org` (static GeoJSON). It supports a hand-authored narrative
story mode, a spec-compliant Map Intent paste/URL-fragment mechanism
(`staccato-spec` ADRs 0001/0004/0005/0007), dynamic legends, and a
cursor-anchored score-comparison probe. What does **not** yet exist is the
"Staff" itself: an LLM that actually takes a user's open-ended question and
produces a Map Intent. `STAFF-PROMPT.md` and this document are groundwork for
that, not the Staff running.

**The framing that matters more than any of the above** (`CLAUDE.md`'s
"Positive intent" section, worth repeating here since it's easy to lose sight
of while working on tile pipelines): this project exists to **reciprocate**
FAO CSI's unusually generous technical disclosure in its June 2026
presentation, not to extract data from FERSPAS one-sidedly. Concretely, that
means: attribute FAO CSI's team by name, not just "FAO" abstractly; respect
each dataset's actual license rather than assuming openness; and build
something FAO's own team could look at and recognize as a genuine
contribution back to the FERSPAS ecosystem, not just something useful to
DWG7. There's also a concrete public commitment riding on this:
[`UNopenGIS/7#994`](https://github.com/UNopenGIS/7/issues/994), a FAO CSI
talk on 2026-09-28 that cites this collaboration as part of its own
motivation.

## 10. The data catalog: source data and what's actually hosted

### Source data (FERSPAS's own STAC catalog)

Everything this project serves is derived from real FERSPAS STAC items,
under the `fao-gismgr:HIH:*` and `fao-gismgr:GAEZ-V5:*` collection prefixes.
Two data shapes matter, discovered by inspecting the actual rasters rather
than trusting metadata alone:

- **HIH "Score"/"LocationScore" layers** are continuous (Float32), with a
  *hidden* `-9999` sentinel value layered on top of the collection's declared
  NoData — roughly half of nominally "valid" pixels in the first one checked
  carried this sentinel. These need explicit masking and a fixed 0–100
  domain, not a per-file auto-stretch.
- **HIH "FinalLocation" layers** are near-binary (Int16), with only a
  handful of true "selected site" pixels out of millions (417 of ~18M
  checked) — too sparse to survive raster downsampling, so these are
  converted to **vector** GeoJSON polygons instead of tiled rasters.
- **GAEZ AEZ33/AEZ57** are categorical classification rasters, global in
  extent, requiring nearest-neighbor resampling at every processing step to
  avoid corrupting class boundaries.

Licensing is per-collection (see §5's caveat) — GAEZ v5 layers are
CC BY 4.0; HIH/FAO GISMGR layers are attributed as "FAO GISMGR / Hand-in-Hand
Initiative (CC BY 4.0)" in this project's own generated tiles, per the
license actually recorded for the specific collections converted so far —
always check the specific collection's own license link before assuming this
holds for a not-yet-converted one.

### What's actually hosted (this project's derived, converted data)

Nothing served by this project is a raw copy of FERSPAS data — everything is
converted, once, into either PMTiles (raster/categorical data, via Martin at
`stars.optgeo.org`) or static GeoJSON (sparse vector "final site" data, via
Caddy at `depot.optgeo.org`). The conversion pipeline (COG → color-table VRT
→ MBTiles with forced nearest-neighbor resampling at every step → pyramid →
PMTiles, or COG → masked/isolated → polygonized GeoJSON for sparse data) is
documented in full, with every hard-won flag and gotcha, in `DECISIONS.md`.

As of this writing, live layers are: `gaez-aez33`, `gaez-aez57` (global);
`hih-cod-{cassava,cocoa,coffee,maize,palmoil,wheat,livestock}-{score,final}`,
`hih-access-{urban,urban-weighted,port}`, and
`hih-fishfarm-{closed,closed-final,open,extensive}` (DR Congo, with
accessibility/fish-farming already designed to merge in other countries'
geometry without renaming). Exact, current layer IDs should always be
cross-checked against `docs/index.html`'s `rasterLayers`/`vectorLayers`
arrays — this document describes the shape of the catalog, not a promise
that a specific ID will never change.

## 11. Where to go deeper

- `DECISIONS.md` — the full, chronological decision log for this project:
  every architectural choice, every bug hit and fixed, every piece of
  external research. The most detailed record of *why* anything here is the
  way it is.
- `HANDOVER.md` — current state and immediate next steps, kept up to date as
  the authoritative "what's actually true right now" summary.
- `STAFF-PROMPT.md` — the operational prompt this document is meant to
  support, if a Staff LLM is ever actually wired up to it.
- [`staccato-spec`](https://github.com/UNopenGIS/staccato-spec) — the
  normative Staccato architecture (User/Staff/Cartographer/Library,
  Map Intent format, the ADRs this project's Cartographer implements).
- [`UNopenGIS/7#932`](https://github.com/UNopenGIS/7/issues/932) and
  [`#997`](https://github.com/UNopenGIS/7/issues/997) — the founding
  DWG5×DWG7 issue threads this whole project traces back to.
- FAO's own pages: [Hand-in-Hand Initiative](https://www.fao.org/hand-in-hand/en),
  [GAEZ](https://www.fao.org/gaez), and FERSPAS itself
  (`https://data.review.fao.org/remote-sensing-portal`).

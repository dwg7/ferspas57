# ferspas57: A Working Bridge Between FERSPAS and Staccato

*One-page concept summary. Suitable for pasting into an email or a one-page
attachment.*

## Why this exists

In June 2026, FAO CSI's Geo-AI presentation to the UN Open GIS Initiative's
DWG5 (co-led with UN Global Pulse and Politecnico di Milano) gave DWG7 an
unusually detailed look at FERSPAS — FAO's Essential Remote Sensing data
Product portal for Agrifood Systems. That level of openness struck us as
worth answering with something more substantial than a follow-up
conversation. `ferspas57` is DWG7's attempt to do that: not a proposal or a
slide deck, but a real, working piece of software that demonstrates FERSPAS
data flowing into a different architecture than the one it was built for —
and does so with the attribution, licensing care, and technical honesty that
kind of reuse deserves.

## The technical idea, briefly

FERSPAS speaks STAC: an asset-centric catalog built around individual
Cloud-Optimized GeoTIFFs. DWG7's own architecture, Staccato, is tile-centric:
it expects data as a `martin catalog` — a flat list of ready-to-serve tile
sources an interactive map can consume directly. These are two legitimately
different, sound models, each suited to what it was designed for. `ferspas57`
is a working test of whether they can interoperate without either side
bending to become the other — converting FERSPAS's STAC-published rasters
into a real tile catalog, once, correctly, with the source dataset's license
and provenance carried through rather than dropped.

## What actually exists today

A live, public demonstration — [dwg7.github.io/ferspas57](https://dwg7.github.io/ferspas57/)
— serving two real FAO datasets through this pipeline: GAEZ v5's global
Agro-Ecological Zone classifications, and Hand-in-Hand Initiative data for
the Democratic Republic of the Congo (with three more countries currently
being added). The site is an interactive globe-projected map, not a static
screenshot: layers can be freely combined, a built-in comparison tool lets a
viewer probe Hand-in-Hand's suitability scores at any point, and a short
guided narrative — built from a real finding in the data — walks a viewer
through a genuine, slightly counter-intuitive question: why did FAO's own
Hand-in-Hand process select a site with weaker agro-ecological conditions
over a seemingly better one nearby? (The answer, which the demo explains, is
that Hand-in-Hand's siting scores are a multi-criteria evaluation weighing
accessibility and poverty-reduction priority alongside pure agronomic
suitability — a nuance worth surfacing, not just displaying a number.)

The next phase in progress is a conversational layer — an AI "Staff" that
turns a plain-language question into exactly the kind of map view this
system already knows how to render, so a user never needs to know the
underlying catalog mechanics at all.

## Why this matters beyond the two of us

Most cross-working-group contact inside the UN Open GIS Initiative so far
has been informational. This is meant to be one of the first concrete,
working *technical* collaborations between two working groups with
genuinely different architectural starting points — real evidence, usable
elsewhere in the Initiative, that this kind of interoperability is
achievable without a forced merger of approaches. It's also the technical
substance behind a public commitment already on the calendar: FAO CSI's own
"Geospatial Access for AI Assistants" talk to the Initiative on 2026-09-28
cites this collaboration directly.

## What we'd welcome from FAO

Feedback on whether this correctly represents FERSPAS and Hand-in-Hand data
— licensing, attribution, and interpretation all matter to us here — and any
interest in continuing this conversation, whether that's about this specific
integration or the broader question of how FERSPAS's data can reach other
tools built outside FAO. We're glad to walk through the technical details,
the source code, or the demo live, whichever is most useful.

*Prepared by DWG7 (Staccato), 2026-09. Repository: `dwg7/ferspas57`.*

# Draft: technical feedback to FAO CSI on browser access to FERSPAS COGs

**Status: draft. Not sent. Not published anywhere.**

A draft for hfu to review, edit, and decide what to do with — a meeting agenda item, an email, or a comment on [`UNopenGIS/7#997`](https://github.com/UNopenGIS/7/issues/997). Nothing here goes to FAO without hfu's explicit say-so.

## What was measured, and when

All of the below was measured on **2026-09-11** (`DECISIONS.md` D63), superseding D2's 2026-09-03 observation, which tested only one bucket and generalised from it.

The decisive test was not a header inspection but an actual `fetch()` with `Range: bytes=0-1023`, executed from a real browser page at the real origin `https://dwg7.unopengis.org`:

| bucket | dataset | browser range-read | size |
|---|---|---|---|
| `fao-gismgr-gaez-v5-data` | GAEZ v5 AEZ33 | **works** — `206`, 1024 bytes, TIFF magic `II` | 33 MB |
| `fao-gismgr-hih-data` | Hand-in-Hand CAF cassava score | **blocked** — `TypeError: Failed to fetch` | 8.9 MB |
| `fao-gismgr-esa-data` | ESA WorldCover 2020 | **blocked** — `TypeError: Failed to fetch` | 182 GB |

Matching header evidence: GAEZ's responses carry `access-control-allow-origin: *` (plus `access-control-expose-headers`); the other two carry no `access-control-*` header at all. All three serve HTTP range requests correctly at the transport level (`206`, `Accept-Ranges: bytes`) — the difference is purely the CORS response header.

Note for whoever re-verifies: an `OPTIONS` preflight returns a bare `200` with no CORS headers on *all three* buckets, which looks alarming but is not the operative issue — a simple `Range: bytes=x-y` is CORS-safelisted and does not trigger a preflight, which is why GAEZ works in practice despite this. Test with a real `fetch()`, not with `curl -X OPTIONS`.

**Re-run this before sending.** Infrastructure changes, and telling a team their bucket lacks CORS after they have fixed it is worse than saying nothing.

## Why send this at all

`CLAUDE.md`'s "Positive intent" section. FAO CSI's June 2026 presentation was unusually generous with technical detail, and this repository exists to reciprocate with real work rather than a request. Part of reciprocating is telling them what we found while building on their data.

The finding got substantially better once it was measured properly: this is no longer "FERSPAS COGs are not browser-readable" but "one of your buckets is already configured exactly right, and the others are not." That is a far easier thing to act on, and it makes an oversight much more likely than a policy.

Tone target: *we may be wrong, here is exactly how we tested, and this is your infrastructure and your call.* Not a bug report filed at a vendor.

---

## The draft

> **Subject: FERSPAS COGs and browser access — one bucket already works, the others don't**
>
> Dear colleagues at FAO CSI,
>
> Following DWG 5's June 2026 presentation, DWG 7 has built a working demonstration on top of FERSPAS-published data — GAEZ v5 Agro-Ecological Zones and Hand-in-Hand siting layers for DR Congo, Côte d'Ivoire and the Central African Republic — rendered in a browser-based map at <https://dwg7.unopengis.org/ferspas57/>. It is open source and CC0: <https://github.com/dwg7/ferspas57>.
>
> While building it we measured something we think is worth passing back, because it looks like an inconsistency rather than a decision, and because fixing it would benefit anyone building a lightweight web client against FERSPAS — not only us.
>
> **Browser access to FERSPAS's COG assets differs between datasets.**
>
> We tested by running an ordinary `fetch()` with a `Range: bytes=0-1023` header from a real browser page, against the `data` asset URLs published in FERSPAS's own STAC items:
>
> - `fao-gismgr-gaez-v5-data` (GAEZ v5 AEZ33): **succeeds** — HTTP 206, valid TIFF header bytes returned. The response carries `Access-Control-Allow-Origin: *`.
> - `fao-gismgr-hih-data` (Hand-in-Hand): **fails** — the browser blocks it. No `Access-Control-*` header is present on the response.
> - `fao-gismgr-esa-data` (ESA WorldCover): **fails** in the same way.
>
> All three serve HTTP range requests correctly at the transport level, and the COGs themselves are well-formed — internal tiling and a full overview pyramid, exactly what a browser-side reader needs. So the only thing separating "directly usable by any web map in the world" from "not usable" is one response header, already present on one of your buckets.
>
> That is why we suspect an oversight rather than a policy: the GAEZ bucket demonstrates the configuration you would presumably want everywhere, and appears to have it already.
>
> If applying the same setting to the other dataset buckets is straightforward, it would open up a class of use we suspect FERSPAS would want — any web map reading FERSPAS COGs directly, with no intermediary and no copy of the data in existence anywhere.
>
> If the difference *is* deliberate — a bandwidth-control measure on the larger datasets, say, or a distinction between products at different readiness levels — we would genuinely like to know, because that is a legitimate design position and it would tell other implementers where the intended boundary sits. We are aware that ESA WorldCover is 182 GB and that "any browser may range-read this" is a different proposition at that size than at 9 MB.
>
> **A smaller, separate observation, offered for free.**
>
> The WMTS wrapper at `https://data.apps.fao.org/map/wmts/wmts` returns `cf-cache-status: DYNAMIC` on every response we saw, including immediate repeats, despite sending `Cache-Control: public, max-age=3600`. If that reflects the live configuration, tiles are not being served from Cloudflare's edge and every request reaches your backend — which would show up as both latency and cost on your side. Easy not to notice from the inside, so we mention it.
>
> **What we did, and why we are telling you.**
>
> Because Hand-in-Hand's assets were not browser-readable and GAEZ's were, we could not build our maps on direct COG access — our narratives put an HIH score on top of a GAEZ classification, so half the layers would have been unreachable. We also did not want to route end-user traffic through your WMTS wrapper, which did not seem a fair use of FAO infrastructure for a demonstration that is not yours.
>
> So we converted the specific collections we needed, once, into our own tile archives and serve those. Each archive carries the source dataset's licence and attribution in its own metadata. We checked each collection's licence link individually rather than assuming the catalog is uniformly open, and excluded collections carrying no licence link at all.
>
> We would rather you hear how your data is being used from us than discover it. If any part of it is not how you would like FERSPAS data represented, please tell us and we will change it.
>
> **How to reproduce**, so you can contradict any of the above:
>
> ```js
> // Run in a browser console on any https:// page.
> for (const url of [
>   "https://storage.googleapis.com/fao-gismgr-gaez-v5-data/DATA/GAEZ-V5/MAP/GAEZ-V5.AEZ33-1KM.tif",
>   "https://storage.googleapis.com/fao-gismgr-hih-data/DATA/HIH/MAP/HIH.CAF-SCORE-CSSV.tif",
> ]) {
>   try {
>     const r = await fetch(url, { headers: { Range: "bytes=0-1023" } });
>     console.log(url, r.status, (await r.arrayBuffer()).byteLength);
>   } catch (e) {
>     console.log(url, "blocked:", String(e));
>   }
> }
> ```
>
> (A `curl -X OPTIONS` preflight check is misleading here — it returns a bare 200 with no CORS headers on all three buckets, including the one that works. A simple `Range` header is CORS-safelisted and does not trigger a preflight, so only a real `fetch()` shows the actual behaviour.)
>
> Our full working notes, including everything we got wrong along the way, are public in the repository's `DECISIONS.md`.
>
> We would be glad to walk through any of this, and equally glad to be told we have measured something incorrectly.
>
> With thanks for the openness that started this,
> DWG 7 / Staccato

---

## Notes for whoever finalises this

- **The two findings are deliberately unequal.** The first is a request; the second is an observation offered for free. Keep that asymmetry — presenting them as two defects changes the register entirely.
- **Naming the 182 GB case ourselves matters.** It shows we have thought about why they might not want blanket browser access, and it pre-empts the most obvious reason to dismiss the request.
- **The "is it deliberate?" escape hatch costs nothing** and makes the message a question rather than an assumption that we understand their infrastructure better than they do.
- **Do not include D2's option analysis (A/B/C/D).** That is internal reasoning about *our* architecture and turns a short useful note into an essay about ourselves. `DECISIONS.md` is linked and public.
- **Do not name individuals.** D2 records a technical contact from the WMTS `GetCapabilities` response. Fine as internal context, wrong in a message not addressed to them personally.
- **The mirroring question is deliberately absent.** D2's option (B) — mirroring raw COGs onto our own storage — was never pursued, so raising it would be asking permission for something nobody is doing.
- **One thing we could not verify and therefore do not claim**: `GetTile` requests to the WMTS wrapper returned HTTP 500 for both a GAEZ and an ESA layer on 2026-09-11, and `GetCapabilities` did not respond within 60 s, while `GetPreview` returned 200. We could not rule out malformed parameters on our side, so this is not in the message. If someone reproduces it with known-good parameters, it belongs in the second observation.

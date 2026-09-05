#!/usr/bin/env node
// Generates the "tour" tier of the narrative library (DECISIONS.md D52) —
// multi-stop narratives built purely by recombining already-verified data
// from data/site-scores.json (D45/D48's gdallocationinfo-verified capture),
// not by discovering anything new. This is the honest per-site profile tier's
// sibling, not the curated-divergence tier's: no surprising pattern is
// claimed or required, same as narratives-index.json's per-site entries.
//
// Two tour shapes, both mechanically generated, both round-trip-verified
// before being written (same discipline as encode-narrative.mjs):
//
//   "spectrum" (13, one per commodity/country combo) — a fixed number of
//   real sites spanning that combo's actual rank range, from the highest
//   Hand-in-Hand score down to the lowest, so a reader sees the real spread
//   in one continuous flight instead of reading isolated single-site profiles.
//
//   "grand" (2, one per multi-commodity country — COD's 7 commodities, CIV's
//   5; CAF has only cassava, so no "tour" is possible there) — the #1-ranked
//   real site for every commodity that country has, back to back: "everywhere
//   FAO chose to invest first in this country."
//
// Usage: node scripts/generate-tours.mjs
//   (reads data/site-scores.json, writes data/narratives-tours.json)

import fs from "node:fs/promises";

const LZSTRING_URL = "https://unpkg.com/lz-string@1.5.0/libs/lz-string.min.js";
const BASE = "https://dwg7.github.io/ferspas57/";

// Verified against the primary FAO GAEZ v4 User's Guide PDF (DECISIONS.md
// D13) — copied from docs/aez_legend.js's AEZ33_CLASS_NAMES so this script
// has no runtime dependency on the client bundle.
const AEZ33_CLASS_NAMES = {
  0: "No AEZ assigned", 1: "Tropics, lowland — semi-arid", 2: "Tropics, lowland — sub-humid",
  3: "Tropics, lowland — humid", 4: "Tropics, highland — semi-arid", 5: "Tropics, highland — sub-humid",
  6: "Tropics, highland — humid", 7: "Subtropics, warm — semi-arid", 8: "Subtropics, warm — sub-humid",
  9: "Subtropics, warm — humid", 10: "Subtropics, moderately cool — semi-arid", 11: "Subtropics, moderately cool — sub-humid",
  12: "Subtropics, moderately cool — humid", 13: "Subtropics, cool — semi-arid", 14: "Subtropics, cool — sub-humid",
  15: "Subtropics, cool — humid", 16: "Temperate, moderate — dry", 17: "Temperate, moderate — moist",
  18: "Temperate, moderate — wet", 19: "Temperate, cool — dry", 20: "Temperate, cool — moist",
  21: "Temperate, cool — wet", 22: "Boreal/Cold, no permafrost — dry", 23: "Boreal/Cold, no permafrost — moist",
  24: "Boreal/Cold, no permafrost — wet", 25: "Dominantly very steep terrain", 26: "Land with severe soil/terrain limitations",
  27: "Land with ample irrigated soils", 28: "Dominantly hydromorphic soil", 29: "Desert/Arid climate",
  30: "Boreal/Cold, with permafrost", 31: "Arctic/Very cold climate", 32: "Dominantly urban/built-up", 33: "Dominantly water",
};

const COUNTRY_NAMES = { cod: "DR Congo", caf: "Central African Republic", civ: "Côte d'Ivoire" };

// Matches narratives-index.json's own generator wording exactly (checked
// directly against its live entries), so the "spectrum"/"grand" tours read
// as the same voice as the per-site profile tier, not a divergent style.
const THEMES = {
  cassava: "cassava storage", cocoa: "cocoa storage", coffee: "coffee storage",
  maize: "maize storage", palmoil: "palm oil processing", wheat: "wheat storage",
  livestock: "livestock (slaughterhouse) siting", cereal: "cereal storage",
  fruits: "fruit storage", vegetables: "vegetable storage", dairy: "dairy processing",
};

// COD's 7 commodities and CIV's 5, in a fixed, readable order (roughly
// site-scores.json's own key order) — used only for the grand tours.
const COUNTRY_COMMODITIES = {
  cod: ["cassava", "cocoa", "coffee", "maize", "palmoil", "wheat", "livestock"],
  civ: ["cereal", "fruits", "vegetables", "dairy", "livestock"],
};

function round1(v) { return Math.round(v * 10) / 10; }
function round4(v) { return Math.round(v * 10000) / 10000; }

function aezLabel(cls) {
  const n = Number(cls);
  return `${n}: ${AEZ33_CLASS_NAMES[n] || "unclassified"}`;
}

// Real sites only — both civ_cereal#7 and civ_vegetables#10 sit on FAO's own
// hidden -999 NoData sentinel at their exact score pixel (D10/D41/D45); they
// have a real polygon but no real score, so they cannot participate in any
// ranking or comparison. Same exclusion narratives-index.json already applies.
function rankedSites(entry) {
  return entry.sites
    .filter((s) => s.score !== "-999")
    .map((s) => ({ ...s, score: Number(s.score) }))
    .sort((a, b) => b.score - a.score)
    .map((s, i) => ({ ...s, rank: i + 1 }));
}

// Up to `maxStops` ranks, evenly spread from 1 (best) to n (worst), always
// including both ends, deduplicated — so a small n (e.g. 3) just returns
// every site, and a large n (e.g. 70) returns a representative spread rather
// than everything.
function pickRanks(n, maxStops = 5) {
  if (n <= maxStops) return Array.from({ length: n }, (_, i) => i + 1);
  const ranks = new Set();
  for (let i = 0; i < maxStops; i++) {
    ranks.add(Math.round(1 + (i * (n - 1)) / (maxStops - 1)));
  }
  return [...ranks].sort((a, b) => a - b);
}

function siteStep(country, commodity, site, caption) {
  return {
    center: [round4(site.lon), round4(site.lat)],
    zoom: 12,
    layers: ["gaez-aez33", `hih-${country}-${commodity}-score`, `hih-${country}-${commodity}-final`],
    caption,
  };
}

function buildSpectrumTour(key, entry) {
  const [country, commodity] = key.split("_");
  const ranked = rankedSites(entry);
  const n = ranked.length;
  const theme = THEMES[commodity];
  const countryName = COUNTRY_NAMES[country];
  const stops = pickRanks(n).map((r) => ranked.find((s) => s.rank === r));

  const steps = stops.map((site) => {
    const caption =
      `Rank ${site.rank} of ${n} real FAO-selected ${theme} sites in ${countryName} — ` +
      `Hand-in-Hand suitability score ${round1(site.score)}. GAEZ classifies this location as "${aezLabel(site.aez33_class)}".`;
    return siteStep(country, commodity, site, caption);
  });

  return {
    type: "spectrum_tour",
    country, commodity,
    stop_count: steps.length,
    site_count: n,
    title: `${countryName}: the real score range across ${n} FAO-selected ${theme} sites`,
    steps,
  };
}

function buildGrandTour(country, siteScores) {
  const countryName = COUNTRY_NAMES[country];
  const commodities = COUNTRY_COMMODITIES[country];
  const steps = commodities.map((commodity) => {
    const key = `${country}_${commodity}`;
    const ranked = rankedSites(siteScores[key]);
    const top = ranked[0];
    const theme = THEMES[commodity];
    const caption =
      `${countryName}'s top-ranked ${theme} site — Hand-in-Hand score ${round1(top.score)} (rank 1 of ${ranked.length}). ` +
      `GAEZ classifies this location as "${aezLabel(top.aez33_class)}".`;
    return siteStep(country, commodity, top, caption);
  });

  return {
    type: "grand_tour",
    country,
    commodities,
    stop_count: steps.length,
    title: `${countryName}: a tour of FAO's top-ranked Hand-in-Hand site for each commodity`,
    steps,
  };
}

async function loadLZString() {
  const src = await (await fetch(LZSTRING_URL)).text();
  const module = { exports: {} };
  new Function("module", "exports", src)(module, module.exports);
  return module.exports;
}

function encodeAndVerify(LZString, narrative) {
  const encoded = LZString.compressToEncodedURIComponent(JSON.stringify(narrative));
  const decoded = JSON.parse(LZString.decompressFromEncodedURIComponent(encoded));
  if (JSON.stringify(decoded) !== JSON.stringify(narrative)) {
    throw new Error(`round-trip check FAILED for "${narrative.title}"`);
  }
  return `${BASE}#narrative=${encoded}`;
}

async function main() {
  const siteScores = JSON.parse(await fs.readFile("data/site-scores.json", "utf8"));
  const LZString = await loadLZString();

  const entries = [];

  for (const key of Object.keys(siteScores)) {
    if (key === "_meta") continue;
    const built = buildSpectrumTour(key, siteScores[key]);
    const narrative = { narrative_version: "ferspas57-narrative/v1", title: built.title, steps: built.steps };
    const link = encodeAndVerify(LZString, narrative);
    entries.push({
      tour_type: built.type, country: built.country, commodity: built.commodity,
      stop_count: built.stop_count, site_count: built.site_count,
      title: built.title, narrative, link,
    });
  }

  for (const country of Object.keys(COUNTRY_COMMODITIES)) {
    const built = buildGrandTour(country, siteScores);
    const narrative = { narrative_version: "ferspas57-narrative/v1", title: built.title, steps: built.steps };
    const link = encodeAndVerify(LZString, narrative);
    entries.push({
      tour_type: built.type, country: built.country, commodities: built.commodities,
      stop_count: built.stop_count, title: built.title, narrative, link,
    });
  }

  const output = {
    _meta: {
      description:
        "Machine-generated tour narratives (DECISIONS.md D52) — the Library's third tier, alongside NARRATIVES.md's curated divergence stories and data/narratives-index.json's 355 per-site profiles. Every step's coordinates/score/AEZ class trace directly to data/site-scores.json's gdallocationinfo-verified capture; no new fact-finding, only recombination, same Anti-Fabrication standard as the per-site tier.",
      generated: new Date().toISOString().slice(0, 10),
      entry_count: entries.length,
      tour_types: {
        spectrum_tour:
          "One per commodity/country combo (13 total): a fixed number of real sites (up to 5, evenly spread by rank) from that combo's highest Hand-in-Hand score down to its lowest, showing the real spread in one continuous flight.",
        grand_tour:
          "One per multi-commodity country (COD's 7 commodities, CIV's 5 — CAF has only cassava, no tour possible): the #1-ranked real site for every commodity that country has, back to back.",
      },
      usage:
        "Same as data/narratives-index.json: requires a code-execution-capable Staff (D42) to fetch and search this file directly — too large/numerous to embed in STAFF-PROMPT.md. Match on country/commodity (spectrum) or country alone (grand); a tool-less Staff should say plainly this tier is unreachable and fall back to NARRATIVES.md's curated set.",
    },
    entries,
  };

  await fs.writeFile("data/narratives-tours.json", JSON.stringify(output, null, 2) + "\n");
  console.log(`Wrote ${entries.length} tours to data/narratives-tours.json`);
  for (const e of entries) {
    console.log(`  [${e.tour_type}] ${e.title} (${e.stop_count} stops)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

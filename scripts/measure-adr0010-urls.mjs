#!/usr/bin/env node
// Measure the URL-length cost of migrating this repo's narratives to
// UNopenGIS/staccato-spec ADR 0010's recommended shape.
//
// Why: ADR 0010 recommends (SHOULD, not MUST) that a narrative be an ordered
// wrapper around COMPLETE, independent Map Intent documents — one per step —
// with catalog_context/provenance deliberately duplicated across steps rather
// than hoisted (§4). This repo flagged the resulting URL-length cost during
// the convergence that produced the ADR (D55), the ADR itself records it as
// unresolved ("Operational Implications"), and nothing has measured it since.
// This script measures it, so the migrate/don't-migrate decision is made
// against numbers rather than intuition.
//
// It changes nothing. It reads the existing libraries, builds what the
// migrated form WOULD be, and compares compressed URL lengths.
//
// Usage: node scripts/measure-adr0010-urls.mjs [--worst]
//        --worst also reports the single largest narrative in both shapes.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = "https://dwg7.unopengis.org/ferspas57/";
const FRAGMENT_KEY = "#narrative=";

// Same lz-string build docs/index.html loads, fetched the same way
// scripts/encode-narrative.mjs does, so measurements can't drift from what
// the real decoder would accept.
const LZSTRING_URL = "https://unpkg.com/lz-string@1.5.0/libs/lz-string.min.js";
async function loadLZString() {
  const src = await (await fetch(LZSTRING_URL)).text();
  const module = { exports: {} };
  new Function("module", "exports", src)(module, module.exports);
  return module.exports;
}

// Real labels, read from the Cartographer's own layer table rather than
// invented — a migrated required_layers[] would carry these exact strings.
function layerLabels() {
  const html = readFileSync(join(repo, "docs", "index.html"), "utf8");
  const map = new Map();
  for (const m of html.matchAll(/id:\s*"([a-z0-9-]+)"[^}]*?label:\s*"([^"]+)"/g)) {
    map.set(m[1], m[2]);
  }
  return map;
}

// One step of the current shape -> one complete map-intent/v2 document,
// following samples/map-intent-cassava-comparison.yaml's real field set.
// catalog_context and provenance are duplicated verbatim per step: that is
// ADR 0010 §4's explicit, deliberate trade-off, and measuring it any other way
// would measure a shape the ADR did not recommend.
function toMapIntent(step, narrative, labels, index) {
  return {
    spec_version: "map-intent/v2",
    goal: narrative.title,
    catalog_context: {
      active_catalogs: [
        { id: "stars-martin", type: "martin", uri: "https://stars.optgeo.org", version: "2026-09-03" },
      ],
      resolution_policy: { precedence: ["stars-martin"] },
    },
    required_layers: (step.layers || []).map((id) => ({
      source_id: id,
      label: labels.get(id) || id,
    })),
    render_hints: {
      initial_center: step.center,
      initial_zoom: step.zoom,
    },
    provenance: {
      generated_by: "ferspas57 narrative library",
      generated_at: "2026-09-11T00:00:00Z",
      intent_id: `${narrative.narrative_version}-step-${index + 1}`,
    },
  };
}

function toAdr0010(narrative, labels) {
  return {
    narrative_id: narrative.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60),
    title: narrative.title,
    steps: narrative.steps.map((s, i) => ({
      map_intent: toMapIntent(s, narrative, labels, i),
      caption: s.caption,
    })),
  };
}

function stats(ns) {
  const s = [...ns].sort((a, b) => a - b);
  const at = (q) => s[Math.min(s.length - 1, Math.floor(q * s.length))];
  return { n: s.length, min: s[0], median: at(0.5), p95: at(0.95), max: s[s.length - 1] };
}

const pad = (v, w = 9) => String(v).padStart(w);

async function main() {
  const LZString = await loadLZString();
  const labels = layerLabels();

  const sources = [];
  const curated = ["narrative-cod-maize-mystery", "narrative-cod-wheat-highlands", "narrative-civ-dairy-north"];
  for (const slug of curated) {
    sources.push({ tier: "1 curated", narrative: JSON.parse(readFileSync(join(repo, "samples", `${slug}.json`), "utf8")) });
  }
  for (const e of JSON.parse(readFileSync(join(repo, "data", "narratives-index.json"), "utf8")).entries) {
    sources.push({ tier: "2 per-site", narrative: e.narrative });
  }
  for (const e of JSON.parse(readFileSync(join(repo, "data", "narratives-tours.json"), "utf8")).entries) {
    sources.push({ tier: "3 tours", narrative: e.narrative });
  }

  const rows = sources.map(({ tier, narrative }) => {
    const migrated = toAdr0010(narrative, labels);
    const encode = (o) => BASE.length + FRAGMENT_KEY.length + LZString.compressToEncodedURIComponent(JSON.stringify(o)).length;
    const now = encode(narrative);
    const then = encode(migrated);
    return { tier, steps: narrative.steps.length, title: narrative.title, now, then, ratio: then / now };
  });

  console.log(`Measured ${rows.length} narratives against ADR 0010's recommended wrapper shape.`);
  console.log(`Full URL length = base (${BASE.length}) + "${FRAGMENT_KEY}" (${FRAGMENT_KEY.length}) + LZString payload.\n`);

  const tiers = [...new Set(rows.map((r) => r.tier))];
  console.log(`${"tier".padEnd(12)}${pad("count")}${pad("steps")}${pad("now med")}${pad("now max")}${pad("ADR med")}${pad("ADR max")}${pad("x med")}`);
  console.log("-".repeat(75));
  for (const tier of [...tiers, "ALL"]) {
    const rs = tier === "ALL" ? rows : rows.filter((r) => r.tier === tier);
    const now = stats(rs.map((r) => r.now));
    const then = stats(rs.map((r) => r.then));
    const st = stats(rs.map((r) => r.steps));
    console.log(
      tier.padEnd(12) + pad(rs.length) + pad(`${st.min}-${st.max}`) +
      pad(now.median) + pad(now.max) + pad(then.median) + pad(then.max) +
      pad((then.median / now.median).toFixed(2) + "x")
    );
  }

  console.log("\nHow many URLs cross each practical threshold, in each shape:");
  for (const limit of [2000, 4000, 8192, 32768]) {
    const a = rows.filter((r) => r.now > limit).length;
    const b = rows.filter((r) => r.then > limit).length;
    console.log(`  > ${String(limit).padStart(5)} chars:  now ${pad(a, 4)}   ADR 0010 ${pad(b, 4)}`);
  }

  // ADR 0010's Operational Implications names "7–20 step tours" specifically,
  // but the longest narrative actually in production is 7 steps, so the 20-step
  // end of that range is unmeasured by the corpus alone. Project it, by cycling
  // the largest real tour's own steps — synthetic length, real step content.
  const longest = [...sources].sort((a, b) => b.narrative.steps.length - a.narrative.steps.length)[0].narrative;
  console.log(`\nProjection to longer tours (cycling the ${longest.steps.length}-step "${longest.title.slice(0, 40)}…" steps):`);
  console.log(`  ${"steps".padStart(6)}${pad("now")}${pad("ADR 0010")}${pad("x")}`);
  for (const n of [10, 15, 20, 30, 50]) {
    const stretched = { ...longest, steps: Array.from({ length: n }, (_, i) => longest.steps[i % longest.steps.length]) };
    const encode = (o) => BASE.length + FRAGMENT_KEY.length + LZString.compressToEncodedURIComponent(JSON.stringify(o)).length;
    const now = encode(stretched);
    const then = encode(toAdr0010(stretched, labels));
    console.log(`  ${String(n).padStart(6)}${pad(now)}${pad(then)}${pad((then / now).toFixed(2) + "x")}`);
  }

  if (process.argv.includes("--worst")) {
    const worst = [...rows].sort((a, b) => b.then - a.then)[0];
    console.log(`\nLargest migrated narrative: ${worst.then} chars (${worst.steps} steps, was ${worst.now})`);
    console.log(`  ${worst.title}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

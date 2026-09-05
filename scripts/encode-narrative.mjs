#!/usr/bin/env node
// Encode a narrative JSON file (see NARRATIVE-FORMAT.md) into the
// #narrative= URL this Cartographer's docs/narrative.js reads — the same
// LZString.compressToEncodedURIComponent() call getNarrativeFromUrl()/
// setNarrativeInUrl() use client-side, run once at authoring time instead of
// in the browser, since a narrative is pre-authored, not generated live
// (DECISIONS.md D34 item 2, D37; NARRATIVE-FORMAT.md's "Responsibility
// split"). Fetches the exact same lz-string version docs/index.html loads
// from unpkg, so the encoding can never drift out of sync with the decoder.
//
// Usage: node scripts/encode-narrative.mjs samples/narrative-<slug>.json
//        [--base https://dwg7.github.io/ferspas57/]

const LZSTRING_URL = "https://unpkg.com/lz-string@1.5.0/libs/lz-string.min.js";

async function loadLZString() {
  const src = await (await fetch(LZSTRING_URL)).text();
  const module = { exports: {} };
  new Function("module", "exports", src)(module, module.exports);
  return module.exports;
}

async function main() {
  const args = process.argv.slice(2);
  const baseIdx = args.indexOf("--base");
  const base = baseIdx !== -1 ? args[baseIdx + 1] : "https://dwg7.github.io/ferspas57/";
  const filePath = args.filter((a, i) => a !== "--base" && args[i - 1] !== "--base")[0];
  if (!filePath) {
    console.error("usage: node scripts/encode-narrative.mjs <narrative.json> [--base <url>]");
    process.exit(1);
  }

  const fs = await import("node:fs/promises");
  const text = await fs.readFile(filePath, "utf8");
  const narrative = JSON.parse(text); // fail loudly on malformed JSON, not silently
  if (!Array.isArray(narrative.steps) || narrative.steps.length === 0) {
    console.error(`warning: ${filePath} has no non-empty "steps" array — is this really a narrative document?`);
  }

  const LZString = await loadLZString();
  const encoded = LZString.compressToEncodedURIComponent(JSON.stringify(narrative));
  const url = `${base.replace(/\/?$/, "/")}#narrative=${encoded}`;

  // Round-trip check before printing anything claiming to work — this
  // project's standing discipline (D27's convert-hih.sh validation, D35/D36)
  // is to verify a pipeline against its own output, not trust it by
  // construction.
  const decoded = JSON.parse(LZString.decompressFromEncodedURIComponent(encoded));
  if (JSON.stringify(decoded) !== JSON.stringify(narrative)) {
    console.error("round-trip check FAILED — encoded URL does not decode back to the input document. Not printing a link.");
    process.exit(1);
  }

  console.log(url);
}

main();

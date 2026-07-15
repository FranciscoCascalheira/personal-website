#!/usr/bin/env node
/**
 * verify-tokens — the design system's dead-class guard.
 *
 * Tailwind only makes a utility for a token that `@theme` exports. A token
 * defined in :root but not exported still *looks* available — so `bg-accent-soft`
 * reads correctly, survives review, passes lint, compiles, and does nothing.
 *
 * That is not hypothetical. fig. 4's race window was written as
 * `fill-accent-soft`, resolved to no paint, and SVG fell back to its default —
 * painting a solid BLACK slab across the figure in a design system whose first
 * rule is "never pure black". It only surfaced because I looked at a screenshot.
 * An earlier `bg-accent-soft` had been a silent no-op for who knows how long,
 * and nobody could see that one at all: a tint that never arrives looks exactly
 * like a tint you didn't add.
 *
 * So: every design token used as a utility class must be exported by @theme.
 * Two failures, both loud:
 *   - a class referencing a :root token @theme does not export (silently dead)
 *   - a :root token nothing consumes (a trap waiting for the next person)
 *
 * Run: npm run verify:tokens   (prebuild)
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const CSS = "src/app/globals.css";
const css = readFileSync(CSS, "utf8");

// NB: the block is `@theme inline {`, so do not assume `{` follows the word.
const themeBlock = css.match(/@theme[^{]*\{([\s\S]*?)\n\}/)?.[1];
if (!themeBlock) {
  console.error(`\n  verify-tokens — FAIL: no @theme block found in ${CSS}.\n`);
  process.exit(1);
}
const exported = new Set([...themeBlock.matchAll(/--color-([a-z0-9-]+):/g)].map((m) => m[1]));

/** Colour tokens declared in :root — i.e. the ones that look like ours. The
 *  --color-* aliases inside @theme are the export, not a token, so skip them. */
const declared = [...css.matchAll(/^\s*--([a-z0-9-]+):\s*(?!var\(--(?:bg|text|border|accent|field|positive))/gm)]
  .map((m) => m[1])
  .filter((t) => !t.startsWith("color-") && !t.startsWith("font-") && !t.startsWith("ease-"));

const files = [];
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.tsx?$/.test(p)) files.push(p);
  }
})("src");

const UTIL =
  /(?:^|[\s"'`:{])(?:(?:hover|focus|focus-visible|active|group-hover|sm|md|lg|xl|dark|print|last|first|disabled|motion-safe|motion-reduce):)*(bg|text|border|fill|stroke|ring|decoration|outline|from|to|via|caret|divide|accent)-([a-z][a-z0-9-]*)/g;

const dead = new Map();
const used = new Set();
for (const file of files) {
  const src = readFileSync(file, "utf8");
  for (const [, util, token] of src.matchAll(UTIL)) {
    if (!declared.includes(token)) continue; // not one of ours
    used.add(token);
    if (exported.has(token)) continue;
    const key = `${util}-${token}`;
    if (!dead.has(key)) dead.set(key, new Set());
    dead.get(key).add(file);
  }
}

// A token nothing reads — in a class, in var(), anywhere — is cruft that reads
// as an available choice. --grid-line sat dead through a hero rewrite.
const orphans = declared.filter(
  (t) => !used.has(t) && !new RegExp(`var\\(--${t}\\)`).test(css) && !exported.has(t),
);

console.log("\n  verify-tokens — every design token used as a class must exist\n");
console.log(`  @theme exports   ${exported.size}: ${[...exported].join(", ")}`);

let failed = false;
if (dead.size) {
  failed = true;
  console.log("\n  FAIL — these classes reference a token @theme does not export.");
  console.log("  They compile, they lint, and they do NOTHING:");
  for (const [cls, where] of dead) console.log(`    ${cls}  ←  ${[...where].join(", ")}`);
  console.log(`\n  Fix: export it from @theme in ${CSS}, or stop using the class.`);
}
if (orphans.length) {
  failed = true;
  console.log(`\n  FAIL — tokens defined in ${CSS} that nothing reads: ${orphans.join(", ")}`);
  console.log("  Dead tokens are traps: they look like an available choice.");
}
if (!failed) console.log("\n  ok — no dead classes, no orphan tokens.\n");
process.exit(failed ? 1 : 0);

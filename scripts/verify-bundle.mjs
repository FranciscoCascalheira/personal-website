#!/usr/bin/env node
/**
 * verify-bundle — the colophon's weight, re-measured every build.
 *
 * The footer stamps "First load ≈ N kB compressed · measured at build, DATE".
 * That number is a claim like any other, and it rotted the same way the commit
 * count did: it said 310 kB while the bundle had drifted to 316, because
 * re-measuring was a thing a human had to remember. Nobody did, for a month.
 *
 * So it is measured here, from the built output, and compared to what the
 * footer says. No browser and no server: Next prerenders the homepage to
 * .next/server/app/index.html, and every asset it references is on disk.
 *
 * "First load" means the homepage — the landing page, what the stamp is about:
 * the HTML, every script it loads, its stylesheets, and the fonts it preloads.
 * Gzip is the convention (woff2 is already compressed, so it counts as-is).
 * The lazy payloads — three.js, the marble, fig. 4's Postgres — are excluded by
 * construction: they are not referenced by the first document, which is exactly
 * the claim "load only on demand" makes.
 *
 * Run: npm run verify:bundle   (postbuild — needs .next; skips without it)
 */

import { gzipSync } from "node:zlib";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const NEXT = ".next";
const HTML = join(NEXT, "server/app/index.html");
const FOOTER = "src/components/Footer.tsx";
/** "≈" is doing real work in the stamp; this is how much slack it buys. */
const TOLERANCE_KB = 5;

if (!existsSync(HTML)) {
  console.log(
    `\n  verify-bundle — skipped: no build at ${HTML}\n  (run after \`next build\`)\n`,
  );
  process.exit(0);
}

const html = readFileSync(HTML, "utf8");
const uniq = (a) => [...new Set(a)];
const asset = (url) => join(NEXT, url.replace(/^\/_next\//, ""));

const scripts = uniq([...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]));
const css = uniq(
  [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map((m) => m[1]),
);
// Only preloaded fonts are part of the first load; the rest arrive on use.
const fonts = uniq([...html.matchAll(/href="([^"]*\.woff2)"/g)].map((m) => m[1]));

const missing = [];
const weigh = (urls, compress) =>
  urls.reduce((sum, u) => {
    const path = asset(u);
    if (!existsSync(path)) {
      missing.push(u);
      return sum;
    }
    const buf = readFileSync(path);
    return sum + (compress ? gzipSync(buf).length : buf.length);
  }, 0);

const parts = {
  html: gzipSync(Buffer.from(html)).length,
  js: weigh(scripts, true),
  css: weigh(css, true),
  fonts: weigh(fonts, false), // woff2 is already compressed
};
const total = Object.values(parts).reduce((a, b) => a + b, 0);
const kb = (n) => Math.round(n / 1024);

// A referenced asset that isn't on disk means the measurement is incomplete —
// which must be loud, not a smaller number that looks like good news.
if (missing.length) {
  console.error(
    `\n  verify-bundle — FAIL: ${missing.length} referenced asset(s) not found on disk:\n    ${missing.join("\n    ")}\n  The measurement would understate the real first load.\n`,
  );
  process.exit(1);
}

// The claim, read from the footer. Not finding it is a failure: an unlocatable
// claim is exactly what this exists to catch.
const footer = readFileSync(FOOTER, "utf8");
// The stamp wraps across JSX lines, so match the date shape rather than
// assuming what follows it sits on the same line.
const m = footer.match(
  /First load ≈ (\d+) kB compressed · measured at build,\s*(\d{1,2} \w{3} \d{4})/,
);
if (!m) {
  console.error(
    `\n  verify-bundle — FAIL: could not find the first-load stamp in ${FOOTER}.\n  The claim moved, and an unverified claim is the whole problem.\n`,
  );
  process.exit(1);
}
const claimed = Number(m[1]);
const claimedDate = m[2].trim();
const drift = kb(total) - claimed;
const ok = Math.abs(drift) <= TOLERANCE_KB;

console.log("\n  verify-bundle — the colophon's weight, re-measured from the build\n");
console.log(
  `  measured   HTML ${kb(parts.html)} + JS ${kb(parts.js)} (${scripts.length} files) + CSS ${kb(parts.css)} + fonts ${kb(parts.fonts)} (${fonts.length}) = ${kb(total)} kB`,
);
console.log(`  colophon   ≈ ${claimed} kB · measured at build, ${claimedDate}`);
console.log(
  ok
    ? `\n  ok — within ±${TOLERANCE_KB} kB (drift ${drift >= 0 ? "+" : ""}${drift}).\n`
    : `\n  FAIL — the colophon is off by ${drift >= 0 ? "+" : ""}${drift} kB.\n` +
        `  Update the number AND the date in ${FOOTER}, or the stamp is a lie.\n`,
);
process.exit(ok ? 0 : 1);

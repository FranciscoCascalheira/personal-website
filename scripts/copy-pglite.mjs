/** Copy PGlite's browser build into public/pg so fig. 4 can load it directly.
 *
 *  Two problems are solved here, both of them only visible in a built page.
 *
 *  1. Bundling. Turbopack's production optimiser drops the module-init call
 *     that builds PGlite's internal namespace object (its exports are defined
 *     with Object.defineProperty getters, which the tree-shaker reads as
 *     side-effect free). The dev server keeps it, so a plain
 *     `import("@electric-sql/pglite")` works in `next dev` and dies in `next
 *     build` output with "p.instantiateWasm is not a function". Serving PGlite
 *     as plain static files and importing it at runtime with `turbopackIgnore`
 *     takes the bundler out of the loop: the browser fetches real files and
 *     `import.meta.url` resolves ./pglite.wasm next to them, as the package
 *     expects.
 *
 *  2. Weight. Next serves public/ verbatim — no compression — and the CDN in
 *     front only compresses text types, not application/octet-stream (checked:
 *     the .glb busts come back with no content-encoding). Left alone, the
 *     engine costs 17.2 MB on the wire. So the three binaries are gzipped here
 *     at build time and kept under their original names; next.config.ts serves
 *     them with `Content-Encoding: gzip`, and the browser inflates them
 *     transparently. PGlite's own fetch path is untouched and the wire cost is
 *     fixed at ~5 MB whatever the CDN decides to do.
 *
 *     The files in public/pg/*.wasm and *.data are therefore gzip streams, not
 *     what their extension says. That is deliberate, and it only works because
 *     of the headers in next.config.ts — the two must be changed together.
 *
 *  The output is generated, not committed — public/pg is gitignored. This runs
 *  from `prebuild` and `predev`, so node_modules is always present.
 */

import { cp, mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "node_modules", "@electric-sql", "pglite", "dist");
const dest = join(root, "public", "pg");

if (!existsSync(src)) {
  console.error(`[pglite] ${src} not found — is @electric-sql/pglite installed?`);
  process.exit(1);
}

/** Gzipped in place; see the header note and next.config.ts. */
const COMPRESSED = ["pglite.wasm", "pglite.data", "initdb.wasm"];

await mkdir(dest, { recursive: true });

const entries = await readdir(src);
// The ESM entry plus its sibling chunks. Source maps and the optional
// extension bundles (*.tar.gz) are not needed to open a database.
const js = entries.filter((f) => f.endsWith(".js"));

for (const file of js) await cp(join(src, file), join(dest, file));

let raw = 0;
let wire = 0;
for (const file of COMPRESSED) {
  const from = join(src, file);
  if (!existsSync(from)) {
    console.error(`[pglite] missing ${file} — the package layout changed.`);
    process.exit(1);
  }
  const buf = await readFile(from);
  const gz = gzipSync(buf, { level: 9 });
  await writeFile(join(dest, file), gz);
  raw += buf.byteLength;
  wire += gz.byteLength;
}

const jsBytes = (
  await Promise.all(js.map(async (f) => (await stat(join(src, f))).size))
).reduce((a, b) => a + b, 0);

const mb = (n) => (n / 1048576).toFixed(2);
console.log(
  `[pglite] public/pg: ${js.length} js (${mb(jsBytes)} MB) + ${COMPRESSED.length} binaries ` +
    `${mb(raw)} MB → ${mb(wire)} MB gzipped`,
);

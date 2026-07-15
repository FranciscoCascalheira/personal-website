#!/usr/bin/env node
/**
 * verify-claims — the dossier's truth rules, made executable.
 *
 * The site's whole thesis is that a reader can check it. Three claims rotted
 * anyway, all in the same week, all for the same reason: verifying was manual.
 *
 *   - "308 commits, all mine", footnoted `git shortlog -sn` — which returns 294.
 *     308 was `git rev-list --count --all`, counting never-merged branches.
 *   - fig. 0's cartouche engraved "opPORTOnidades". The programme is called
 *     opPORTOnities. The invented name appears nowhere in the source.
 *   - the colophon's "≈ 310 kB, measured at build" had drifted to 316 kB.
 *
 * So this checks every hard claim against the thing it claims to describe, and
 * fails loudly. Two rules it lives by:
 *
 *   1. A claim that cannot be located is a FAILURE, never a pass. If a regex
 *      stops matching because the prose moved, the check must go red — a
 *      verifier that silently matches nothing is worse than no verifier.
 *   2. Verify with the command the site actually prints next to the number.
 *      That is precisely where 308 went wrong.
 *
 * Run: npm run verify:claims   (needs ~/TERA-LINKR; skips cleanly without it,
 * so the Railway build does not depend on a repo that isn't there)
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const SOURCE = process.env.TERA_LINKR_PATH ?? join(homedir(), "TERA-LINKR");
const SCHEMA = join(SOURCE, "packages/backend/prisma/schema.prisma");
/** The commit fig. 3 recounts. Its pre-fix states are only publishable while it
 *  stays an ancestor of what is deployed — history, not a live advisory. */
const AUDIT_COMMIT = "cc0899d";

if (!existsSync(SCHEMA)) {
  // Railway builds from this repo alone and has never seen TERA-LINKR. Skipping
  // is correct there; what would be wrong is failing, or pretending it passed.
  console.log(
    `\n  verify-claims — skipped: no source repo at ${SOURCE}\n` +
      `  (set TERA_LINKR_PATH, or run this where the repo lives — it is a\n` +
      `   pre-deploy check, not a build gate)\n`,
  );
  process.exit(0);
}

const results = [];
const record = (name, ok, detail) => results.push({ name, ok, detail });

const git = (...args) =>
  execFileSync("git", ["-C", SOURCE, ...args], { encoding: "utf8" }).trim();

/** Pull a claim out of the site's source. Not finding it is a failure: the
 *  claim may have moved, and an unverified claim is exactly what this exists
 *  to prevent. */
function claim(file, re, what) {
  const text = readFileSync(file, "utf8");
  const m = text.match(re);
  if (!m) {
    record(what, false, `could not find the claim in ${file} — check moved or broke`);
    return null;
  }
  return m[1];
}

// ── the number of commits, and who wrote them ────────────────────────────────
// The footnote on the site says `git shortlog -sn master`. So that is what runs
// here — not a command that merely sounds equivalent.
const shortlog = git("shortlog", "-sn", "master");
const authors = shortlog.split("\n").filter(Boolean).map((l) => l.trim());
const [firstCount, ...firstName] = authors[0]?.split(/\s+/) ?? [];
const commits = Number(firstCount);

record(
  "sole author on master",
  authors.length === 1,
  authors.length === 1
    ? `${firstName.join(" ")}, all ${commits}`
    : `${authors.length} authors: ${authors.join(" · ")}`,
);

// Every place the count is claimed must agree with git AND with each other —
// the 308 bug survived because the sites drifted apart one at a time.
const sites = [
  ["src/lib/case-study.ts", /value:\s*"(\d+)",\s*\n\s*label:\s*"commits, all mine"/, "abstract metric"],
  ["src/lib/data.ts", /\{\s*value:\s*"(\d+)",\s*label:\s*"solo commits"\s*\}/, "data.ts metric"],
  ["src/components/Hero.tsx", /wrote all\s+(\d+)\s+commits/, "hero prose"],
  ["src/components/Hero.tsx", /"(\d+) — sole author, verified by git"/, "hero docket"],
  ["src/components/Fig0Plate.tsx", /12 MODELS · (\d+) COMMITS/, "fig. 0 cartouche"],
];
for (const [file, re, what] of sites) {
  const got = claim(file, re, `commit count · ${what}`);
  if (got === null) continue;
  record(
    `commit count · ${what}`,
    Number(got) === commits,
    Number(got) === commits ? `${got}` : `claims ${got}, git says ${commits}`,
  );
}

// `--all` is the trap: it counts branches that never shipped.
const all = Number(git("rev-list", "--count", "--all"));
if (all !== commits) {
  record(
    "note · unmerged work exists",
    true,
    `${all - commits} commits live on branches that never merged; the site counts ${commits} (master) on purpose`,
  );
}

// ── the programme's real name ────────────────────────────────────────────────
// fig. 0 engraved a pun that reads beautifully and was never the product's name.
const name = claim(
  "src/components/Fig0Plate.tsx",
  /op<tspan[^>]*>PORTO<\/tspan>([A-Za-z]+)/,
  "fig. 0 programme name",
);
if (name !== null) {
  const engraved = `opPORTO${name}`;
  // grep exits 1 on no-match, which is the interesting answer here, not a crash.
  let hits = 0;
  try {
    const found = execFileSync(
      "grep",
      ["-rioF", "--include=*.ts", "--include=*.tsx", engraved, SOURCE],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim();
    hits = found ? found.split("\n").length : 0;
  } catch {
    hits = 0;
  }
  record(
    "fig. 0 programme name",
    hits > 0,
    hits > 0 ? `"${engraved}" — ${hits} hits in the source` : `"${engraved}" appears NOWHERE in ${SOURCE}`,
  );
}

// ── the model count ──────────────────────────────────────────────────────────
const models = readFileSync(SCHEMA, "utf8").match(/^model /gm)?.length ?? 0;
for (const [file, re, what] of [
  ["src/lib/case-study.ts", /value:\s*"(\d+)",\s*label:\s*"relational models"/, "abstract"],
  ["src/components/Fig0Plate.tsx", /(\d+) MODELS ·/, "fig. 0 cartouche"],
]) {
  const got = claim(file, re, `model count · ${what}`);
  if (got === null) continue;
  record(
    `model count · ${what}`,
    Number(got) === models,
    Number(got) === models ? `${got}` : `claims ${got}, schema.prisma has ${models}`,
  );
}

// ── fig. 3's safety rule ─────────────────────────────────────────────────────
// Publishing a vulnerability's prior state is only OK while the fix is history.
let ancestor = false;
try {
  execFileSync("git", ["-C", SOURCE, "merge-base", "--is-ancestor", AUDIT_COMMIT, "master"]);
  ancestor = true;
} catch {
  ancestor = false;
}
const after = ancestor ? Number(git("rev-list", "--count", `${AUDIT_COMMIT}..master`)) : 0;
record(
  `audit commit ${AUDIT_COMMIT} is history, not an advisory`,
  ancestor && after > 0,
  ancestor
    ? `ancestor of master, ${after} commits after it`
    : `NOT an ancestor of master — fig. 3's pre-fix states must not be published`,
);

// ── report ───────────────────────────────────────────────────────────────────
const pad = Math.max(...results.map((r) => r.name.length));
console.log("\n  verify-claims — the dossier, checked against the thing it describes\n");
for (const r of results) {
  console.log(`  ${r.ok ? "ok  " : "FAIL"}  ${r.name.padEnd(pad)}  ${r.detail}`);
}
const failed = results.filter((r) => !r.ok);
console.log(
  failed.length
    ? `\n  ${failed.length} claim${failed.length === 1 ? "" : "s"} the site cannot support.\n`
    : `\n  ${results.length} checks, all supported.\n`,
);
process.exit(failed.length ? 1 : 0);

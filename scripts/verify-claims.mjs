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
 * fails loudly. Three rules it lives by:
 *
 *   1. A claim that cannot be located is a FAILURE, never a pass. If a regex
 *      stops matching because the prose moved, the check must go red — a
 *      verifier that silently matches nothing is worse than no verifier.
 *   2. Verify with the command the site actually prints next to the number.
 *      That is precisely where 308 went wrong.
 *   3. A command can only prove arithmetic. It cannot prove that the column
 *      means what its name suggests.
 *
 * Rule 3 was bought on 16 July 2026, at the cost of the second wrong number in
 * a week. "138 positions" was `sum(slot_number)` and this script was GREEN on
 * it: it ran the same query the site printed, got the same answer, and agreed.
 * Both were wrong, because slot_number is the slot's LABEL (`1 | 2`), not a
 * count — the route writes one vacancy row per slot and validates the labels for
 * uniqueness. Summing them answers nothing. The check and the claim shared a
 * misreading, so the check could never catch it.
 *
 * What caught it was a source with no assumptions in common: the council's own
 * published minutes, which count 90 admitted positions where the site's arithmetic
 * implied 138. Hence the two checks added below — the invariant that proves
 * slot_number is an ordinal (so the bug cannot return quietly), and the liveness
 * of every public-record URL the site cites. A dead citation is a false citation.
 *
 * Run: npm run verify:claims   (needs ~/TERA-LINKR; skips cleanly without it,
 * so the Railway build does not depend on a repo that isn't there)
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

// The repos moved under ~/business/unilinkr; resolve to wherever the schema
// actually is, so a local build genuinely runs this check instead of silently
// skipping it (which it did for weeks after the move, defeating the point).
const SOURCE =
  process.env.TERA_LINKR_PATH ??
  [
    join(homedir(), "TERA-LINKR"),
    join(homedir(), "dev/TERA-LINKR"),
    join(homedir(), "business/unilinkr/teralinkr"),
  ].find((p) => existsSync(join(p, "packages/backend/prisma/schema.prisma"))) ??
  join(homedir(), "TERA-LINKR");
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

// ── fig. 3's docket line ─────────────────────────────────────────────────────
// The ledger prints "cc0899d · 1 April 2026 · 34 files · +628 −193" as the
// evidence a reader can check with git. So check it with git.
const auditSrc = readFileSync("src/lib/audit.ts", "utf8");
const field = (k, re = "\\d+") => auditSrc.match(new RegExp(`${k}:\\s*"?(${re})"?`))?.[1];
const declared = {
  hash: field("hash", "[0-9a-f]+"),
  date: field("date", "[^\"]+"),
  files: field("files"),
  insertions: field("insertions"),
  deletions: field("deletions"),
};

if (Object.values(declared).some((v) => v === undefined)) {
  record("fig. 3 docket · locatable", false, "could not read auditCommit from src/lib/audit.ts");
} else {
  const realDate = git("log", "-1", "--format=%ad", "--date=format:%-d %B %Y", declared.hash);
  const numstat = git("show", "--numstat", "--format=", declared.hash)
    .split("\n")
    .filter(Boolean);
  const files = numstat.length;
  let insertions = 0;
  let deletions = 0;
  for (const line of numstat) {
    const [i, d] = line.split("\t");
    insertions += Number(i) || 0;
    deletions += Number(d) || 0;
  }
  const same =
    realDate === declared.date &&
    files === Number(declared.files) &&
    insertions === Number(declared.insertions) &&
    deletions === Number(declared.deletions);
  record(
    "fig. 3 docket · matches git",
    same,
    same
      ? `${declared.hash} · ${realDate} · ${files} files · +${insertions} −${deletions}`
      : `site: ${declared.date}, ${declared.files} files, +${declared.insertions} −${declared.deletions} · git: ${realDate}, ${files} files, +${insertions} −${deletions}`,
  );
}

// ── every commit the decisions cite ──────────────────────────────────────────
// Each decision prints `commit: "…"` as its receipt. A receipt for a commit
// that does not exist is worse than no receipt.
const evidence = [...readFileSync("src/lib/case-study.ts", "utf8").matchAll(/evidence:\s*"([^"]+)"/g)].map(
  (m) => m[1],
);
if (!evidence.length) {
  record("decisions · cited commits", false, "no `evidence:` strings found — the check moved or broke");
} else {
  const missing = evidence.filter((msg) => {
    try {
      return !git("log", "master", "--oneline", "--fixed-strings", `--grep=${msg}`).trim();
    } catch {
      return true;
    }
  });
  record(
    "decisions · every cited commit exists on master",
    missing.length === 0,
    missing.length === 0
      ? `${evidence.length} cited, ${evidence.length} found`
      : `not on master: ${missing.map((m) => `"${m}"`).join(" · ")}`,
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

// ── the production figures ───────────────────────────────────────────────────
// The most expensive claim on the site. It has been wrong twice.
//
//   "380+ vacancies handled" — matched nothing in production, for months. It
//   survived because everyone (me included) assumed the database was out of
//   reach. It never was: TERA-LINKR lives in a Railway project named
//   `patient-flow`, which is why searching for its own name found nothing.
//
//   "138 positions" — sum(slot_number), which is the sum of slot LABELS. This
//   script checked it against production and passed it, because the query and
//   the claim were the same misreading.
//
// It is now claimed in two places, and both are checked: the 308 bug survived
// precisely because the claim sites drifted apart one at a time.
const POSITIONS = [
  ["src/lib/case-study.ts", /value:\s*"(\d+)",\s*\n?\s*label:\s*"internship positions",[\s\S]{0,1400}?footnote:\s*"([^"]+)"/, "abstract metric"],
  ["src/lib/data.ts", /\{\s*value:\s*"(\d+)",\s*label:\s*"internship positions"\s*\}/, "data.ts metric"],
];

const claimed = [];
for (const [file, re, what] of POSITIONS) {
  const text = readFileSync(file, "utf8");
  const m = text.match(re);
  if (!m) {
    record(`positions · ${what}`, false, `could not find the claim in ${file} — check moved or broke`);
    continue;
  }
  claimed.push({ what, value: m[1], footnote: m[2] });
}

// The footnote must name what is being counted, and when. The programme is live;
// this is a snapshot, not a constant. It must also NOT name sum(slot_number)
// again — that is the bug, written down.
const withNote = claimed.find((c) => c.footnote);
record(
  "positions · footnote names the count and a date",
  !!withNote &&
    /count\(\*\)/.test(withNote.footnote) &&
    !/sum\(slot_number\)/.test(withNote.footnote) &&
    /\d{1,2} \w{3} \d{4}/.test(withNote.footnote),
  withNote
    ? `"${withNote.value}" · footnote: "${withNote.footnote}"`
    : "the positions footnote is missing, or it names sum(slot_number) again — slot_number is the slot's label, not a count",
);

// Every site that claims it must agree with every other.
if (claimed.length > 1) {
  const values = [...new Set(claimed.map((c) => c.value))];
  record(
    "positions · every claim site agrees",
    values.length === 1,
    values.length === 1
      ? `${claimed.length} sites, all say ${values[0]}`
      : claimed.map((c) => `${c.what}=${c.value}`).join(" · "),
  );
}

const unverifiable = [];
if (claimed.length) {
  // Aggregate counts only. That database holds real data on people aged 18–21.
  //
  // Two queries, not one. The count is what the site claims. The invariant is
  // what makes the count MEAN anything: if slot_number is a label numbered 1..n
  // within each company, then max(slot_number) = count(*) for every company and
  // its values are distinct. That held for 60 of 60 companies, which is how the
  // ordinal was proven. If someone ever "fixes" this back to a sum, the
  // invariant is the thing that says why they must not.
  const sql =
    "select (select count(*) from vacancies)::text || ' ' || " +
    "(select count(*) from (select company_id from vacancies group by 1 " +
    " having max(slot_number) = count(*) and count(distinct slot_number) = count(*)) t)::text || ' ' || " +
    "(select count(distinct company_id) from vacancies)::text";
  let live = null;
  try {
    live = execFileSync(
      "railway",
      ["run", "--service", "Postgres", "--", "bash", "-c", `psql "$DATABASE_PUBLIC_URL" -At -c "${sql}"`],
      { cwd: SOURCE, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 120_000 },
    )
      .trim()
      .split("\n")
      .pop();
  } catch {
    live = null;
  }

  const m = live?.match(/^(\d+)\s+(\d+)\s+(\d+)$/);
  if (m) {
    const [, rows, ordinal, companies] = m;
    const ok = claimed.every((c) => c.value === rows);
    record(
      "positions · checked against production",
      ok,
      ok
        ? `${rows} vacancy rows — matches`
        : `site claims ${claimed.map((c) => c.value).join("/")}, production has ${rows} rows — the programme moved, or the claim did`,
    );
    record(
      "positions · slot_number is still an ordinal, not a count",
      ordinal === companies,
      ordinal === companies
        ? `${ordinal}/${companies} companies label their slots 1..n — one row per position, so count(*) is the figure`
        : `only ${ordinal}/${companies} companies label slots 1..n — the column's meaning changed; re-read the route that writes it before trusting any figure here`,
    );
  } else {
    unverifiable.push({
      claim: `${claimed[0].value} internship positions`,
      why: "the Railway CLI could not reach production from here; the figure is a dated snapshot — re-check with `npm run verify:claims` where railway is logged in",
    });
  }
}

// ── the public record ────────────────────────────────────────────────────────
// The site is called a public record and, until 16 July 2026, cited none: every
// figure was checked against a repo nobody can clone and a database nobody can
// open. These are the council's own documents, and they are the only evidence
// here a sceptic can reach without me. A citation that 404s is worse than none —
// it is a claim that there is evidence, which there then isn't.
//
// NOT a status-code check. cm-porto.pt returns **200 with an error page** for a
// document it does not have — `/files/uploads/cms/NOPE.pdf` answers 200 — so the
// first version of this passed a deliberately-invented 404 URL and reported the
// citations healthy. Three of the four citations live on that host. A check that
// cannot tell a document from an apology is decoration.
//
// So each citation declares `proof`: a string that must appear in the response.
// jpn.up.pt serves 403 without a browser UA and cm-porto.pt is slow; both are
// handled here rather than reported as rot.
const CITED = [
  ...readFileSync("src/lib/case-study.ts", "utf8").matchAll(
    /url:\s*"(https?:\/\/[^"]+)"[\s\S]{0,400}?proof:\s*"([^"]+)"/g,
  ),
].map((m) => ({ url: m[1], proof: m[2] }));
const urlCount = [...readFileSync("src/lib/case-study.ts", "utf8").matchAll(/url:\s*"https?:\/\//g)].length;

if (!CITED.length) {
  record("public record · citations present", false, "no url/proof pairs in case-study.ts — the check moved, or the citations were removed");
} else if (CITED.length !== urlCount) {
  // A citation without a proof would be checked by nothing at all.
  record("public record · every citation declares its proof", false, `${urlCount} urls but ${CITED.length} proofs`);
} else {
  const UA =
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
  const dead = [];
  for (const { url, proof } of CITED) {
    let body = "";
    let code = "000";
    try {
      body = execFileSync(
        "curl",
        ["-sS", "-L", "--max-time", "45", "-A", UA, "-w", "\\n%{http_code}", url],
        { encoding: "latin1", stdio: ["ignore", "pipe", "ignore"], timeout: 60_000, maxBuffer: 32 * 1024 * 1024 },
      );
      code = body.trimEnd().split("\n").pop().trim();
    } catch {
      code = "000";
    }
    // The body is read as latin1 so a PDF survives the trip as bytes. That makes
    // it a byte string, so the needle has to be bytes too — matched as UTF-8 text
    // it would miss its own á and call a live citation dead.
    const needle = Buffer.from(proof, "utf8").toString("latin1");
    if (code !== "200") dead.push(`${url} → HTTP ${code}`);
    else if (!body.includes(needle)) dead.push(`${url} → 200 but no “${proof}” in it`);
  }
  record(
    "public record · every cited source is still the document cited",
    dead.length === 0,
    dead.length === 0
      ? `${CITED.length} cited, ${CITED.length} answering with what they are supposed to say`
      : `dead: ${dead.join(" · ")}`,
  );
}

// ── navigation integrity — every case study is reachable ─────────────────────
// The flagship's primary CTA ("Read the case study") once silently resolved to
// "#": the Exhibit A teaser falls back to `caseStudyHref ?? "#"`, and the
// flagship entry in data.ts had no caseStudyHref, so the site's most important
// link led nowhere — live in production. A dead link is invisible to a
// screenshot and to the design reviewer; both judge appearance, not targets. So
// it is checked here: the flagship must carry a case-study link, and every route
// a project points at must exist on disk.
const dataSrc = readFileSync("src/lib/data.ts", "utf8");
const projectBlocks = dataSrc.split(/\n  \{\n/).map((b) => `{\n${b}`);
const flagshipBlock = projectBlocks.find((b) => /flagship:\s*true/.test(b));
const flagshipHref = flagshipBlock?.match(/caseStudyHref:\s*"([^"]+)"/)?.[1];
record(
  "nav · flagship links to its case study",
  !!flagshipHref,
  flagshipBlock
    ? flagshipHref
      ? `flagship → ${flagshipHref}`
      : `the flagship project has no caseStudyHref — its "Read the case study" falls back to "#"`
    : "could not locate the flagship project in data.ts",
);

const caseHrefs = [...dataSrc.matchAll(/caseStudyHref:\s*"([^"]+)"/g)].map((m) => m[1]);
const deadRoutes = caseHrefs.filter((h) => !existsSync(join("src/app", h, "page.tsx")));
record(
  "nav · every case-study route exists",
  caseHrefs.length > 0 && deadRoutes.length === 0,
  caseHrefs.length === 0
    ? "no caseStudyHref found in data.ts — the check moved or the links were removed"
    : deadRoutes.length === 0
      ? `${caseHrefs.length} case-study routes, all present`
      : `missing page.tsx for: ${deadRoutes.join(" · ")}`,
);

// ── the claim no command can check ───────────────────────────────────────────
// "Available for work" cannot be verified by anything. It can only be re-stated.
// So it expires: 90 days after the date it carries, this goes red and someone
// has to look at it and mean it again. See the note in src/lib/site.ts.
// Anchored to the availability BLOCK, not to the word: the first version of this
// matched `open: false` inside the doc comment two lines above the real value,
// read the site as closed, and skipped itself in silence — a check that did not
// run and did not say so, which is the one thing this file is against. The same
// bug as `@theme inline {`. Match the code, never the prose about the code.
const siteSrc = readFileSync("src/lib/site.ts", "utf8");
const block = siteSrc.match(/availability:\s*\{([\s\S]*?)\}/);
const openM = block?.[1].match(/open:\s*(true|false)/);
const asOfM = block?.[1].match(/asOf:\s*"(\d{4}-\d{2}-\d{2})"/);
if (!openM || !asOfM) {
  record("availability · locatable", false, "could not read site.availability from src/lib/site.ts");
} else if (openM[1] === "false") {
  // Not a skip. Declining to claim is itself the claim, and it gets a line.
  record("availability · not claimed", true, "open: false — the site does not say it is available");
} else {
  const days = Math.floor((Date.now() - Date.parse(`${asOfM[1]}T00:00:00Z`)) / 86_400_000);
  record(
    "availability · re-stated within 90 days",
    days <= 90 && days >= 0,
    days < 0
      ? `asOf ${asOfM[1]} is in the future`
      : days <= 90
        ? `"available for work" stated ${asOfM[1]}, ${days} day${days === 1 ? "" : "s"} ago`
        : `"available for work" was last stated ${asOfM[1]}, ${days} days ago — say it again or set open: false`,
  );
}

// ── UniSpot (FC-DOSSIER 02) ──────────────────────────────────────────────────
// A second case study: a second private repo (unilinkr-org/unilinkr-ponto) and a
// second production database, in a different Railway project (ponto-demo). Same
// rule as opPORTOnities above — check the claims against git and the DB, and skip
// cleanly where the repo isn't present, so the Railway build never depends on it.
const PONTO = process.env.PONTO_PATH ?? join(homedir(), "business/unilinkr/ponto");
const US = "src/lib/case-study-unispot.ts";

if (!existsSync(PONTO)) {
  record("unispot · source repo", true, `skipped: no ponto repo at ${PONTO} (set PONTO_PATH)`);
} else {
  const pgit = (...args) =>
    execFileSync("git", ["-C", PONTO, ...args], { encoding: "utf8" }).trim();

  // Authorship. This one is collaborative, and the claim says so out loud —
  // "295 of 322 commits, with two colleagues". Two Francisco git identities
  // collapse to one person; git had better agree on the count, the total AND
  // that there are three authors, or the honest framing has rotted.
  let total = 0;
  let fran = 0;
  const others = new Set();
  for (const l of pgit("shortlog", "-sne", "HEAD").split("\n").filter(Boolean)) {
    const m = l.match(/^\s*(\d+)\s+(.+?)\s+<([^>]+)>$/);
    if (!m) continue;
    const [, count, name, email] = m;
    total += Number(count);
    if (name === "FranciscoCascalheira" || /francisco\.cascalheira|FranciscoCascalheira/.test(email))
      fran += Number(count);
    else others.add(email);
  }
  const people = others.size + (fran > 0 ? 1 : 0);

  for (const [file, tag] of [[US, "case study"], ["src/lib/data.ts", "ledger"]]) {
    const c = readFileSync(file, "utf8").match(/(\d+) of (\d+) commits, with two colleagues/);
    if (!c) {
      record(`unispot commits · ${tag}`, false, `could not find the "N of M commits" claim in ${file}`);
      continue;
    }
    const ok = Number(c[1]) === fran && Number(c[2]) === total;
    record(
      `unispot commits · ${tag}`,
      ok,
      ok ? `${fran} of ${total}` : `claims ${c[1]}/${c[2]}, git says ${fran}/${total} — the repo moved, or the claim did`,
    );
  }
  record(
    "unispot · collaborative, not solo",
    people === 3 && fran > total - fran && fran < total,
    `${people} authors · mine ${fran}, the two colleagues ${total - fran}`,
  );

  // The model count. fig. 1 shipped claiming 18 while rendering 17 once (a
  // dropped AppConfig); lock the caption's digit to the real schema so the
  // figure and its label cannot drift apart again.
  const usModels = (readFileSync(join(PONTO, "prisma/schema.prisma"), "utf8").match(/^model /gm) ?? []).length;
  const capM = readFileSync("src/app/work/unispot/page.tsx", "utf8").match(/fig\. 1 — (\d+) relational models/);
  record(
    "unispot · model count",
    !!capM && Number(capM[1]) === usModels,
    capM
      ? Number(capM[1]) === usModels
        ? `${usModels} — caption matches schema.prisma`
        : `caption says ${capM[1]}, schema.prisma has ${usModels}`
      : "could not find the fig. 1 model-count caption in page.tsx",
  );

  // The four operational figures + the corroboration invariant, against the live
  // production DB. Aggregate counts only — that database holds real staff data.
  const usSrc = readFileSync(US, "utf8");
  const metric = (label) =>
    usSrc.match(new RegExp(`value:\\s*"(\\d+)",\\s*\\n?\\s*label:\\s*"${label}"`))?.[1] ?? null;
  const claimed = {
    "bars run": metric("bars run"),
    "staff rostered": metric("staff rostered"),
    shifts: metric("shifts"),
    "clock events": metric("clock events"),
  };
  // The festival map's green numbered bars. The database's numbered postos must
  // BE this set — that is what fig. 0 asserts, and the whole corroboration.
  const GREEN_NUMBERED = "1,2,3,5,6,7,8,9,10,12,14,18";

  // SQL over stdin (psql -f -) so PascalCase identifiers need no shell escaping.
  const sql =
    `select (select count(*) from "Posto" p join "OperationalEvent" e on e.id=p."eventId" where e.code='NOS-2026' and p.kind='BAR')::text || '|' ||` +
    ` (select count(distinct "employeeId") from "EventAssignment" a join "OperationalEvent" e on e.id=a."eventId" where e.code='NOS-2026')::text || '|' ||` +
    ` (select count(*) from "Shift" s join "OperationalEvent" e on e.id=s."eventId" where e.code='NOS-2026')::text || '|' ||` +
    ` (select count(*) from "TimeEvent" t join "OperationalEvent" e on e.id=t."eventId" where e.code='NOS-2026')::text || '|' ||` +
    ` coalesce((select string_agg(substring(p.code from 'BAR-([0-9]+)'), ',' order by (substring(p.code from 'BAR-([0-9]+)'))::int) from "Posto" p join "OperationalEvent" e on e.id=p."eventId" where e.code='NOS-2026' and p.kind='BAR' and p.code like 'BAR-%'),'')`;
  let live = null;
  try {
    live = execFileSync(
      "railway",
      ["run", "--service", "Postgres", "--", "bash", "-c", 'psql "$DATABASE_PUBLIC_URL" -At -f -'],
      { cwd: PONTO, input: sql, encoding: "utf8", stdio: ["pipe", "pipe", "ignore"], timeout: 120_000 },
    )
      .trim()
      .split("\n")
      .pop();
  } catch {
    live = null;
  }

  const mm = live?.match(/^(\d+)\|(\d+)\|(\d+)\|(\d+)\|([\d,]*)$/);
  if (mm) {
    const [, bars, staff, shifts, clock, codes] = mm;
    const real = { "bars run": bars, "staff rostered": staff, shifts, "clock events": clock };
    for (const label of Object.keys(claimed)) {
      const ok = claimed[label] === real[label];
      record(
        `unispot · ${label}`,
        ok,
        ok ? `${real[label]} — matches` : `site claims ${claimed[label]}, production has ${real[label]}`,
      );
    }
    record(
      "unispot · database bars are the map's green set",
      codes === GREEN_NUMBERED && bars === "18",
      codes === GREEN_NUMBERED
        ? `18 bars; numbered set ${codes} — exactly the green nodes on the festival map (fig. 0)`
        : `numbered set is "${codes}", expected "${GREEN_NUMBERED}" — the plate and the data have diverged`,
    );
  } else {
    unverifiable.push({
      claim: `${claimed["bars run"]} bars · ${claimed["staff rostered"]} staff at NOS Alive`,
      why: "the Railway CLI could not reach ponto-demo from here; the figures are a dated snapshot — re-check with `npm run verify:claims` where railway is logged in",
    });
  }

  // Public record — FR Eventos and the festival, checked exactly like the
  // council's documents above: a 200 is not evidence, so each must return its
  // `proof` string in the body.
  const cited = [
    ...usSrc.matchAll(/url:\s*"(https?:\/\/[^"]+)"[\s\S]{0,400}?proof:\s*"([^"]+)"/g),
  ].map((x) => ({ url: x[1], proof: x[2] }));
  if (!cited.length) {
    record("unispot public record · present", false, "no url/proof pairs in case-study-unispot.ts");
  } else {
    const UA2 =
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
    const dead = [];
    for (const { url, proof } of cited) {
      let body = "";
      let code = "000";
      try {
        body = execFileSync(
          "curl",
          ["-sS", "-L", "--max-time", "45", "-A", UA2, "-w", "\\n%{http_code}", url],
          { encoding: "latin1", stdio: ["ignore", "pipe", "ignore"], timeout: 60_000, maxBuffer: 32 * 1024 * 1024 },
        );
        code = body.trimEnd().split("\n").pop().trim();
      } catch {
        code = "000";
      }
      const needle = Buffer.from(proof, "utf8").toString("latin1");
      if (code !== "200") dead.push(`${url} → HTTP ${code}`);
      else if (!body.includes(needle)) dead.push(`${url} → 200 but no “${proof}” in it`);
    }
    record(
      "unispot public record · every cited source is still the document cited",
      dead.length === 0,
      dead.length === 0
        ? `${cited.length} cited, ${cited.length} answering with what they are supposed to say`
        : `dead: ${dead.join(" · ")}`,
    );
  }
}

// ── EngineHER (FC-DOSSIER 03) ────────────────────────────────────────────────
// A third case study, on the FEUP course's own private repo and its private
// grading rubric — not a live system, so nothing here touches a database.
// Same rule: check every claim against git (the commit split, the releases,
// the test suite) and, separately, against the rubric spreadsheet itself.
// Both skip cleanly when their source isn't present locally.
const HER = process.env.ENGINEHER_PATH ?? join(homedir(), "uni/cs-feup/ESOF/EngineHER");
const HER_LIB = "src/lib/case-study-engineher.ts";

if (!existsSync(join(HER, ".git"))) {
  record("engineher · source repo", true, `skipped: no repo at ${HER} (set ENGINEHER_PATH)`);
} else {
  const hgit = (...args) =>
    execFileSync("git", ["-C", HER, ...args], { encoding: "utf8" }).trim();

  // The commit split. Five people — but ~10 git identities: most of the team
  // commits under two or three (a GitHub login, a personal email, a faculty
  // email), so neither `shortlog -sn` (by name) nor `-sne` (by email) dedups
  // to 5 on its own. This is a fixed five-person team, so the honest, auditable
  // dedup is an explicit roster: each person's set of email addresses. The
  // check then proves the five per-person totals in the figure sum to git's
  // grand total, that mine matches, and that nobody crossed a third — the
  // whole claim of the figure. If the roster ever drifts from git (a new
  // identity appears unmapped), the totals stop reconciling and this goes red.
  const ROSTER = [
    ["me", ["francisco.cascalheira2006@gmail.com", "138157517+franciscocascalheira@users.noreply.github.com"]],
    ["p2", ["up202406702@up.pt"]],
    ["p3", ["sunyezx@gmail.com"]],
    ["p4", ["anarafael492@gmail.com", "up202403634@fe.up.pt"]],
    ["p5", ["alexamadu23@gmail.com"]],
  ];
  const emailToPerson = new Map();
  for (const [person, emails] of ROSTER) for (const e of emails) emailToPerson.set(e, person);

  let total = 0;
  const byPerson = new Map();
  const unmapped = new Set();
  for (const l of hgit("shortlog", "-sne", "main").split("\n").filter(Boolean)) {
    const m = l.match(/^\s*(\d+)\s+.+?\s+<([^>]+)>$/);
    if (!m) continue;
    const [, count, email] = m;
    const n = Number(count);
    total += n;
    const person = emailToPerson.get(email.toLowerCase());
    if (!person) unmapped.add(email);
    else byPerson.set(person, (byPerson.get(person) ?? 0) + n);
  }
  const mine = byPerson.get("me") ?? 0;
  const people = byPerson.size;
  const maxPct = Math.max(...[...byPerson.values()].map((c) => (c / total) * 100));

  const herSrc = readFileSync(HER_LIB, "utf8");
  const shares = [...herSrc.matchAll(/commits:\s*(\d+),\s*pct:\s*[\d.]+(?:,\s*mine:\s*true)?/g)].map((m) =>
    Number(m[1]),
  );
  const claimedMine = shares[0];
  const claimedTotal = shares.reduce((a, b) => a + b, 0);
  const ok =
    unmapped.size === 0 &&
    shares.length === 5 &&
    people === 5 &&
    claimedMine === mine &&
    claimedTotal === total &&
    maxPct < 34.2;
  record(
    "engineher · commit split",
    ok,
    unmapped.size
      ? `unmapped git identities — the roster has drifted: ${[...unmapped].join(", ")}`
      : ok
        ? `5 people, ${mine} of ${total} mine, top share ${maxPct.toFixed(1)}% — matches git shortlog`
        : `figure claims ${shares.length} people, ${claimedMine}/${claimedTotal} — git roster says ${people} people, ${mine}/${total}`,
  );

  // The four tagged releases, against every claim site.
  const tags = hgit("tag").split("\n").filter(Boolean).sort();
  for (const [file, re, what] of [
    [HER_LIB, /\{\s*value:\s*"(\d+)",\s*\n\s*label:\s*"releases"/, "abstract metric"],
    ["src/lib/data.ts", /\{\s*value:\s*"(\d+)",\s*label:\s*"releases"\s*\}/, "data.ts metric"],
  ]) {
    const got = claim(file, re, `engineher releases · ${what}`);
    if (got === null) continue;
    record(
      `engineher releases · ${what}`,
      Number(got) === tags.length,
      Number(got) === tags.length ? `${got}` : `claims ${got}, git tag has ${tags.length} (${tags.join(", ")})`,
    );
  }

  // The test suite: Dart tests (unit + widget + integration) plus the
  // Firestore rules suite, all CI-gated.
  const dartTestCount = (dir) => {
    const p = join(HER, dir);
    if (!existsSync(p)) return 0;
    try {
      return Number(
        execFileSync("bash", ["-c", `grep -rhE '^\\s*(test|testWidgets)\\(' --include=*.dart '${p}' | wc -l`], {
          encoding: "utf8",
        }).trim(),
      );
    } catch {
      return 0;
    }
  };
  const rulesTestCount = (() => {
    const f = join(HER, "test/firestore_rules.test.cjs");
    if (!existsSync(f)) return 0;
    return (readFileSync(f, "utf8").match(/^\s*test\(/gm) ?? []).length;
  })();
  const realTests = dartTestCount("test") + dartTestCount("integration_test") + rulesTestCount;

  for (const [file, re, what] of [
    [HER_LIB, /\{\s*value:\s*"(\d+)",\s*\n\s*label:\s*"automated tests"/, "abstract metric"],
    ["src/lib/data.ts", /\{\s*value:\s*"(\d+)",\s*label:\s*"automated tests"\s*\}/, "data.ts metric"],
  ]) {
    const got = claim(file, re, `engineher tests · ${what}`);
    if (got === null) continue;
    record(
      `engineher tests · ${what}`,
      Number(got) === realTests,
      Number(got) === realTests ? `${got}` : `claims ${got}, repo has ${realTests} (${dartTestCount("test")} unit/widget + ${dartTestCount("integration_test")} integration + ${rulesTestCount} rules)`,
    );
  }

  // The CI/CD gate is claimed as real — check the workflow exists.
  record(
    "engineher · CI workflow present",
    existsSync(join(HER, ".github/workflows/ci.yml")),
    existsSync(join(HER, ".github/workflows/ci.yml"))
      ? ".github/workflows/ci.yml"
      : "no CI workflow file found in the repo",
  );
}

// The course's own grading rubric — a private spreadsheet, not something
// this script can fetch. Reads ONLY sheet "4.3" (team 4.3's own row); every
// other team's sheet in the same file is never opened. Needs python3 +
// openpyxl, both already used elsewhere on this machine for the same job.
const ESOF_XLSX = process.env.ESOF_XLSX_PATH ?? join(homedir(), "Downloads/ESOF.xlsx");
if (!existsSync(ESOF_XLSX)) {
  record("engineher · assessment source", true, `skipped: no rubric at ${ESOF_XLSX} (set ESOF_XLSX_PATH)`);
} else {
  const py = `
import openpyxl
wb = openpyxl.load_workbook(${JSON.stringify(ESOF_XLSX)}, data_only=True)
ws = wb["4.3"]
vsum = esum = 0.0
for r in range(5, 42):
    b = ws.cell(row=r, column=2).value
    if b is None:
        continue
    v = ws.cell(row=r, column=22).value
    e = ws.cell(row=r, column=5).value
    if isinstance(v, (int, float)):
        vsum += v
    if isinstance(e, (int, float)):
        esum += e
print(f"{vsum:.3f} {esum:.3f}")
`.trim();
  let out = null;
  try {
    out = execFileSync("python3", ["-c", py], { encoding: "utf8" }).trim();
  } catch {
    out = null;
  }
  const mm = out?.match(/^([\d.]+)\s+([\d.]+)$/);
  if (!mm) {
    record("engineher · assessment computed", false, "could not read sheet 4.3 from the rubric — python3/openpyxl missing, or the sheet moved");
  } else {
    const [, realV, realE] = mm;
    const claimM = readFileSync(HER_LIB, "utf8").match(/([\d.]+) of ([\d.]+) available weight/);
    if (!claimM) {
      record("engineher · assessment figure locatable", false, `could not find "N of M available weight" in ${HER_LIB}`);
    } else {
      const ok = claimM[1] === realV && claimM[2] === realE;
      record(
        "engineher · assessment matches the rubric",
        ok,
        ok
          ? `${realV} of ${realE} — team 4.3, sheet "4.3" only`
          : `claims ${claimM[1]} of ${claimM[2]}, rubric computes ${realV} of ${realE}`,
      );
    }
  }
}

// ── report ───────────────────────────────────────────────────────────────────
const pad = Math.max(...results.map((r) => r.name.length));
console.log("\n  verify-claims — the dossier, checked against the thing it describes\n");
for (const r of results) {
  console.log(`  ${r.ok ? "ok  " : "FAIL"}  ${r.name.padEnd(pad)}  ${r.detail}`);
}
const stated = unverifiable.filter((u) => u.claim !== null);
if (stated.length) {
  console.log("\n  not checkable from here — stated rather than implied:");
  for (const u of stated) console.log(`  —     "${u.claim}" · ${u.why}`);
}

const failed = results.filter((r) => !r.ok);
console.log(
  failed.length
    ? `\n  ${failed.length} claim${failed.length === 1 ? "" : "s"} the site cannot support.\n`
    : `\n  ${results.length} checks, all supported · ${stated.length} claim${stated.length === 1 ? "" : "s"} out of reach.\n`,
);
process.exit(failed.length ? 1 : 0);

/** fig. 4's engine — a real PostgreSQL, in the page, refereeing a real race.
 *
 *  Loaded only when the reader asks for it. Nothing here is in the first load;
 *  see the colophon's "loads only on demand", which this must keep true.
 *
 *  Why two-phase commit: PGlite is a single-connection Postgres, so there is no
 *  second client to race against. T1 does its work and PREPAREs — holding its
 *  locks, uncommitted — while T2 reads the pre-T1 world. That gap is the race
 *  window. T2's writes then run once T1 has committed, which is exactly where a
 *  real lock-wait would have released them. Under READ COMMITTED every
 *  statement takes a fresh snapshot, so T2 cannot tell this schedule apart from
 *  two genuinely concurrent clients — which is why the outcomes below are the
 *  real ones, not a re-enactment.
 */

import {
  raceSchema,
  raceSeed,
  raceFinalRows,
  raceError,
  type Guard,
  type MatchRow,
  type RaceStep,
} from "./race";

export type StepResult = {
  step: RaceStep;
  /** What Postgres actually answered. */
  actual: string;
  /** Whether it matched what the printed diagram claims. */
  agrees: boolean;
};

export type { MatchRow };

export type RaceResult = {
  matches: number;
  agrees: boolean;
  ms: number;
  /** Postgres's own version string, trimmed to the part a reader can check. */
  version: string;
  /** The matches table as it stands when the dust settles — the outcome in the
   *  only terms that matter: who ended up placed, and how many times. */
  rows: MatchRow[];
};

/** A line of what the engine actually did. The schedule below is not the
 *  reader's schedule — it is two-phase commit — and showing it is the point:
 *  it is the only way to see that a real Postgres is being driven here. */
export type EngineLine = {
  /** `ctl` = transaction control the engine owns; `sql` = a step's statement;
   *  `note` = why the engine did something the reader cannot infer. */
  kind: "boot" | "ctl" | "sql" | "note";
  text: string;
  /** Row count or value Postgres answered with. */
  out?: string;
  actor?: "T1" | "T2";
};

type PGliteLike = {
  query: (
    sql: string,
  ) => Promise<{ rows: Record<string, unknown>[]; affectedRows?: number }>;
  exec: (sql: string) => Promise<unknown>;
  close: () => Promise<void>;
};

type PGliteModule = {
  PGlite: {
    create: (opts?: { postgresqlconf?: string[] }) => Promise<PGliteLike>;
  };
};

let booted: PGliteLike | null = null;
let booting: Promise<PGliteLike> | null = null;

/** PGlite is served as plain static files from public/pg and imported at
 *  runtime, deliberately outside the bundler — Turbopack's production
 *  optimiser strips the module init that defines PGlite's exports, which only
 *  shows up in a built page. See scripts/copy-pglite.mjs. The specifier is held
 *  in a variable so nothing tries to follow it at build time. */
const PGLITE_URL = "/pg/index.js";

/** Boot a Postgres with two-phase commit enabled.
 *
 *  max_prepared_transactions is a postmaster-level setting — it cannot be
 *  changed on a running server — so it is passed as boot configuration.
 *  Nothing is persisted: no dataDir, no IndexedDB, no disk. The database lives
 *  in memory for as long as the tab does. */
async function boot(): Promise<PGliteLike> {
  const { PGlite } = (await import(
    /* webpackIgnore: true */ /* turbopackIgnore: true */ PGLITE_URL
  )) as PGliteModule;

  return PGlite.create({ postgresqlconf: ["max_prepared_transactions = 10"] });
}

export async function ensureDb(): Promise<PGliteLike> {
  if (booted) return booted;
  if (!booting) booting = boot().then((db) => (booted = db));
  return booting;
}

/** Drop the world and rebuild it, so every run starts from the same seed. */
async function reset(db: PGliteLike) {
  await db.exec(`DROP TABLE IF EXISTS matches, applications, vacancies, young_profiles;
    DROP TYPE IF EXISTS application_status, young_status;`);
  await db.exec(raceSchema);
  await db.exec(raceSeed);
}

/** Did the guard refuse? Either the conditional write matched nothing, or the
 *  re-read found the candidate already taken. */
function tripped(step: RaceStep, rows: Record<string, unknown>[], n: number) {
  if (step.kind === "write") return n === 0;
  if (step.kind === "check") return rows[0]?.status === "BLOCKED";
  return false;
}

function render(step: RaceStep, rows: Record<string, unknown>[], n: number) {
  if (step.kind === "check") return String(rows[0]?.status ?? "no rows");
  if (step.kind === "write") return `${n} row${n === 1 ? "" : "s"}`;
  return "ok";
}

export async function runRace(
  guard: Guard,
  onStep: (r: StepResult) => void,
  signal?: { cancelled: boolean },
  onLog?: (l: EngineLine) => void,
): Promise<RaceResult> {
  const log = (l: EngineLine) => {
    if (!signal?.cancelled) onLog?.(l);
  };

  const db = await ensureDb();
  const started = performance.now();
  log({ kind: "boot", text: await pgVersion(await ensureDb()) });
  await reset(db);
  log({ kind: "note", text: "schema + seed: one candidate, two open vacancies" });

  const emit = (step: RaceStep, actual: string) => {
    if (signal?.cancelled) return;
    onStep({ step, actual, agrees: actual === step.expect });
  };

  const of = (phase: RaceStep["phase"]) =>
    guard.steps.filter((s) => s.phase === phase);

  // The display order is the reader's order; the engine's order is dictated by
  // two-phase commit. They differ only where the difference cannot be observed:
  // T1's writes are invisible to T2 until T1 commits, so whether T2 reads
  // before or after those writes land is not a question T2 can answer.
  const results = new Map<string, string>();

  const exec = async (step: RaceStep) => {
    const res = await db.query(step.sql);
    const n = res.affectedRows ?? 0;
    const out = render(step, res.rows, n);
    results.set(step.id, out);
    log({
      kind: "sql",
      actor: step.actor,
      text: step.sql.replace(/\s+/g, " ").replace(/;$/, ""),
      out,
    });
    return tripped(step, res.rows, n);
  };

  // ── T1: begin, work, prepare (locks held, nothing committed) ──────────────
  await db.exec("BEGIN");
  log({ kind: "ctl", actor: "T1", text: "BEGIN" });
  for (const step of of("t1")) {
    if (step.kind === "begin") {
      const iso = await db.query("SHOW transaction_isolation");
      results.set(
        step.id,
        String(iso.rows[0]?.transaction_isolation ?? "").toUpperCase(),
      );
      continue;
    }
    if (step.kind === "commit") continue; // owned by 2PC below
    await exec(step);
  }
  await db.exec("PREPARE TRANSACTION 'tx1'");
  log({
    kind: "ctl",
    actor: "T1",
    text: "PREPARE TRANSACTION 'tx1'",
    out: "locks held, uncommitted",
  });
  const t1Commit = of("t1").find((s) => s.kind === "commit");

  // ── T2: read the world while T1 is still in flight ───────────────────────
  log({ kind: "note", text: "T1 is now in flight. Anything T2 reads is the pre-T1 world." });
  await db.exec("BEGIN");
  log({ kind: "ctl", actor: "T2", text: "BEGIN" });
  let refused = false;
  for (const step of of("t2-check")) {
    if (step.kind === "begin") {
      const iso = await db.query("SHOW transaction_isolation");
      results.set(
        step.id,
        String(iso.rows[0]?.transaction_isolation ?? "").toUpperCase(),
      );
      continue;
    }
    refused = (await exec(step)) || refused;
  }
  await db.exec("PREPARE TRANSACTION 'tx2'");

  // ── T1 commits. This is the instant T2's answers go stale. ────────────────
  await db.exec("COMMIT PREPARED 'tx1'");
  log({
    kind: "ctl",
    actor: "T1",
    text: "COMMIT PREPARED 'tx1'",
    out: "now true for everyone",
  });
  await db.exec("COMMIT PREPARED 'tx2'");
  if (t1Commit) results.set(t1Commit.id, "ok");

  // ── T2: write, where a real lock-wait would have released it ──────────────
  log({ kind: "note", text: "T2 writes here — where a real lock-wait would have released it." });
  await db.exec("BEGIN");
  let aborted = false;
  for (const step of of("t2-body")) {
    if (step.kind === "begin") {
      const iso = await db.query("SHOW transaction_isolation");
      results.set(
        step.id,
        String(iso.rows[0]?.transaction_isolation ?? "").toUpperCase(),
      );
      continue;
    }
    if (step.kind === "abort") {
      await db.exec("ROLLBACK");
      log({ kind: "ctl", actor: "T2", text: "ROLLBACK", out: `${raceError.status}` });
      aborted = true;
      results.set(step.id, `${raceError.status}`);
      continue;
    }
    if (step.kind === "commit") {
      await db.exec("COMMIT");
      log({ kind: "ctl", actor: step.actor, text: "COMMIT", out: "ok" });
      results.set(step.id, "ok");
      continue;
    }
    if (refused) continue; // the guard already refused; the body never runs
    refused = (await exec(step)) || refused;
  }
  if (!aborted && refused) await db.exec("ROLLBACK");

  // Replay in the reader's order.
  for (const step of guard.steps) {
    const actual = results.get(step.id);
    if (actual !== undefined) emit(step, actual);
  }

  // The outcome, in the only terms that matter: who is actually placed.
  const final = await db.query(raceFinalRows);
  const rows = final.rows as unknown as MatchRow[];
  const matches = rows.length;
  log({
    kind: "sql",
    text: raceFinalRows.replace(/\s+/g, " ").replace(/;$/, ""),
    out: `${matches} row${matches === 1 ? "" : "s"}`,
  });

  return {
    matches,
    rows,
    agrees: matches === guard.matches,
    ms: Math.round(performance.now() - started),
    version: await pgVersion(db),
  };
}

/** "PostgreSQL 18.3 (PGlite 0.5.4) on wasm32-unknown-linux-gnu, compiled by…"
 *  trimmed to the claim a reader can check against the console. */
async function pgVersion(db: PGliteLike): Promise<string> {
  const res = await db.query("SELECT version()");
  const raw = String(res.rows[0]?.version ?? "");
  return raw.match(/^PostgreSQL [\d.]+ \(PGlite [\d.]+\)/)?.[0] ?? "PostgreSQL";
}

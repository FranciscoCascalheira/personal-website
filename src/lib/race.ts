/** fig. 4 — the race condition, replayed against real Postgres.
 *
 *  Ground truth, all of it checked against ~/TERA-LINKR (branch master):
 *
 *  - The bug is exhibit 3.4: confirming a placement was neither atomic nor
 *    exhaustive, so one candidate could be placed twice.
 *  - `cc0899d` (2026-04-01, the audit of fig. 3) wrapped the confirm in a
 *    transaction and re-read the candidate's state inside it. Replayed here,
 *    that guard STILL places the candidate twice: it is a check-then-act, and
 *    under READ COMMITTED both transactions read before either writes.
 *  - `61c423e` (2026-04-26) — landed, misleadingly, under the message
 *    "refactor(ui): migrate remaining pages to PageHeader (combined with prior
 *    edits)" — deleted the candidate-side confirm route altogether and moved
 *    final placement to the company's /select, guarded by three
 *    compare-and-sets. That is the guard in production today.
 *  - `3eabd99` (2026-04-29, "Harden matching flows with race-condition
 *    coverage") added the integration tests that hold it down. It is the
 *    commit decision 4.2 cites.
 *
 *  The schema below is the real schema sanitised to shapes, the way fig. 1
 *  sanitises: real table and column names (Prisma @@map's them to snake_case),
 *  real enum values, real error messages — no client data.
 *
 *  Steps are declared once and used twice: the static diagram prints them, and
 *  the engine executes them. Neither can drift from the other.
 */

export type Actor = "T1" | "T2";

/** Which leg of the two-phase-commit schedule a step belongs to. `raceMethod`
 *  below states why that schedule is the honest one; the engine implements it. */
export type Phase = "t1" | "t2-check" | "t2-body";

export type StepKind = "check" | "begin" | "write" | "commit" | "abort";

/** How a step touches the disputed row (young_profiles.y_01.status) — the spine
 *  of fig. 4. The three guards differ only in *when*, or whether, T2 consults
 *  it: never (no guard), too early (the audit's re-read), or at the moment of
 *  writing, atomically (compare-and-set). That is the whole lesson, and it is
 *  why the timeline draws a leader from each of these steps down to the track. */
export type Track = "read" | "write" | "claim";

export type RaceStep = {
  id: string;
  actor: Actor;
  phase: Phase;
  kind: StepKind;
  /** Set only on steps that touch the disputed row. */
  track?: Track;
  /** Displayed and executed. Control statements (BEGIN/COMMIT) are structural:
   *  the engine owns them, because 2PC dictates their real order. */
  sql: string;
  /** The result the static diagram prints. The live run must agree; if it ever
   *  disagrees the figure says so rather than hiding it. */
  expect: string;
  note?: string;
  /** The step where the race is won or lost. */
  decisive?: boolean;
};

export type Guard = {
  id: string;
  /** The lever, in the reader's language. */
  lever: string;
  /** The lever's provenance — a commit a reader can check with git. */
  commit: string;
  date: string;
  /** What the guard is, in one line. */
  summary: string;
  steps: RaceStep[];
  /** The one thing to look at in the diagram, written on the diagram. Without
   *  it the "no guard" case teaches nothing: its bug is an *absence* — Beta
   *  never touches the track — and an absence has to be pointed at. `at` is the
   *  step it labels; omit it to hang the note in the middle of the window. */
  spotlight: { at?: string; text: string };
  /** The verified outcome. Printed in the static document; asserted by the run. */
  matches: number;
  verdict: string;
  /** Why it does or doesn't hold. */
  reading: string;
};

/** The real schema, sanitised to shapes. Only what the race touches. */
export const raceSchema = `CREATE TYPE application_status AS ENUM (
  'PENDING', 'COMPANY_INTERESTED', 'SELECTED',
  'CONFIRMED', 'REJECTED', 'WITHDRAWN', 'DECLINED');
CREATE TYPE young_status AS ENUM (
  'PENDING_VALIDATION', 'ACTIVE', 'BLOCKED', 'INACTIVE');

CREATE TABLE young_profiles (
  id      text PRIMARY KEY,
  status  young_status NOT NULL DEFAULT 'PENDING_VALIDATION');

CREATE TABLE vacancies (
  id      text PRIMARY KEY,
  status  text NOT NULL DEFAULT 'OPEN');

CREATE TABLE applications (
  id          text PRIMARY KEY,
  young_id    text NOT NULL REFERENCES young_profiles(id),
  vacancy_id  text NOT NULL REFERENCES vacancies(id),
  status      application_status NOT NULL DEFAULT 'PENDING',
  UNIQUE (young_id, vacancy_id));

CREATE TABLE matches (
  id              text PRIMARY KEY,
  application_id  text NOT NULL UNIQUE REFERENCES applications(id),
  young_id        text NOT NULL REFERENCES young_profiles(id),
  vacancy_id      text NOT NULL REFERENCES vacancies(id));`;

/** One candidate, selected by two companies. Both confirm at the same instant. */
export const raceSeed = `INSERT INTO young_profiles VALUES ('y_01', 'ACTIVE');
INSERT INTO vacancies VALUES ('vac_a', 'OPEN'), ('vac_b', 'OPEN');
INSERT INTO applications VALUES
  ('app_a', 'y_01', 'vac_a', 'SELECTED'),
  ('app_b', 'y_01', 'vac_b', 'SELECTED');`;

/** The verdict is read straight off the table, as rows rather than a count:
 *  "two placements" means literally two rows here with the same young_id. */
export const raceFinalRows = `SELECT id, application_id, young_id, vacancy_id
  FROM matches ORDER BY id;`;

/** What the table holds when the dust settles, printed so the figure states its
 *  outcome without a database. The run must reproduce this exactly. */
export const raceFinalState: Record<string, MatchRow[]> = {
  none: [
    { id: "m_a", application_id: "app_a", young_id: "y_01", vacancy_id: "vac_a" },
    { id: "m_b", application_id: "app_b", young_id: "y_01", vacancy_id: "vac_b" },
  ],
  reread: [
    { id: "m_a", application_id: "app_a", young_id: "y_01", vacancy_id: "vac_a" },
    { id: "m_b", application_id: "app_b", young_id: "y_01", vacancy_id: "vac_b" },
  ],
  cas: [
    { id: "m_a", application_id: "app_a", young_id: "y_01", vacancy_id: "vac_a" },
  ],
};

export type MatchRow = {
  id: string;
  application_id: string;
  young_id: string;
  vacancy_id: string;
};

const outerCheck = (actor: Actor, app: string): RaceStep => ({
  id: `${actor}-read`,
  actor,
  phase: actor === "T1" ? "t1" : "t2-check",
  kind: "check",
  sql: `SELECT status FROM applications WHERE id = '${app}';`,
  expect: "SELECTED",
  note:
    actor === "T2"
      ? "The same answer T1 got. T1 has not committed, so there is nothing here for T2 to see."
      : "The handler's own check, outside the transaction.",
});

const begin = (actor: Actor, phase: Phase): RaceStep => ({
  id: `${actor}-begin`,
  actor,
  phase,
  kind: "begin",
  sql: "BEGIN;",
  expect: "READ COMMITTED",
});

export const raceGuards: Guard[] = [
  {
    id: "none",
    lever: "no guard",
    commit: "c0e3e38",
    date: "the original confirm",
    summary:
      "The status check sits outside the transaction, and nothing re-checks it inside.",
    spotlight: {
      text: "Beta never touches the track — nothing here ever asks whether the candidate is already taken",
    },
    matches: 2,
    verdict: "two placements",
    reading:
      "Both confirms read SELECTED before either wrote, and nothing in the transaction looked again. Each wrote its own Match. The candidate is placed at two companies on the same day, and the second write is not an error — the database was never asked a question it could refuse.",
    steps: [
      outerCheck("T1", "app_a"),
      outerCheck("T2", "app_b"),
      begin("T1", "t1"),
      begin("T2", "t2-body"),
      {
        id: "T1-confirm",
        actor: "T1",
        phase: "t1",
        kind: "write",
        sql: "UPDATE applications SET status = 'CONFIRMED' WHERE id = 'app_a';",
        expect: "1 row",
      },
      {
        id: "T1-match",
        actor: "T1",
        phase: "t1",
        kind: "write",
        sql: "INSERT INTO matches (id, application_id, young_id, vacancy_id)\n  VALUES ('m_a', 'app_a', 'y_01', 'vac_a');",
        expect: "1 row",
      },
      {
        id: "T1-block",
        track: "write",
        actor: "T1",
        phase: "t1",
        kind: "write",
        sql: "UPDATE young_profiles SET status = 'BLOCKED' WHERE id = 'y_01';",
        expect: "1 row",
        note: "Unconditional. It overwrites whatever was there.",
      },
      {
        id: "T1-reject",
        actor: "T1",
        phase: "t1",
        kind: "write",
        sql: "UPDATE applications SET status = 'REJECTED'\n  WHERE young_id = 'y_01' AND id <> 'app_a'\n    AND status IN ('PENDING', 'COMPANY_INTERESTED');",
        expect: "0 rows",
        note: "app_b is SELECTED, and SELECTED is not in the list — so the competing selection is left standing.",
      },
      {
        id: "T1-commit",
        actor: "T1",
        phase: "t1",
        kind: "commit",
        sql: "COMMIT;",
        expect: "ok",
      },
      {
        id: "T2-match",
        actor: "T2",
        phase: "t2-body",
        kind: "write",
        sql: "INSERT INTO matches (id, application_id, young_id, vacancy_id)\n  VALUES ('m_b', 'app_b', 'y_01', 'vac_b');",
        expect: "1 row",
        decisive: true,
        note: "A different application, so the 1—1 constraint on matches never fires. The second placement is written.",
      },
      {
        id: "T2-block",
        track: "write",
        actor: "T2",
        phase: "t2-body",
        kind: "write",
        sql: "UPDATE young_profiles SET status = 'BLOCKED' WHERE id = 'y_01';",
        expect: "1 row",
      },
      {
        id: "T2-commit",
        actor: "T2",
        phase: "t2-body",
        kind: "commit",
        sql: "COMMIT;",
        expect: "ok",
      },
    ],
  },
  {
    id: "reread",
    lever: "re-read inside the transaction",
    commit: "cc0899d",
    date: "1 Apr 2026 — the audit of fig. 3",
    summary:
      "The transaction re-reads the candidate's status before writing, and rejects the competing selections too.",
    spotlight: {
      at: "T2-reread",
      text: "Beta does ask — but inside the window, so it is told ACTIVE and believes it",
    },
    matches: 2,
    verdict: "two placements",
    reading:
      "This is the fix I shipped in the audit, and it does not hold. The re-read is a check-then-act: T2 asks the question while T1 is still uncommitted, gets ACTIVE, and proceeds on an answer that is already stale. T1 even rejects app_b on its way out — and T2 writes straight over the rejection, because T2's own UPDATE does not ask what the row currently says. The guard closes the sequential window (confirm one, come back later for the second) and leaves the concurrent one open, which is the only window that was ever the bug.",
    steps: [
      outerCheck("T1", "app_a"),
      outerCheck("T2", "app_b"),
      begin("T1", "t1"),
      begin("T2", "t2-check"),
      {
        id: "T1-reread",
        track: "read",
        actor: "T1",
        phase: "t1",
        kind: "check",
        sql: "SELECT status FROM young_profiles WHERE id = 'y_01';",
        expect: "ACTIVE",
        note: "The audit's new line: look again, inside the transaction.",
      },
      {
        id: "T2-reread",
        track: "read",
        actor: "T2",
        phase: "t2-check",
        kind: "check",
        sql: "SELECT status FROM young_profiles WHERE id = 'y_01';",
        expect: "ACTIVE",
        decisive: true,
        note: "Still ACTIVE. T1 is in flight and uncommitted, so its work is invisible. The guard passes, and T2 proceeds on an answer that stops being true a moment later.",
      },
      {
        id: "T1-confirm",
        actor: "T1",
        phase: "t1",
        kind: "write",
        sql: "UPDATE applications SET status = 'CONFIRMED' WHERE id = 'app_a';",
        expect: "1 row",
      },
      {
        id: "T1-match",
        actor: "T1",
        phase: "t1",
        kind: "write",
        sql: "INSERT INTO matches (id, application_id, young_id, vacancy_id)\n  VALUES ('m_a', 'app_a', 'y_01', 'vac_a');",
        expect: "1 row",
      },
      {
        id: "T1-block",
        track: "write",
        actor: "T1",
        phase: "t1",
        kind: "write",
        sql: "UPDATE young_profiles SET status = 'BLOCKED' WHERE id = 'y_01';",
        expect: "1 row",
      },
      {
        id: "T1-reject",
        actor: "T1",
        phase: "t1",
        kind: "write",
        sql: "UPDATE applications SET status = 'REJECTED'\n  WHERE young_id = 'y_01' AND id <> 'app_a'\n    AND status IN ('PENDING', 'COMPANY_INTERESTED', 'SELECTED');",
        expect: "1 row",
        note: "The audit added SELECTED to the list, so T1 does reject app_b here.",
      },
      {
        id: "T1-commit",
        actor: "T1",
        phase: "t1",
        kind: "commit",
        sql: "COMMIT;",
        expect: "ok",
      },
      {
        id: "T2-confirm",
        actor: "T2",
        phase: "t2-body",
        kind: "write",
        sql: "UPDATE applications SET status = 'CONFIRMED' WHERE id = 'app_b';",
        expect: "1 row",
        note: "app_b was REJECTED by T1 a moment ago. This overwrites it — the WHERE asks only for the id.",
      },
      {
        id: "T2-match",
        actor: "T2",
        phase: "t2-body",
        kind: "write",
        sql: "INSERT INTO matches (id, application_id, young_id, vacancy_id)\n  VALUES ('m_b', 'app_b', 'y_01', 'vac_b');",
        expect: "1 row",
        note: "The second placement, again.",
      },
      {
        id: "T2-block",
        track: "write",
        actor: "T2",
        phase: "t2-body",
        kind: "write",
        sql: "UPDATE young_profiles SET status = 'BLOCKED' WHERE id = 'y_01';",
        expect: "1 row",
        note: "Already BLOCKED by T1. Writing it again changes nothing and warns nobody.",
      },
      {
        id: "T2-commit",
        actor: "T2",
        phase: "t2-body",
        kind: "commit",
        sql: "COMMIT;",
        expect: "ok",
      },
    ],
  },
  {
    id: "cas",
    lever: "compare-and-set",
    commit: "61c423e",
    date: "26 Apr 2026 — in production today",
    summary:
      "The guard stops being a question and becomes the write: claim the candidate conditionally, and believe the row count.",
    spotlight: {
      at: "T2-claim",
      text: "Beta's question is its write, and it lands after the flip — BLOCKED, no rows, 409",
    },
    matches: 1,
    verdict: "one placement, one 409",
    reading:
      "The check and the act are now a single statement, so there is no gap to lose. T2's UPDATE waits on T1's lock, and when it is released Postgres re-evaluates the WHERE against what is actually committed: status is BLOCKED, the row no longer matches, nothing is updated. Zero rows is not a failure to answer — it is the answer, and the handler turns it into a 409. The database refereed, because it was finally asked a question it could refuse.",
    steps: [
      outerCheck("T1", "app_a"),
      outerCheck("T2", "app_b"),
      begin("T1", "t1"),
      begin("T2", "t2-body"),
      {
        id: "T1-claim",
        track: "claim",
        actor: "T1",
        phase: "t1",
        kind: "write",
        sql: "UPDATE young_profiles SET status = 'BLOCKED'\n  WHERE id = 'y_01' AND status = 'ACTIVE';",
        expect: "1 row",
        note: "The claim. One statement, evaluated atomically.",
      },
      {
        id: "T1-confirm",
        actor: "T1",
        phase: "t1",
        kind: "write",
        sql: "UPDATE applications SET status = 'CONFIRMED' WHERE id = 'app_a';",
        expect: "1 row",
      },
      {
        id: "T1-match",
        actor: "T1",
        phase: "t1",
        kind: "write",
        sql: "INSERT INTO matches (id, application_id, young_id, vacancy_id)\n  VALUES ('m_a', 'app_a', 'y_01', 'vac_a');",
        expect: "1 row",
      },
      {
        id: "T1-commit",
        actor: "T1",
        phase: "t1",
        kind: "commit",
        sql: "COMMIT;",
        expect: "ok",
      },
      {
        id: "T2-claim",
        track: "claim",
        actor: "T2",
        phase: "t2-body",
        kind: "write",
        sql: "UPDATE young_profiles SET status = 'BLOCKED'\n  WHERE id = 'y_01' AND status = 'ACTIVE';",
        expect: "0 rows",
        decisive: true,
        note: "Blocked on T1's lock until T1 committed, then re-read the row: status is BLOCKED, so the WHERE no longer matches. Nothing to update.",
      },
      {
        id: "T2-abort",
        actor: "T2",
        phase: "t2-body",
        kind: "abort",
        sql: "ROLLBACK;",
        expect: "409",
        note: "count === 0 → AppError(409, 'Este/a jovem já tem uma colocação confirmada noutra entidade.')",
      },
    ],
  },
];

/** What the engine actually costs on the wire, measured in the network panel
 *  against a production build: pglite.wasm 3.28 MB + pglite.data 2.04 MB +
 *  initdb.wasm 0.14 MB + the JS glue 0.13 MB. The three binaries are gzipped at
 *  build and served with Content-Encoding: gzip (scripts/copy-pglite.mjs), so
 *  this number holds regardless of what the CDN decides to compress — raw, the
 *  same load is 17.2 MB. Re-measure when the PGlite version changes. */
export const raceEngineWeight = "5.6 MB";

/** The real message the losing company gets, from the handler in production. */
export const raceError = {
  status: 409,
  message: "Este/a jovem já tem uma colocação confirmada noutra entidade.",
  source: "packages/backend/src/routes/applications.ts",
} as const;

export const raceIntro =
  "Exhibit 3.4 says a candidate could be placed twice. Rather than ask you to take that on trust, here it is: a real Postgres, compiled to WebAssembly and running in this page, with the real schema and the real guards from three points in the repository's history. Move the lever, fire both confirmations into the same instant, and watch which ones the database is able to refuse.";

export const raceCaption =
  "fig. 4 — one candidate, two companies, the same instant · real PostgreSQL 18 (PGlite) in your browser, not the production database · the real schema sanitised to shapes · pre-fix guards are history, not advisories";

/** How the interleave is produced, stated plainly rather than implied. */
export const raceMethod =
  "PGlite is a single-connection Postgres, so there is no second client to race against. The interleave is produced with two-phase commit: T1 does its work and PREPAREs — holding its locks, uncommitted — while T2 reads the pre-T1 world, which is the race window itself; T2's writes then land after T1 commits, exactly where a real lock-wait would have released them. Under READ COMMITTED each statement takes its own snapshot, so this schedule is indistinguishable, from T2's side, from two genuinely concurrent clients. The MVCC, the constraints and the row counts are Postgres's own.";

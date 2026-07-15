// fig. 3 — the audit ledger. Everything here is recounted from the diff of a
// single commit in the TERA-LINKR repository:
//
//   cc0899d · 2026-04-01 · "fix: comprehensive platform audit — 91 bugs fixed
//   across 4 passes" · 34 files, +628 −193
//
// The commit is an ancestor of the deployed branch with 74 commits after it,
// so the pre-fix states described below are history, not a live advisory.
// Counts are fix sites at one-row-per-independent-decision granularity —
// see `reconciliation` for what that convention does and doesn't support.

export const auditCommit = {
  hash: "cc0899d",
  date: "1 April 2026",
  message: "fix: comprehensive platform audit — 91 bugs fixed across 4 passes",
  files: 34,
  insertions: 628,
  deletions: 193,
};

export type AuditCategory = {
  label: string;
  count: number;
  note: string;
};

/** Nine categories, recounted from the diff. Repeated mechanical sites are
 *  collapsed to one fix each (the 26 escaped interpolations are one decision,
 *  not 26) — the reconciliation states the effect of that choice. */
export const auditLedger: AuditCategory[] = [
  {
    label: "UI state & correctness",
    count: 14,
    note: "Dashboards reporting a proxy metric instead of the real one; toggles that failed open while loading.",
  },
  {
    label: "Error handling",
    count: 12,
    note: "An unhandled notification insert could turn a successful selection into a 500.",
  },
  {
    label: "Data integrity & state machine",
    count: 11,
    note: "Closing a vacancy left its live applications hanging; cancelling a match left the application selected.",
  },
  {
    label: "Leaks & hygiene",
    count: 10,
    note: "Blob URLs never revoked; debug logging that printed the head of the auth token.",
  },
  {
    label: "Auth, session & credentials",
    count: 9,
    note: "Reset tokens stored in the clear; JWTs accepted without the claims the routes rely on.",
  },
  {
    label: "Query correctness & pagination",
    count: 6,
    note: "Admin lists fetched every row, sorted in JavaScript, then sliced the page in memory.",
  },
  {
    label: "Race conditions & transactions",
    count: 5,
    note: "Read-then-write on apply and on select — no transaction, no constraint to catch the loser.",
  },
  {
    label: "Output encoding",
    count: 1,
    note: "Names and free text interpolated raw into transactional email; one escape helper, 26 call sites.",
  },
  {
    label: "File upload",
    count: 1,
    note: "One filter for four fields meant a PDF could be uploaded as a logo and rendered as an image.",
  },
  {
    label: "Privacy & tenant scoping",
    count: 1,
    note: "The sharpest one in the commit — see exhibit 3.2.",
  },
];

export type AuditExhibit = {
  index: string;
  title: string;
  was: string;
  now: string;
};

/** The four a reviewer would actually want to see. Each is described from the
 *  diff; none is quoted, because the fix is what matters, not the vulnerable
 *  line. */
export const auditExhibits: AuditExhibit[] = [
  {
    index: "3.1",
    title: "Reset tokens were stored in the clear",
    was: "A password reset wrote 32 random bytes straight into the users table. Anyone who could read that table — a backup, a dump, an over-broad admin query — could take over any account without ever seeing an email.",
    now: "Only the SHA-256 hash is stored; the raw token exists solely in the emailed link, and the reset route hashes what it receives before looking anything up.",
  },
  {
    index: "3.2",
    title: "One company could read another's vacancies",
    was: "The route that returns a vacancy by id guarded unpublished ones against candidates, and only candidates. Any authenticated company could walk the ids and read a competitor's drafts.",
    now: "The vacancy's owner is checked against the requesting company. The rule the endpoint always meant to enforce is now the rule it enforces.",
  },
  {
    index: "3.3",
    title: "A cancelled match poisoned the vacancy forever",
    was: "A unique constraint on the match's vacancy meant a vacancy could hold exactly one match for all time. Cancel a placement and re-match that vacancy and the database refused — permanently, and only in the flow nobody rehearses.",
    now: "The constraint is dropped, the relation is a collection, and the four call sites that assumed a single match were rewritten to match. This one needed a schema change and a migration: the bug was in the model, not the code.",
  },
  {
    index: "3.4",
    title: "Confirming a placement was neither atomic nor exhaustive",
    was: "The confirm re-read nothing inside its transaction, so two concurrent confirms could both pass the outer check; it left other companies' selections live, so a candidate could be placed twice; and it left the losing applicants on the vacancy waiting in pending.",
    now: "One transaction re-checks the candidate's state, rejects the competing selections, and closes out the other applicants. Three defects, one boundary.",
  },
];

/** The ledger audits its own headline. This is the part that makes fig. 3
 *  worth printing: the number is good-faith, and it is not reproducible. */
export const reconciliation = {
  counted: 70,
  claimed: 91,
  body: "Recounting the diff at one row per independent decision gives 70 fix sites. Count every repeated call site — 26 escaped interpolations, 5 leaked object URLs, 8 stripped debug logs — and the total passes 90; collapse the compound ones and it falls near 55. The commit's 91 sits inside that band, which makes it a good-faith count rather than a reproducible one. Roughly a tenth of the entries are hardening rather than defects: server-side pagination and a change-password endpoint are not bugs. And the four passes are not recorded anywhere in the tree — I remember doing them; the repository cannot confirm it.",
};

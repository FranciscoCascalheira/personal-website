// The opPORTOnities case study. Every claim here is checked against the real
// repository (294/294 commits on master authored by me, schema.prisma, git
// history) —
// the same rule as data.ts: describe the system, never expose employer IP,
// candidate data or credentials. Field lists are categorical summaries, not
// column dumps.

export const caseMeta = {
  title: "opPORTOnities",
  docId: "FC-DOSSIER 01",
  client: "Câmara Municipal do Porto",
  programme: "Summer-internship programme, ages 18–21",
  role: "Sole developer — requirements to production",
  period: "Feb 2026 — present",
  status: "In production",
  stack:
    "TypeScript · Express · Prisma · PostgreSQL · React (Vite) · Zod · Azure Blob · Railway",
} as const;

export const abstract = {
  claim:
    "Câmara Municipal do Porto places young people in summer internships through software one student built alone.",
  body: "opPORTOnities is the recruitment platform behind the city's summer-internship programme: candidates aged 18–21 register, approved companies post vacancies, and applications move through a supervised pipeline to confirmed placements. I sat in the requirements meetings, designed the data model, wrote every line, and deployed it. I am the only engineer who has ever committed to this codebase.",
  metrics: [
    {
      value: "294",
      label: "commits, all mine",
      // The number the footnote's own command returns, on the branch that is in
      // production. `--all` counts 308 by including feature branches that never
      // merged: my work, but not the platform the council uses.
      footnote: "git shortlog -sn master: one author",
    },
    {
      value: "138",
      label: "positions across 99 vacancies",
      // Was "380+", which matched nothing in the production database: not
      // vacancies (99), positions (138), applications (310) or users (353).
      // Vacancies were created in one window, 25 Mar — 17 Apr 2026, with no
      // deletion ever logged, so there was no hidden history behind it either.
      // A vacancy carries slot_number positions, and positions are what the
      // council and the companies actually count. Dated, because the programme
      // is live and this is a snapshot, not a constant.
      footnote: "sum(slot_number) in production · 16 Jul 2026",
    },
    { value: "12", label: "relational models" },
    { value: "3", label: "portals: candidate · company · admin" },
  ],
} as const;

export const problem = {
  paragraphs: [
    "Every summer, Porto's city council places hundreds of young residents and students in paid internships at local companies. Before this platform, that meant forms, spreadsheets and email threads: candidates mailing documents, staff cross-checking eligibility by hand, companies chasing the council for candidate lists.",
    "The council needed a real system: one place where candidates register and prove eligibility, companies apply and get vetted, vacancies get published, and every application moves through a controlled pipeline that municipal staff supervise — with the reporting a public institution is accountable for.",
  ],
} as const;

export const constraints = [
  {
    k: "One developer",
    v: "No team to review my architecture. Every decision — schema, auth, deployment — was mine to get right, and mine to fix at 2 a.m. when it wasn't.",
  },
  {
    k: "Municipal stakeholders",
    v: "Requirements arrived in meetings with council staff, in Portuguese, shaped by administrative law and programme rules — an age window, residence criteria, vetting duties. The spec was a conversation, not a document.",
  },
  {
    k: "A real deadline",
    v: "The programme has a calendar. Registrations open on an announced date whether the software is ready or not.",
  },
  {
    k: "Other people's sensitive data",
    v: "Eighteen-to-twenty-one-year-olds submitting IDs, school records and addresses. GDPR consent, honour declarations, audit trails and strict company-side visibility rules are load-bearing features, not compliance theatre.",
  },
] as const;

// ─── fig. 1 — the schema ────────────────────────────────────────────────────

export type SchemaModel = {
  id: string;
  name: string;
  domain: "identity" | "matching" | "operations";
  purpose: string;
  fields: string[];
  relations: { to: string; label: string }[];
  note: string;
};

export const domains: { id: SchemaModel["domain"]; label: string }[] = [
  { id: "identity", label: "Identity & access" },
  { id: "matching", label: "Matching" },
  { id: "operations", label: "Operations" },
];

export const schemaModels: SchemaModel[] = [
  {
    id: "user",
    name: "User",
    domain: "identity",
    purpose: "A thin authentication shell: email, password hash, one of three roles.",
    fields: ["email (unique)", "password hash", "role: YOUNG | COMPANY | ADMIN", "reset token"],
    relations: [
      { to: "youngProfile", label: "1—1 optional" },
      { to: "companyProfile", label: "1—1 optional" },
      { to: "notification", label: "1—N" },
      { to: "auditLog", label: "1—N" },
    ],
    note: "Auth is deliberately minimal. Everything a person is lives in a profile table, so the three portals share one login system without sharing shape.",
  },
  {
    id: "youngProfile",
    name: "YoungProfile",
    domain: "identity",
    purpose: "A candidate: identity, education, eligibility, documents, consents.",
    fields: [
      "identity & contact",
      "mini-CV + academic record (JSON)",
      "eligibility: age window, Porto residence/study situation",
      "document uploads (Azure Blob URLs)",
      "GDPR consent + honour declaration",
      "status: PENDING_VALIDATION → ACTIVE | BLOCKED | INACTIVE",
    ],
    relations: [
      { to: "user", label: "belongs to" },
      { to: "application", label: "1—N" },
      { to: "match", label: "1—N" },
    ],
    note: "Candidates are validated by municipal staff before they can apply — eligibility is a status transition with notes, not a boolean set at signup.",
  },
  {
    id: "companyProfile",
    name: "CompanyProfile",
    domain: "identity",
    purpose: "A company: legal identity, contacts, vetting documents, vacancy quota.",
    fields: [
      "legal + commercial name, tax ID (unique)",
      "contacts (primary + secondary)",
      "vetting documents (commercial registry, tax standing)",
      "status: PENDING_APPROVAL → ACTIVE | INACTIVE",
      "maxVacancies — admin-set quota",
    ],
    relations: [
      { to: "user", label: "belongs to" },
      { to: "vacancy", label: "1—N" },
    ],
    note: "Companies are vetted too: the council approves each one and sets how many vacancy slots it may publish. The quota lives in the database, not in a policy PDF.",
  },
  {
    id: "vacancy",
    name: "Vacancy",
    domain: "matching",
    purpose: "An internship offer inside a company's quota.",
    fields: [
      "title, description, requirements",
      "desired skills, schedule, benefits",
      "supervisor contact",
      "status: DRAFT → PENDING_REVIEW → OPEN → FILLED | CLOSED",
    ],
    relations: [
      { to: "companyProfile", label: "belongs to" },
      { to: "application", label: "1—N" },
      { to: "match", label: "1—N" },
    ],
    note: "Vacancies pass through admin review before publication — the council curates what young people see.",
  },
  {
    id: "application",
    name: "Application",
    domain: "matching",
    purpose: "The core object: one candidate applying to one vacancy, exactly once.",
    fields: [
      "status machine (see fig. 2)",
      "timestamps per transition: applied, interest, selected, rejected",
      "selectionExpiresAt — selections lapse",
      "company + admin notes",
      "UNIQUE (candidate, vacancy)",
    ],
    relations: [
      { to: "youngProfile", label: "belongs to" },
      { to: "vacancy", label: "belongs to" },
      { to: "match", label: "1—1 optional" },
    ],
    note: "The unique constraint is the referee: the database — not application code — guarantees a candidate can't apply twice to the same vacancy, no matter what races the UI produces.",
  },
  {
    id: "match",
    name: "Match",
    domain: "matching",
    purpose: "A confirmed placement — its own record, not a status flag.",
    fields: [
      "1—1 with the winning application",
      "status: ACTIVE | CANCELLED",
      "cancellation reason",
      "confirmed / cancelled timestamps",
    ],
    relations: [
      { to: "application", label: "1—1" },
      { to: "youngProfile", label: "belongs to" },
      { to: "vacancy", label: "belongs to" },
    ],
    note: "Placements outlive the application pipeline — they get cancelled, reported on, and audited. Promoting them to a first-class entity kept that history clean.",
  },
  {
    id: "platformSettings",
    name: "PlatformSettings",
    domain: "operations",
    purpose: "A singleton row of programme switches.",
    fields: [
      "registrations open/closed (per audience)",
      "application window: from / until",
      "company access to candidate data: gated",
    ],
    relations: [],
    note: "The programme has phases — registration, application, matching. Admins flip them at runtime. Phase changes are data, not deploys.",
  },
  {
    id: "notification",
    name: "Notification",
    domain: "operations",
    purpose: "In-app notifications with generic entity references.",
    fields: ["type, title, message", "read flag", "entityType + entityId"],
    relations: [{ to: "user", label: "belongs to" }],
    note: "Candidates and companies learn about status changes inside the platform, not only by email.",
  },
  {
    id: "emailLog",
    name: "EmailLog",
    domain: "operations",
    purpose: "Every transactional email, logged with outcome.",
    fields: ["recipient, subject, template", "status + error message", "entity reference"],
    relations: [],
    note: "When a candidate says “I never got the email”, the answer is a query, not a shrug.",
  },
  {
    id: "auditLog",
    name: "AuditLog",
    domain: "operations",
    purpose: "Who did what, to which entity, when.",
    fields: ["actor", "action", "entityType + entityId", "metadata (JSON)"],
    relations: [{ to: "user", label: "belongs to" }],
    note: "A public institution answers for its decisions. Every admin action on a person's application is traceable.",
  },
  {
    id: "adminIssue",
    name: "AdminIssue",
    domain: "operations",
    purpose: "An issue tracker built into the admin portal.",
    fields: [
      "type: BUG | IMPROVEMENT | REQUIREMENT | CMP_SPECIFIC",
      "priority, status, assignee",
    ],
    relations: [
      { to: "user", label: "author / assignee" },
      { to: "adminIssueComment", label: "1—N" },
    ],
    note: "Municipal staff report problems and request features inside the tool they already use — requirements stopped living in email threads.",
  },
  {
    id: "adminIssueComment",
    name: "AdminIssueComment",
    domain: "operations",
    purpose: "Threaded discussion on issues.",
    fields: ["body", "author", "timestamps"],
    relations: [{ to: "adminIssue", label: "belongs to" }],
    note: "The discussion that shapes the next release happens next to the issue it belongs to.",
  },
];

// ─── fig. 2 — the application lifecycle ─────────────────────────────────────

export const lifecycle = {
  states: [
    {
      id: "PENDING",
      label: "Pending",
      note: "Candidate applied. Visible to the company under the platform's visibility rules.",
    },
    {
      id: "COMPANY_INTERESTED",
      label: "Interested",
      note: "The company flags interest. Timestamped; the candidate is notified.",
    },
    {
      id: "SELECTED",
      label: "Selected",
      note: "A selection with a deadline — selectionExpiresAt. Unanswered selections lapse instead of blocking the candidate forever.",
    },
    {
      id: "CONFIRMED",
      label: "Confirmed",
      note: "Candidate accepts. A Match record is created — the placement now exists independently of the pipeline.",
    },
  ],
  terminal: [
    { id: "REJECTED", label: "Rejected", note: "by the company" },
    { id: "WITHDRAWN", label: "Withdrawn", note: "by the candidate" },
    { id: "DECLINED", label: "Declined", note: "candidate turns down a selection" },
  ],
  caption:
    "fig. 2 — the application state machine, as deployed. Each transition is timestamped; selections expire.",
} as const;

// ─── decisions & what broke ─────────────────────────────────────────────────

export const decisions = [
  {
    index: "4.1",
    title: "Create the account last",
    body: "The first registration wizard created the user account at step one. Real users abandoned mid-wizard, and the half-registered accounts leaked into admin dashboards and Excel exports until staff asked why the numbers looked wrong. I rewrote the flow to defer account creation to the final submit, added error recovery for the failure cases uploads produce, and filtered the legacy orphans out of every report. Transactional boundaries belong at the end of a flow, not the beginning.",
    evidence: "refactor(register): defer account creation to final submit",
  },
  {
    index: "4.2",
    title: "Let the database referee",
    body: "Selection is contested: companies compete for the same candidates, and a candidate can be selected by one company while another is deciding. Application code can't be trusted to serialise the world, so the guarantees live in Postgres — a unique constraint on (candidate, vacancy), a 1—1 constraint between Match and its winning application, and selection deadlines that lapse automatically. Then I wrote race-condition tests against the running API to prove it holds.",
    evidence: "Harden matching flows with race-condition coverage",
  },
  {
    index: "4.3",
    title: "Authorisation lives in one place",
    body: "What a company may see about a candidate is a policy question with legal weight. Early on, those rules were re-implemented per endpoint — until two screens disagreed about how many applications a company had. I centralised visibility into one module every route consults, and put the master switch (whether companies can access candidate data at all) in the platform settings the council controls. When counts disagree, users stop trusting the numbers; when authorisation is scattered, you can't even say what the rule is.",
    evidence: "Centralize company application visibility rules",
  },
  {
    index: "4.4",
    title: "Excel is a production surface",
    body: "The council runs on Excel, so exports aren't a convenience feature — they're how the programme is administered and reported upward. I hit Excel's own cell-size limits, blob-storage URL generation failing mid-export, and downloads breaking across browsers. Each fix taught the same lesson: the file a stakeholder opens is as much “the product” as any screen, and it gets the same testing, logging and error handling.",
    evidence: "Fix admin report export Excel cell limits",
  },
] as const;

export const outcome = {
  paragraphs: [
    "The platform is in production, serving candidates, companies and municipal staff through three portals. It has handled 99 vacancies — 138 positions — for 62 companies, and confirmed 62 placements. Before each release I run a smoke-test suite against the live API; before the biggest one I audited the whole platform and fixed everything I found, because nobody else was going to. That audit is fig. 3, recounted from its own diff.",
    "The stack is deliberately boring: Express, Prisma, PostgreSQL, a React SPA, and a shared types package so the API contract is one set of Zod schemas consumed by both sides. Boring bought me speed as a solo developer — every hour spent fighting a clever framework is an hour the council doesn't get.",
  ],
} as const;

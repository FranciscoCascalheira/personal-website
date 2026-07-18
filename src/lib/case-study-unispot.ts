// The UniSpot case study. Same rule as the opPORTOnities one: every figure here
// is checked against the real repository (git shortlog on ~/business/unilinkr/
// ponto) and the production database (the `ponto-demo` Railway project), and the
// hard numbers are wired into `npm run verify:claims`. Describe the system;
// never expose staff personal data. Field lists are categorical shapes, not
// column dumps.
//
// The honest frame, held everywhere below:
//   - This ran LIVE at NOS Alive 2026 for FR Eventos. It is a pilot, not an
//     ongoing production system like the city platform — say "ran", not "runs".
//   - The product is the manager CONSOLE. A self-service kiosk was built,
//     hardened, and then removed once the console proved to be how the floor
//     worked; do not sell the kiosk as the thing that carried the event.
//   - It is collaborative. 295 of 322 commits are mine; two colleagues wrote UI.
//     The concurrency, tenancy and time work is mine, and only that is claimed.

/** The public record.
 *
 *  opPORTOnities could cite the council's own signed minutes — public, on
 *  cm-porto.pt, checkable without trusting me. This one is weaker on purpose,
 *  and says so: the festival's operational site map is FR Eventos' working copy,
 *  not a public URL, so I do not pretend a reader can pull it. What a reader CAN
 *  check is who FR Eventos is and that the festival happened on the dates the
 *  database records. The map itself is fig. 0 — reproduced, and matched against
 *  the database bar for bar, in the open.
 *
 *  Every source here is checked by `npm run verify:claims`: `proof` is a string
 *  that must come back in the response body, because a 200 proves nothing (a
 *  site can answer 200 with an error page). */
export const publicRecord = [
  {
    id: "operator",
    cite: "FR Unipessoal, Lda — the bar operator",
    url: "http://www.fr-lda.com/index.html",
    attests:
      "runs the bars at NOS Alive, Sudoeste, Paredes de Coura, Super Bock Super Rock",
    proof: "espaços confinados",
  },
  {
    id: "festival",
    cite: "NOS Alive 2026 — the festival",
    url: "https://nosalive.com/en/at-the-festival/",
    attests: "9–11 July 2026 · Passeio Marítimo de Algés",
    proof: "Passeio Marítimo de Algés",
  },
] as const;

export const caseMeta = {
  title: "UniSpot",
  docId: "FC-DOSSIER 02",
  client: "FR Eventos (FR Unipessoal, Lda)",
  event: "NOS Alive 2026 · 9–11 July · Algés",
  role: "Lead developer — 295 of 322 commits, with two colleagues",
  period: "May 2026 — present",
  // Not "In production": a live pilot at one festival, not an ongoing system
  // somebody depends on today. The status vocabulary on the index page is exact
  // about this, and so is this line.
  status: "In development · ran live at NOS Alive 2026",
  stack:
    "TypeScript · Next.js 15 · React 19 · Prisma · PostgreSQL · iron-session · Zod · Railway",
} as const;

export const abstract = {
  claim:
    "FR Eventos staffed eighteen bars at NOS Alive 2026, and the clocking, correcting and paying of the people who worked them ran on software I led the building of.",
  body: "UniSpot is a staffing console for event bars: a manager opens each bar's roster, marks who turned up and when, corrects the record on the spot, and the system turns real hours into a bill. At NOS Alive 2026 it ran the floor for FR Eventos across eighteen bars and three nights, from a container behind the main stage. I designed the data model, wrote the concurrency, tenancy and time logic, and was on site to fix whatever broke. Two colleagues built parts of the interface; the engine is mine.",
  metrics: [
    {
      value: "18",
      label: "bars run",
      // The count the festival's own map agrees with, node for node — see fig. 0.
      // Postos of kind BAR for the NOS-2026 event: twelve numbered bars plus six
      // branded stands (CG, Coca-Cola, Delta, Red Bull), all green on the map.
      footnote: "count Posto kind=BAR · NOS Alive 2026 · 18 Jul 2026",
      record: "festival",
    },
    {
      value: "209",
      label: "staff rostered",
      // EventAssignment is unique per (event, employee), so the row count is the
      // headcount. 190 of them have at least one punch; 209 is the roster.
      footnote: "distinct employees on the roster · 18 Jul 2026",
    },
    {
      value: "614",
      label: "shifts",
      footnote: "count Shift · NOS Alive 2026 · 18 Jul 2026",
    },
    {
      value: "944",
      label: "clock events",
      // The honest label. 939 of 944 carry source=ADMIN — a manager marking or
      // correcting a time on the console, which is how the floor actually ran.
      // "Kiosk clock-ins" would be false: the self-service path logged 5, and was
      // removed days after the festival.
      footnote: "count TimeEvent · captured on the console · 18 Jul 2026",
    },
  ],
} as const;

export const problem = {
  paragraphs: [
    "A festival bar operator lives or dies on its floor. FR Eventos runs the bars at NOS Alive, Sudoeste, Paredes de Coura — hundreds of people across dozens of points of sale, most of them hired for a single weekend, many turning up to a bar they have never seen. Someone has to know who is working which bar tonight, whether they actually showed, when they came and went, and what each of them is owed at the end.",
    "Before this, that was paper sign-in sheets, WhatsApp, and a spreadsheet reconciled after the fact — which meant hours nobody could stand behind and pay disputes nobody could settle. The job was to replace it with one place where a manager rosters a bar, clocks its staff in and out as they arrive, corrects the inevitable mistakes on the spot, and reads off billable hours that reconcile to the minute — running on venue wifi that drops, over three nights that do not wait for a bug fix.",
  ],
} as const;

export const constraints = [
  {
    k: "The network is the enemy",
    v: "Behind a stage, on saturated venue wifi and 4G, a request commits and its acknowledgement never comes back. The system has to survive the retry that follows without duplicating a person or an hour — idempotency is not a nicety here, it is the whole floor.",
  },
  {
    k: "Nights cross midnight",
    v: "A bar shift runs 19:30 to 06:00. A six-in-the-morning exit belongs to the night before, not to a new day — so “today” cannot mean the calendar day, and the operational day, its cutoff, and its edge cases in summer time were load-bearing from the first shift.",
  },
  {
    k: "Managers, not operators",
    v: "The people using it at 2 a.m. are bar managers, not trained operators. The console has to be usable one-handed on a phone, forgiving of the wrong tap, and honest when it refuses — every correction leaves a trail, none of them silently rewrites history.",
  },
  {
    k: "One database, several companies",
    v: "The platform is multi-tenant on a shared database — an organiser, its supplier companies, its managers, each allowed to see a different slice. Getting that scoping wrong leaks one company's roster to another, so every request resolves what the caller may touch before it touches anything.",
  },
] as const;

// ─── fig. 1 — the schema ────────────────────────────────────────────────────
// Shared shape with the opPORTOnities SchemaExplorer; domain is a free string so
// each case study names its own groups.

export type SchemaModel = {
  id: string;
  name: string;
  domain: string;
  purpose: string;
  fields: string[];
  relations: { to: string; label: string }[];
  note: string;
};

export const domains: { id: string; label: string }[] = [
  { id: "access", label: "Access & tenancy" },
  { id: "people", label: "People & rates" },
  { id: "floor", label: "The floor" },
];

export const schemaModels: SchemaModel[] = [
  // ── access & tenancy ──
  {
    id: "adminUser",
    name: "AdminUser",
    domain: "access",
    purpose: "Who logs into the back office, and how wide their view is.",
    fields: [
      "email (unique), password hash",
      "role: ORGANISER | SUPER_ADMIN | MANAGER",
      "companyId — the company they are pinned to (null for super-admin)",
    ],
    relations: [
      { to: "company", label: "pinned to" },
      { to: "managerEvent", label: "1—N" },
      { to: "managerPosto", label: "1—N" },
    ],
    note: "Three roles, one rule: an ORGANISER sees only its company; a MANAGER sees only that, and is blind to money; SUPER_ADMIN (the platform) sees any company through a selector. The role is the first thing every request reads.",
  },
  {
    id: "managerEvent",
    name: "ManagerEvent",
    domain: "access",
    purpose: "Narrows a manager from a whole company down to specific events.",
    fields: [
      "adminUserId + eventId (unique together)",
      "postoScopeEnabled — opt into per-bar scoping",
    ],
    relations: [
      { to: "adminUser", label: "belongs to" },
      { to: "operationalEvent", label: "for" },
    ],
    note: "A manager sees no events until assigned one here. The opt-in flag exists because a deleted-and-recreated bar once silently promoted a manager to seeing everything — the absence of a scope row had to mean “restricted to nothing”, not “unrestricted”.",
  },
  {
    id: "managerPosto",
    name: "ManagerPosto",
    domain: "access",
    purpose: "Narrows a manager further, to specific bars inside an event.",
    fields: ["adminUserId + postId (unique together)"],
    relations: [
      { to: "adminUser", label: "belongs to" },
      { to: "posto", label: "for" },
    ],
    note: "A festival can want one manager per zone, not one per event. This is the tightest ring of the scope: with per-bar scoping on, the console shows only the bars listed here.",
  },
  {
    id: "company",
    name: "Company",
    domain: "access",
    purpose: "An organiser or a supplier of staff — the tenant boundary.",
    fields: [
      "name, NIF",
      "role: ORGANISER | SUPPLIER",
      "themeName — white-label branding",
    ],
    relations: [
      { to: "employeeCompany", label: "1—N" },
      { to: "operationalEvent", label: "owns" },
      { to: "companySupplier", label: "N—N" },
    ],
    note: "An organiser owns events; suppliers provide the people. The same person can work for several companies, so a company does not own a worker — it links to one.",
  },
  {
    id: "companySupplier",
    name: "CompanySupplier",
    domain: "access",
    purpose: "The directory of which suppliers an organiser actually uses.",
    fields: ["organiserCompanyId + supplierCompanyId (unique together)"],
    relations: [{ to: "company", label: "organiser ↔ supplier" }],
    note: "Bulk-entry once let you pick any company on the platform as a staffing source. This directory closed that: the picker now offers only an organiser's own known suppliers.",
  },
  // ── people & rates ──
  {
    id: "employee",
    name: "Employee",
    domain: "people",
    purpose: "A person who works a bar. One record, shared across companies.",
    fields: [
      "name, phone (unique), PIN (unique)",
      "shortId — a readable worker number from a Postgres sequence",
      "isAnonymous — a light row created by bulk entry",
      "legal & pay details (NIF, NISS, IBAN, base rate)",
    ],
    relations: [
      { to: "employeeCompany", label: "1—N" },
      { to: "eventAssignment", label: "1—N" },
      { to: "shift", label: "1—N" },
      { to: "timeEvent", label: "1—N" },
    ],
    note: "Identity is a phone number or a PIN, not a company. Mass entry can create a nameless “anonymous” row for someone who walked up without being pre-registered; it is hidden from selection until a manager fills it in.",
  },
  {
    id: "employeeCompany",
    name: "EmployeeCompany",
    domain: "people",
    purpose: "Links a person to a company, with that company's code and rate.",
    fields: [
      "employeeId + companyId (unique together)",
      "code — internal worker code, unique within the company",
      "hourlyRate, isOwner",
    ],
    relations: [
      { to: "employee", label: "belongs to" },
      { to: "company", label: "belongs to" },
    ],
    note: "Replaced a single company per person. One worker can be a supplier's staffer at one event and an organiser's at the next, each with its own code and base rate.",
  },
  {
    id: "function",
    name: "Function",
    domain: "people",
    purpose: "An editable catalogue of job functions (bartender, manager…).",
    fields: ["name, slug (unique), order, active"],
    relations: [
      { to: "eventAssignment", label: "1—N" },
      { to: "companyFunctionRate", label: "1—N" },
    ],
    note: "Replacing a hard-coded enum with data the super-admin edits, mid-transition: writers keep both in sync until the enum is retired. A function can be hidden without deleting it, so old rows that point at it stay valid.",
  },
  {
    id: "companyFunctionRate",
    name: "CompanyFunctionRate",
    domain: "people",
    purpose: "What a supplier charges for a function, independent of the client.",
    fields: [
      "companyId + functionId (unique together)",
      "hourlyRate",
    ],
    relations: [
      { to: "company", label: "belongs to" },
      { to: "function", label: "for" },
    ],
    note: "One rung in the rate ladder resolved per shift: shift → assignment → this card → employee-company → person. A missing card means “no level”, which is not the same as a rate of zero — a distinction the billing had to learn the hard way.",
  },
  {
    id: "eventAssignment",
    name: "EventAssignment",
    domain: "people",
    purpose: "A person put on an event's roster, with their function and rate.",
    fields: [
      "eventId + employeeId (unique together)",
      "function, hourlyRate, referrer",
      "unavailableDates — days they cannot work",
    ],
    relations: [
      { to: "operationalEvent", label: "for" },
      { to: "employee", label: "belongs to" },
      { to: "company", label: "supplied by" },
    ],
    note: "One row per person per event — the roster the whole operation is built from. 209 of these carried NOS Alive.",
  },
  // ── the floor ──
  {
    id: "operationalEvent",
    name: "OperationalEvent",
    domain: "floor",
    purpose: "One event — NOS Alive 2026 is a row here.",
    fields: [
      "code (unique), name, client, location",
      "start / end date, status",
      "operationalDayCutoffHour — when the night rolls over (default 7)",
      "kiosk PIN hash",
    ],
    relations: [
      { to: "posto", label: "1—N" },
      { to: "eventAssignment", label: "1—N" },
      { to: "shift", label: "1—N" },
      { to: "company", label: "owned by" },
    ],
    note: "The event carries its own operational-day cutoff, because a bar festival and a daytime pool event disagree about when “today” ends. Everything downstream — dashboards, pairing, who is present now — reads it.",
  },
  {
    id: "posto",
    name: "Posto",
    domain: "floor",
    purpose: "A point of sale: a bar, a stand, a wardrobe, a gate.",
    fields: [
      "eventId + code (unique together), name",
      "kind: BAR | ZONA | FUNCAO | GUARDA_ROUPA | BILHETEIRA | OUTRO",
    ],
    relations: [
      { to: "operationalEvent", label: "belongs to" },
      { to: "workSlot", label: "1—N" },
      { to: "shift", label: "1—N" },
    ],
    note: "Renamed from “Bar” to the generic “Posto” so exports do not lie to a client whose points of sale are not bars. NOS Alive had eighteen of kind BAR — the eighteen lit on the map in fig. 0.",
  },
  {
    id: "workSlot",
    name: "WorkSlot",
    domain: "floor",
    purpose: "A bar needs N people on a given date, from this hour to that.",
    fields: [
      "eventId, postId, date",
      "planned start / end",
      "shiftId — the shift that fills it (unique, optional)",
    ],
    relations: [
      { to: "operationalEvent", label: "belongs to" },
      { to: "posto", label: "at" },
      { to: "shift", label: "1—1 optional" },
    ],
    note: "The demand side of the roster: the openings a bar has to fill on a night, before anyone is assigned to them.",
  },
  {
    id: "shift",
    name: "Shift",
    domain: "floor",
    purpose: "One person, one bar, one night — planned versus what happened.",
    fields: [
      "employeeId, postId, date, planned start / end",
      "actual start / end (from punches)",
      "status: PLANNED | PRESENT | ABSENT | SUBSTITUTED",
      "needsReview + reason, reviewedManually",
      "rate, invoiceId",
    ],
    relations: [
      { to: "employee", label: "worked by" },
      { to: "posto", label: "at" },
      { to: "timeEvent", label: "1—N" },
      { to: "invoice", label: "billed on" },
    ],
    note: "The contested object (see fig. 2). Actuals come from clock punches; a human review can override them, and once reviewed, no late punch or idempotent retry may quietly undo the decision.",
  },
  {
    id: "timeEvent",
    name: "TimeEvent",
    domain: "floor",
    purpose: "A single clock punch: an ENTRY or an EXIT, at a time.",
    fields: [
      "type: ENTRY | EXIT, timestamp",
      "source: KIOSK | ADMIN",
      "employeeId or rawPhone (an unresolved punch)",
      "clientPunchId — unique, for idempotency",
    ],
    relations: [
      { to: "employee", label: "belongs to" },
      { to: "shift", label: "attached to" },
      { to: "operationalEvent", label: "at" },
    ],
    note: "The atom of the whole system. source=ADMIN is a manager on the console — how the floor ran; source=KIOSK was the self-service terminal, used five times and later removed. A punch from an unknown number is born orphaned (rawPhone set, employee null) until a manager resolves it.",
  },
  {
    id: "consoleActionBatch",
    name: "ConsoleActionBatch",
    domain: "floor",
    purpose: "The idempotency key for the console's mass actions.",
    fields: ["id — the batch key", "op, result (the stored answer)"],
    relations: [{ to: "operationalEvent", label: "for" }],
    note: "Written as the first row of a mass-entry transaction, so it commits with the work. A retry after a lost acknowledgement collides on the key and returns the stored result instead of creating twenty people twice. This row is fig. 4.",
  },
  {
    id: "invoice",
    name: "Invoice",
    domain: "floor",
    purpose: "What one person is owed for a period, from their shifts.",
    fields: [
      "employeeId, period start / end",
      "total amount, issued / voided timestamps",
    ],
    relations: [
      { to: "employee", label: "for" },
      { to: "shift", label: "1—N" },
    ],
    note: "Billing reads real hours where a shift has a clean punch pair, falls back to planned hours where it does not, and never bills zero to someone who worked — the fallback is flagged for review, not hidden.",
  },
  {
    id: "appConfig",
    name: "AppConfig",
    domain: "floor",
    purpose: "A singleton row: the global kiosk PIN.",
    fields: ["kiosk PIN hash"],
    relations: [],
    note: "The last global setting left over from the self-service kiosk — one PIN to unlock a shared terminal, with each event also carrying its own. A relic of the path that was built and then removed once the console proved to be how the floor actually worked.",
  },
];

// ─── fig. 2 — the shift lifecycle ───────────────────────────────────────────

export const lifecycle = {
  states: [
    {
      id: "PLANNED",
      label: "Planned",
      note: "Rostered to a bar for a night, with planned hours and a resolved rate. Nobody has turned up yet.",
    },
    {
      id: "PRESENT",
      label: "Present",
      note: "An ENTRY punch arrives on the console; actualStart is stamped. The operational-day cutoff decides which night it belongs to — a 06:00 punch is still last night.",
    },
    {
      id: "REVIEWED",
      label: "Reviewed",
      note: "An EXIT closes the pair, or the cron closes an unpaired shift without inventing an end time. A manager confirms or adjusts; reviewedManually is set, and retries can no longer touch it.",
    },
    {
      id: "BILLED",
      label: "Billed",
      note: "Real hours where the punches are clean, planned hours where they are not — flagged, never zero. The shift joins an invoice.",
    },
  ],
  terminal: [
    { id: "ABSENT", label: "Absent", note: "rostered, never punched — the cron marks it, inside a 24–48h window so it cannot rewrite old history" },
    { id: "SUBSTITUTED", label: "Substituted", note: "covered by another worker" },
  ],
  caption:
    "fig. 2 — the shift lifecycle, as deployed. Actuals come from clock punches; the operational-day cutoff dates them; a human review is final.",
} as const;

// ─── decisions & what broke ─────────────────────────────────────────────────

export const decisions = [
  {
    index: "4.1",
    title: "Make the console idempotent, or lose the floor",
    body: "The console's mass actions are not naturally repeatable: an anonymous entry creates people, a mass exit closes shifts by count. Routes retry on a dropped connection — including the retry after a transaction that committed but whose acknowledgement was lost on venue wifi. Re-running that duplicates people and their hours. The fix is a batch key (ConsoleActionBatch) written as the first row of the transaction, so it commits atomically with the work; a re-send collides on the primary key and returns the stored result. Mass exit closes with an atomic claim — updateMany where the shift is still open — so a second manager gets nothing, not a phantom exit. This is fig. 4.",
    evidence: "Endurecimento pré-lançamento: idempotência da consola e confiança na faturação",
  },
  {
    index: "4.2",
    title: "The night, not the calendar day",
    body: "Every read of “today” once derived the day from calendar midnight, so a night that ran to 06:00 split across two days and a 100%-night event broke. The operational day runs from a per-event cutoff to the next cutoff (default 07:00), so a late exit stays in the night it belongs to. The first version anchored the boundary to UTC and, in summer time, stranded a 06:30 Lisbon exit in the previous night; it now works in local wall-clock time.",
    evidence: "definir e editar a hora de corte do dia operacional",
  },
  {
    index: "4.3",
    title: "Resolve who you are before you touch anything",
    body: "On a shared database, one wrong query hands one company's roster to another. Every request resolves an admin context first — which company, which events, which bars this caller may see, and whether they may see money at all — and scoped routes re-query the event under that scope before acting. The money-blind MANAGER role is a single capability check, not a rule re-implemented per screen.",
    evidence: "fecha três fugas entre inquilinos nas rotas sem eventId no caminho",
  },
  {
    index: "4.4",
    title: "Never bill zero to someone who worked",
    body: "Real events have missing and late punches. Billing takes real hours from a clean punch pair, falls back to planned hours when a pair is missing, and only ever bills zero to someone marked absent — and every planned fallback is flagged for a human, not settled silently. A separate flag distinguishes a deliberate zero rate from an unresolved one, because the two used to collapse into the same number.",
    evidence: "faturação real, fallback planeado",
  },
] as const;

export const whatBroke = [
  {
    index: "5.1",
    title: "Three tenant leaks, five days before the festival",
    was: "Routes that did not carry an event id in their path slipped past the scope guard. Any admin session could confirm or adjust another organiser's shifts by id, attach a punch to another organiser's worker, or list another organiser's whole roster — names, codes, night by night.",
    now: "Each of those routes now resolves the event from the shift or punch it is given and intersects it with the caller's scope; the supplier picker validates that a company is actually a supplier of this organiser. Found late, in a pre-launch audit — worth saying plainly.",
  },
  {
    index: "5.2",
    title: "A retry undid a manager's decision",
    was: "A kiosk punch arriving after a shift was reviewed re-ran the actuals computation and resurrected status and times from the punches — quietly reversing a manager's confirm, adjust or absent.",
    now: "A reviewedManually flag makes the recompute early-return: once a human has decided a shift, no late punch or idempotent retry may touch its actuals.",
  },
  {
    index: "5.3",
    title: "Two managers, one orphan punch",
    was: "Resolving an orphaned punch read the row and then wrote it, non-atomically. Two managers resolving the same unknown-number punch overwrote each other, last writer winning.",
    now: "Resolution is an updateMany that still carries employeeId: null in its where clause — zero rows means someone got there first, and the second attempt refuses instead of clobbering.",
  },
  {
    index: "5.4",
    title: "The kiosk I built, hardened, and deleted",
    was: "A self-service kiosk — punch by PIN or phone — with a genuinely hard concurrency engine behind it: a client-generated punch id for idempotency, a per-employee row lock for the read-decide-write, a clock-drift guard, all tested against real Postgres.",
    now: "It was used five times at NOS Alive and removed days later, because the floor ran on managers marking presence at the bar. The engine was good work; keeping unused code because it was hard to write is not. Removing it is part of the story, not a footnote to it.",
  },
] as const;

export const outcome = {
  paragraphs: [
    "It ran live at NOS Alive 2026, 9 to 11 July, from a container behind the main stage — three of us on site, walking the bars to show managers the console and fixing what came up in real time. Across eighteen bars the platform holds 209 rostered staff, 614 shifts and 944 clock events, virtually all of them entered by managers on the console. The self-service kiosk that was supposed to capture them was used five times and retired a week later.",
    "The corroboration is the festival's own site map, in fig. 0. Its bars are colour-coded by operator; the eighteen it marks as FR Eventos' — lit on the plate, twelve numbered bars and six branded stands — are the exact eighteen postos in the database, and the six it marks for other operators, drawn here as ghosts, are absent from it. FR Eventos is a real company with a public history of running these bars, and the festival ran on the dates the database records. What no external document attests is authorship: that is git's word, and git says 295 of 322 commits are mine, with two colleagues on the interface. The hard parts — the idempotent console, the tenancy, the operational day — are mine alone.",
    "It is not in production the way the city platform is; it is a pilot that ran once, for real, and is still being built. The stack is deliberately ordinary — Next.js, Prisma, one Postgres — because a festival floor is no place to debug a clever abstraction at two in the morning, with a queue at the bar and no second engineer to call.",
  ],
} as const;

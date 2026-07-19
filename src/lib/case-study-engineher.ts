// The EngineHER case study. Same rule as the other two: every figure here is
// checked against the real repository (git on LEIC-ES-2025-26-2LEIC04/T3) or
// the course's own grading rubric, and the hard numbers are wired into
// `npm run verify:claims`.
//
// The honest frame, held everywhere below:
//   - This is a five-person team project, not a solo or lead one. The thesis
//     is the team, not me: 320 commits split five ways, nobody over 34%.
//   - My role was architecture and integration — data flow, system
//     structure, wiring the pieces the team built. Stated once, modestly,
//     in service of the teamwork claim, not as its subject.
//   - Teammates are credited as "a team of five", not by name — naming them
//     needs their consent, which this page does not have.
//   - The grading rubric is a private course document, not a public record
//     like the other two case studies cite. Said so, plainly, where it's
//     cited — it is not linked, because there is nothing to link to.

export const caseMeta = {
  title: "EngineHER",
  docId: "FC-DOSSIER 03",
  course: "ESOF (Engenharia de Software) · FEUP, LEIC-ES 2025/26",
  team: "Team 4.3 · LEIC-ES-2025-26-2LEIC04",
  role: "Architecture & integration — one of five",
  period: "Feb — May 2026",
  status: "Delivered",
  stack: "Flutter · Dart · Firebase · Firestore · GitHub Actions",
} as const;

/** The corroboration. Unlike the other two case studies, this is not a
 *  public document — it is the course's own grading rubric, a private
 *  spreadsheet a team member has legitimate access to. Said so rather than
 *  dressed up as a public record: there is no url, because there is nothing
 *  a reader can independently pull. What makes it strong evidence anyway is
 *  who wrote it — an examiner with no reason to flatter the team. */
export const assessment = {
  cite: "The course's own grading rubric — team 4.3, assessed by the ESOF teaching team",
  attests:
    "0.538 of 0.600 available weight on every team-graded criterion (backlog refinement, design, all three construction increments, testing, DevOps automation, sprint ceremonies) — 89.7%, on the rubric FEUP's ESOF course uses to grade every team the same way.",
  note: "Not a public document — the individual TPC assignments and Personal Assessment aren't in this figure, and no other team's row is either.",
} as const;

export const abstract = {
  claim:
    "Five of us built a mentorship app for engineering students, and the way we worked together is the thing worth reading — the professor who graded it agreed.",
  body: "EngineHER connects female engineering students with mentors and role models: a mentee finds someone further along, sends a request, and — once accepted — the two talk inside the app. It was built for FEUP's ESOF course by a team of five across three Agile sprints to four tagged releases, with a CI pipeline gating every merge and a test suite that grew alongside the app. I was one of the five; my part was the architecture — the data flow and system structure the rest of the app was built on top of.",
  metrics: [
    {
      value: "5",
      label: "person team",
      footnote: "320 commits, nobody over 34% · git shortlog · 19 Jul 2026",
    },
    {
      value: "4",
      label: "releases",
      footnote: "v0.1.0 – v0.4.0 · 3 sprints · git tag",
    },
    {
      value: "127",
      label: "automated tests",
      footnote: "122 Dart (unit, widget, integration) + 5 Firestore-rules · CI-gated",
    },
    {
      value: "90%",
      label: "on the team rubric",
      footnote: "0.538 of 0.600 available weight · assessed",
      record: "assessment",
    },
  ],
} as const;

export const problem = {
  paragraphs: [
    "Engineering has a gender gap that starts before the workforce — it starts in who a student pictures when they picture an engineer, and in who they can ask when the degree gets hard. A first-year without a mentor still has classmates and forums; what she is often missing is someone a few years ahead who has already been the only woman in the room and can say plainly what that is like.",
    "EngineHER is a Flutter app built to close that gap directly: a mentee describes what she's looking for, browses mentors and role models by field and background, and sends a request. Once a mentor accepts, the pairing moves into a chat inside the app. Role models — women already working as engineers — answer public questions from anyone in the community, so the app serves people who want an ongoing mentor and people who just have one question to ask.",
  ],
} as const;

export const constraints = [
  {
    k: "A fixed academic clock",
    v: "Three Agile sprints, each ending on a hard FEUP deadline, with a graded demo at the end of every one. There is no slipping a sprint to catch up — the cadence itself was a constraint the team had to plan around, not just the features inside it.",
  },
  {
    k: "Five people, one app",
    v: "Five students coordinating one Flutter codebase, most of them new to Firebase and to each other. The team had to agree on a data model and a branching discipline in week one and then actually hold to it for three months.",
  },
  {
    k: "Real users, a real gap",
    v: "The people this app is for are specific — engineering students who feel that gap firsthand — so a mockup that looked plausible wasn't enough; the team validated the flow against real prospective users before building past a prototype.",
  },
  {
    k: "Everything had to be checkable",
    v: "ESOF grades the process as much as the product: sprint backlogs, retrospectives, a CI pipeline, a growing test suite. The team wasn't just building an app — it was building a paper trail a professor could open and verify.",
  },
] as const;

// ─── fig. 1 — the schema ────────────────────────────────────────────────────
// Shared shape with the other two case studies' SchemaExplorer.

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
  { id: "people", label: "People & roles" },
  { id: "mentorship", label: "Mentorship" },
  { id: "content", label: "Content" },
];

export const schemaModels: SchemaModel[] = [
  {
    id: "appUser",
    name: "AppUser",
    domain: "people",
    purpose: "One unified profile type for all three roles in the app.",
    fields: [
      "name, username, email, bio, isPublic",
      "role: mentee | mentor | roleModel",
      "engineeringAreas, hobbies",
      "mentee only: confidenceLevel, mentorshipNeeds",
      "mentor only: mentorYear, menteeLimit, helpAreas",
      "role model only: currentPosition, institution, specializedField, degree",
    ],
    relations: [
      { to: "mentorshipRequest", label: "sends / receives" },
      { to: "chatMessage", label: "sends / receives" },
      { to: "roleModelQuestion", label: "asks / answers" },
      { to: "article", label: "publishes" },
    ],
    note: "A role model can also mentor, so three separate collections would have duplicated identity, auth and messaging across all of them. One profile, one role field, three shapes of onboarding on top of it.",
  },
  {
    id: "mentorshipRequest",
    name: "MentorshipRequest",
    domain: "mentorship",
    purpose: "A mentee's request to a mentor, and its answer.",
    fields: [
      "menteeId, mentorId, message, interest",
      "status: pending | accepted | declined | ended",
      "menteeName, menteeLevel — denormalised for the card",
    ],
    relations: [
      { to: "appUser", label: "mentee" },
      { to: "appUser", label: "mentor" },
    ],
    note: "menteeName and menteeLevel are copied onto the request on purpose: a mentor's inbox reads as one query, not one read per card. This is fig. 2 — the whole request lifecycle.",
  },
  {
    id: "chatMessage",
    name: "ChatMessage",
    domain: "mentorship",
    purpose: "One message inside an accepted mentorship.",
    fields: [
      "senderId, receiverId, connectionId",
      "text, sentAt",
      "readBy — who has seen it",
    ],
    relations: [{ to: "appUser", label: "sender / receiver" }],
    note: "connectionId groups a whole thread so opening a chat is one query, not a scan of every message either side ever sent.",
  },
  {
    id: "roleModelQuestion",
    name: "RoleModelQuestion",
    domain: "content",
    purpose: "A public question to a role model, and its answer.",
    fields: [
      "authorId, authorName, authorRole",
      "roleModelId, roleModelName, text",
      "status: pending | answered",
      "answerText, answeredAt",
    ],
    relations: [
      { to: "appUser", label: "author" },
      { to: "appUser", label: "role model" },
    ],
    note: "Any mentee or mentor can ask, not just the role model's own mentees — the answer is visible to whoever follows the thread, so one answer serves more than one asker.",
  },
  {
    id: "article",
    name: "Article",
    domain: "content",
    purpose: "A longer piece published by a mentor or role model.",
    fields: ["title, content, imageUrl", "authorName, authorId, createdAt"],
    relations: [{ to: "appUser", label: "author" }],
    note: "The app's other content surface besides one-to-one mentorship — something to read even before a mentee has found or been accepted by a mentor.",
  },
];

// ─── fig. 2 — the mentorship request lifecycle ─────────────────────────────

export const lifecycle = {
  states: [
    {
      id: "PENDING",
      label: "Pending",
      note: "A mentee sends a request to a mentor or role model, naming what she's looking for and a short message.",
    },
    {
      id: "ACCEPTED",
      label: "Accepted",
      note: "The mentor accepts. The pairing becomes active and a chat thread opens between the two.",
    },
  ],
  terminal: [
    { id: "DECLINED", label: "Declined", note: "the mentor turns down the request" },
    { id: "ENDED", label: "Ended", note: "either side ends an active mentorship" },
  ],
  caption:
    "fig. 2 — the mentorship request lifecycle, as modelled in MentorshipRequest.",
} as const;

// ─── fig. 0 — five contributors, three sprints, four releases ─────────────
// The signature figure. Not an engraved plate: the claim here is the team,
// so the figure is the plainest possible rendering of that claim — who wrote
// how much of the code, laid against when it shipped.

export type TeamShare = { label: string; commits: number; pct: number; mine?: boolean };

export const teamShares: TeamShare[] = [
  { label: "Architecture & integration (me)", commits: 109, pct: 34.1, mine: true },
  { label: "Teammate", commits: 88, pct: 27.5 },
  { label: "Teammate", commits: 60, pct: 18.75 },
  { label: "Teammate", commits: 33, pct: 10.3 },
  { label: "Teammate", commits: 30, pct: 9.4 },
];

export const releases = [
  { tag: "v0.1.0", date: "5 Apr 2026", sprint: "Sprint 1" },
  { tag: "v0.2.0", date: "22 Apr 2026", sprint: "Sprint 2" },
  { tag: "v0.3.0", date: "13 May 2026", sprint: "Sprint 3" },
  { tag: "v0.4.0", date: "27 May 2026", sprint: "Stabilisation" },
] as const;

export const teamPlateCaption =
  "fig. 0 — 320 commits, five people, nobody over 34% · four tagged releases across three sprints · git tag, git shortlog · 19 Jul 2026";

// ─── fig. 3 — the cadence: every hand on the repo, month by month ───────────
// The bars in fig. 0 show the split; they cannot show that all five were on the
// repo across the whole window, at their own rhythm. This does. Counts include
// merges, so each lane's three months sum to that person's fig. 0 total — one
// set of numbers across both figures. Teammates stay "Teammate" (no names
// without consent), ordered by total to match fig. 0. git log by month.

export type CadenceLane = { label: string; counts: number[]; total: number; mine?: boolean };

export const cadence = {
  months: ["Mar", "Apr", "May"],
  // The four tagged releases, placed on the Mar 1 → Jun 1 axis by their date
  // (fraction of the 92-day span), so a reader sees when each increment landed
  // against who was committing around it.
  releases: [
    { tag: "v0.1.0", at: 0.38 }, // 5 Apr
    { tag: "v0.2.0", at: 0.565 }, // 22 Apr
    { tag: "v0.3.0", at: 0.79 }, // 13 May
    { tag: "v0.4.0", at: 0.945 }, // 27 May
  ],
  lanes: [
    { label: "Architecture & integration (me)", counts: [1, 21, 87], total: 109, mine: true },
    { label: "Teammate", counts: [5, 30, 53], total: 88 },
    { label: "Teammate", counts: [0, 23, 37], total: 60 },
    { label: "Teammate", counts: [15, 9, 9], total: 33 },
    { label: "Teammate", counts: [0, 7, 23], total: 30 },
  ] as CadenceLane[],
  caption:
    "fig. 3 — commits by month, one lane per person (counts include merges, so each lane sums to its fig. 0 total) · git log · 19 Jul 2026",
} as const;

// ─── fig. 4 — the professor's rubric, by activity ──────────────────────────
// The corroboration made into an artifact. Every number here is team 4.3's own
// score on the course's shared rubric — no other team's row, no individual
// student. Scores are the weighted /20 the team earned per activity; the total
// is the 0.538 of 0.600 that §05 states. Read off sheet "4.3" only.

export type RubricRow = { name: string; score: number; weight: number };

export const rubric = {
  total: { score: 17.9, weightEarned: 0.538, weightOf: 0.6, pct: 90 },
  // Ordered by score; Construction is both the strongest and the heaviest
  // weight, Change management the weakest but the lightest — shown, not hidden.
  categories: [
    { name: "Construction", score: 19.2, weight: 0.16 },
    { name: "Business modeling", score: 19.1, weight: 0.04 },
    { name: "DevOps", score: 18.8, weight: 0.04 },
    { name: "Testing", score: 18.4, weight: 0.08 },
    { name: "Analysis & design", score: 18.3, weight: 0.03 },
    { name: "Project management", score: 17.3, weight: 0.08 },
    { name: "Requirements", score: 16.9, weight: 0.1 },
    { name: "Environment", score: 15.8, weight: 0.06 },
    { name: "Change management", score: 12.2, weight: 0.01 },
  ] as RubricRow[],
  // The honest arc: the team was weak at git hygiene early and got good at it.
  // The rubric scored "manage issues, versions, branches, PRs" once per sprint.
  climb: {
    label: "Managing issues, branches and pull requests",
    scores: [5, 8, 17, 19],
    note: "scored once per sprint — a team that got measurably better at its own process",
  },
  caption: "fig. 4 — team 4.3's weighted score per activity, out of 20 · course rubric, sheet 4.3 only",
} as const;

// ─── how the team worked ───────────────────────────────────────────────────

export const teamwork = [
  {
    index: "4.1",
    title: "No one carried the project alone",
    body: "320 commits on main, split five ways: 109 mine, and the rest of the team at 88, 60, 33 and 30 — nobody past a third of the total, and four of the five names between them wrote almost two-thirds of the code. That is what the commit graph of a team that actually shared the work looks like, not a solo project with credited spectators.",
    evidence: "git shortlog -sne main, deduped by email across each person's git identities",
  },
  {
    index: "4.2",
    title: "Pull requests, not a single trunk of commits",
    body: "39 pull requests, authored by four of the five team logins, almost every one carrying reviewers requested from the rest of the team. Roughly a third of merged PRs were merged by someone other than the person who opened them — a real, if partial, signal that more than one person was reading the code before it landed, not just approving their own work.",
    evidence: "GitHub PR authorship and merged_by across 35 merged pull requests",
  },
  {
    index: "4.3",
    title: "Three sprints, four releases, on schedule",
    body: "The team shipped a tagged GitHub release at the end of each of the three Agile sprints and one stabilisation pass after — v0.1.0 through v0.4.0, 5 April to 27 May 2026 — each one a working increment a professor could install and use, not a snapshot of source.",
    evidence: "git tag, four annotated releases v0.1.0–v0.4.0",
  },
  {
    index: "4.4",
    title: "A CI gate that actually failed sometimes",
    body: "Every push and pull request ran the same GitHub Actions pipeline. Its history isn't a single green checkmark stamped at the end — there are real failed runs through May, followed by fixes and a re-run that passed, which is what a CI gate looks like when a team is actually using it to catch problems rather than performing one for the record.",
    evidence: "GitHub Actions workflow run history, .github/workflows/ci.yml",
  },
] as const;

export const outcome = {
  paragraphs: [
    "EngineHER shipped as a delivered, accepted academic project — four tagged releases across three sprints, a CI pipeline that gated every merge, and 127 automated tests behind it. It is not in production and carries no live users; it was built, demoed, graded and handed in, which is what \"delivered\" means on this site.",
    "The claim this case study makes isn't about a clever piece of engineering — it's that five people coordinated well enough, for three months, that the commit graph, the pull requests and the course's own rubric all say the same thing independently. My part in it was architecture and integration: the data model above, and the plumbing between the screens the rest of the team built on top of it.",
    "The professor's assessment is the strongest single piece of evidence here, precisely because it isn't mine to write — an examiner with no reason to flatter the team scored the process the team ran, not just the app it produced, and scored it well.",
  ],
} as const;

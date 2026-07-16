// Structured content. Every metric here is defensible from real evidence
// (solo commit counts, production status, aggregate vacancy counts). No repo
// links to employer IP; case studies describe, they don't expose.

/** Three states, and each one is a fact about who depends on the thing:
 *
 *    In production  — people who are not me depend on it today.
 *    In development — it is being written now.
 *    Delivered      — handed over and accepted; nobody is adding to it.
 *
 *  The rungs used to be "In production | Shipped | Delivered", which read like a
 *  ladder and defined nothing. "Shipped" was the worst of them: it dressed a
 *  demo on a generated subdomain in the same word as a municipal platform with
 *  real users, and it sat on a card whose own summary said "ready to deploy".
 *  A word that flatters every rung equally is not a status. It is decoration. */
export type Status = "In production" | "In development" | "Delivered";

export const statusLegend =
  "In production — someone other than me depends on it today · In development — being written now · Delivered — handed over, accepted, finished";

export type Project = {
  slug: string;
  index: string;
  name: string;
  tagline: string;
  client?: string;
  year: string;
  role: string;
  status: Status;
  summary: string;
  contributions: string[];
  stack: string[];
  metrics: { value: string; label: string }[];
  flagship?: boolean;
};

export const projects: Project[] = [
  {
    slug: "tera-linkr",
    index: "01",
    name: "opPORTOnities",
    tagline: "A recruitment platform for the City of Porto",
    client: "Câmara Municipal do Porto · TERA",
    year: "2026",
    role: "Sole developer — requirements to deployment",
    status: "In production",
    flagship: true,
    summary:
      "A full-stack recruitment platform for TERA, a youth-employment programme of Câmara Municipal do Porto. It connects young candidates with companies through profiles, vacancy listings and an end-to-end application pipeline. I own the entire system: I sat in requirements meetings with municipal stakeholders, designed the architecture, built it, and shipped it to production.",
    contributions: [
      "Designed the full data model — candidates, companies, vacancies and applications across 12 relational models.",
      "Built the API (Express + Prisma) and the React SPA, with auth, file uploads and transactional email.",
      "Ran the whole cycle solo: requirements gathering, architecture, implementation, deployment and maintenance.",
    ],
    stack: [
      "React",
      "TypeScript",
      "Node.js",
      "Express",
      "PostgreSQL",
      "Prisma",
      "Tailwind",
      "Zod",
      "Azure Blob",
    ],
    metrics: [
      { value: "294", label: "solo commits" },
      { value: "99", label: "internship positions" },
      { value: "12", label: "data models" },
      { value: "Live", label: "in production" },
    ],
  },
  {
    slug: "unispot",
    index: "02",
    name: "UniSpot",
    tagline: "A clock-in kiosk and HR back office",
    year: "2026",
    // Was "Sole developer" with a metric reading "223 solo commits". Neither was
    // true: `git log` on the repo says 279 commits — 254 mine, 22 João Ferreira's,
    // 3 André Grasslin's — and 223 was not the count of anything. On a site whose
    // headline is that I built one thing alone, claiming I built everything alone
    // is the cheapest way to make the true claim worthless.
    role: "Lead developer — 254 of 279 commits, with two colleagues",
    status: "In development",
    summary:
      "A mobile-first attendance product: a PIN-unlocked kiosk terminal for clocking in and out, an admin back office for HR to review and correct records, and one-click Excel export. It runs as a demo on a generated Railway subdomain and is written to be installed white-label; no client has installed it yet, and it is still being written.",
    contributions: [
      "Built the kiosk flow, the admin back office and the correction tooling as a single Next.js 15 app.",
      "Modelled attendance and shifts in Prisma/PostgreSQL with server-side validation.",
      "Added Excel export and a Railway deployment configuration.",
    ],
    stack: [
      "Next.js 15",
      "TypeScript",
      "Prisma",
      "PostgreSQL",
      "Tailwind",
      "Railway",
    ],
    metrics: [
      { value: "254", label: "of 279 commits" },
      { value: "Kiosk", label: "+ back office" },
      { value: "Excel", label: "export" },
    ],
  },
  {
    slug: "engineher",
    index: "03",
    name: "EngineHER",
    tagline: "A mentorship app tackling the gender gap in engineering",
    // 2025 was wrong: the repository was created 25 Feb 2026 and its four
    // releases are dated April and May 2026. The course is LEIC-ES 2025/26 —
    // the academic year, not the calendar one. An off-by-one that quietly aged
    // the work by twelve months in the wrong direction.
    year: "2026",
    // nbsp: "team of 5" broke across lines and left "OF 5" orphaned on its own
    role: "Architecture & integration — team of 5",
    status: "Delivered",
    summary:
      "A Flutter mobile app connecting female engineering students with mentors and role models. Built across three Agile sprints by a team of five, with a real CI pipeline and a thorough automated test suite. My focus was the architecture — data flow, system structure and the integration between components.",
    contributions: [
      "Owned data flow and system structure; integrated the pieces the team built.",
      "Shipped iteratively across three sprints to four tagged releases.",
      "Backed the app with GitHub Actions CI and 80+ unit, widget and rules tests.",
    ],
    stack: ["Flutter", "Dart", "Firebase", "Firestore", "GitHub Actions"],
    metrics: [
      { value: "4", label: "releases" },
      { value: "80+", label: "automated tests" },
      { value: "5", label: "person team" },
    ],
  },
];

export type Experience = {
  role: string;
  org: string;
  period: string;
  note: string;
  kind: "work" | "leadership" | "education" | "cert";
};

export const trajectory: Experience[] = [
  {
    role: "Software Developer",
    org: "Universal Linker",
    period: "Feb 2026 — Present",
    note: "Sole developer of a recruitment platform in production for Câmara Municipal do Porto; lead developer of UniSpot; contributor to the company product.",
    kind: "work",
  },
  {
    role: "Secretary",
    org: "ACM FEUP — Porto Student Chapter",
    period: "2025 — Present",
    note: "Third-ranking officer of the chapter; full ACM international membership. Involved in student events and CTF activities with the U.Porto community.",
    kind: "leadership",
  },
  {
    role: "Software Developer",
    org: "Cascalheira & Filho Lda",
    period: "Jul — Sep 2025",
    note: "Built internal software to track sales and invoicing for a family-owned business, replacing manual processes.",
    kind: "work",
  },
  {
    role: "BSc, Computer Engineering",
    org: "Faculty of Engineering, University of Porto (FEUP)",
    period: "2024 — 2027 (expected)",
    note: "Currently in the second year.",
    kind: "education",
  },
  {
    role: "ISC2 Cybersecurity Certification",
    org: "In progress",
    period: "2026",
    note: "Network security, cryptography and vulnerability assessment.",
    kind: "cert",
  },
  {
    role: "EBEC Porto 2025",
    org: "Case Study Competition — organised by BEST",
    period: "2025",
    note: "Certificate of participation in the pan-European engineering competition.",
    kind: "cert",
  },
];

export const skills: { group: string; items: string[] }[] = [
  {
    group: "Languages",
    items: ["TypeScript", "Python", "Java", "C++", "SQL", "Dart"],
  },
  {
    group: "Web & Backend",
    items: ["React", "Next.js", "Node.js", "Express", "Prisma", "HTML/CSS"],
  },
  {
    group: "Data & Infra",
    items: ["PostgreSQL", "Firebase", "Git", "Linux", "Azure Blob", "Railway"],
  },
  {
    group: "Practice",
    items: ["System design", "Testing", "CI/CD", "Agile / Scrum", "REST APIs"],
  },
];

export const interests = [
  "Bitcoin & Austrian economics",
  "Cybersecurity",
  "Philosophy",
  "Ancient history",
  "Literature",
  "Startups",
];

export const languages: { name: string; level: string }[] = [
  { name: "Portuguese", level: "Native" },
  { name: "English", level: "B2" },
  { name: "Spanish", level: "B1" },
];

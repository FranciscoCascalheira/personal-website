// Structured content. Every metric here is defensible from real evidence
// (solo commit counts, production status, aggregate vacancy counts). No repo
// links to employer IP; case studies describe, they don't expose.

export type Project = {
  slug: string;
  index: string;
  name: string;
  tagline: string;
  client?: string;
  year: string;
  role: string;
  status: "In production" | "Shipped" | "Delivered";
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
      { value: "380+", label: "vacancies handled" },
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
    role: "Sole developer",
    status: "Shipped",
    summary:
      "A mobile-first attendance product: a PIN-unlocked kiosk terminal for clocking in and out, an admin back office for HR to review and correct records, and one-click Excel export. Built end to end on the modern Next.js stack and ready to deploy.",
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
      { value: "223", label: "solo commits" },
      { value: "Kiosk", label: "+ back office" },
      { value: "Excel", label: "export" },
    ],
  },
  {
    slug: "engineher",
    index: "03",
    name: "EngineHER",
    tagline: "A mentorship app tackling the gender gap in engineering",
    year: "2025",
    role: "Architecture & integration — team of 5",
    status: "Shipped",
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
  {
    slug: "space-invaders",
    index: "04",
    name: "Space Invaders",
    tagline: "A terminal arcade game, engineered properly",
    year: "2025",
    role: "Co-developer — team of 2",
    status: "Delivered",
    summary:
      "A classic arcade game rebuilt in Java for the terminal, used as a vehicle for clean software design. MVC architecture, applied design patterns, seeded gameplay and progressive difficulty — with full unit and integration test coverage.",
    contributions: [
      "Structured the game around MVC with deliberate use of design patterns.",
      "Implemented seeded gameplay, multiple states and progressive difficulty.",
      "Wrote unit and integration tests with JUnit and JaCoCo coverage.",
    ],
    stack: ["Java", "Lanterna", "Gradle", "JUnit", "JaCoCo"],
    metrics: [
      { value: "MVC", label: "architecture" },
      { value: "Full", label: "test coverage" },
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
    note: "Sole developer of a recruitment platform in production for Câmara Municipal do Porto; solo build of UniSpot; contributor to the company product.",
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

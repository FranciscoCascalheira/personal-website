// Central site configuration. Single source of truth for identity + links.

export const site = {
  name: "Francisco Cascalheira",
  role: "Software Developer",
  location: "Porto, Portugal",
  locator: "PORTO · PT",
  coordinates: "41.1579° N, 8.6291° W",
  url: "https://www.franciscocascalheira.com",
  description:
    "The City of Porto runs its youth-internship programme on software I built alone. Second-year Computer Engineering student at FEUP; sole developer of a recruitment platform in production for Câmara Municipal do Porto.",
  email: "francisco.cascalheira2006@gmail.com",
  socials: {
    linkedin: "https://www.linkedin.com/in/francisco-cascalheira-b898a7405/",
    github: "https://github.com/FranciscoCascalheira",
  },
  cv: "/Francisco-Cascalheira-CV.pdf",
  /** The one claim on this site no command can check.
   *
   *  Everything else here is checkable: git counts the commits, Postgres counts
   *  the positions, the council publishes its own minutes. Whether I am open to
   *  work is a fact about my intentions, and it goes false silently — on the day
   *  I accept something, not on the day I edit this file.
   *
   *  So it is dated and it expires. `verify:claims` fails once `asOf` is more
   *  than 90 days old, which is not a check that it is true — nothing can check
   *  that — but a check that somebody looked at it recently and said so again.
   *  Set `open: false` and the line stops printing. */
  availability: {
    open: true,
    asOf: "2026-07-16",
  },
} as const;

export const nav = [
  { id: "work", label: "Work", index: "01" },
  { id: "about", label: "About", index: "02" },
  { id: "stack", label: "Stack", index: "03" },
  { id: "path", label: "Path", index: "04" },
  { id: "contact", label: "Contact", index: "05" },
  { id: "appendix", label: "Appendix", index: "A." },
] as const;

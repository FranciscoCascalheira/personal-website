// Central site configuration. Single source of truth for identity + links.

export const site = {
  name: "Francisco Cascalheira",
  role: "Software Developer",
  location: "Porto, Portugal",
  locator: "PORTO · PT",
  coordinates: "41.1579° N, 8.6291° W",
  url: "https://franciscocascalheira.com",
  description:
    "Software developer building production software. Second-year Computer Engineering student at FEUP and sole developer of a recruitment platform in production for Câmara Municipal do Porto.",
  email: "francisco.cascalheira2006@gmail.com",
  socials: {
    linkedin: "https://www.linkedin.com/in/francisco-cascalheira-b898a7405/",
    github: "https://github.com/FranciscoCascalheira",
  },
  cv: "/Francisco-Cascalheira-CV.pdf",
} as const;

export const nav = [
  { id: "work", label: "Work", index: "01" },
  { id: "about", label: "About", index: "02" },
  { id: "stack", label: "Stack", index: "03" },
  { id: "path", label: "Path", index: "04" },
  { id: "contact", label: "Contact", index: "05" },
] as const;

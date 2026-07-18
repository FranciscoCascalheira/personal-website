import { Container } from "./Section";
import { Reveal } from "./Reveal";

/** Front matter. A filed record opens with its own table of contents; this
 *  mirrors the device the case study uses (an index that reads as a scale
 *  model of the document it opens), sharing the section spine's grid so the
 *  titles land on the same vertical rule as the sections below. Terse where
 *  the top nav is terse; glossed where the nav can't be — it tells a reader
 *  deciding whether to scroll what the six parts actually hold. */
const contents = [
  {
    id: "work",
    n: "01",
    label: "The evidence",
    title: "One system carries the argument.",
    gloss: "the flagship, and the exhibits beside it",
  },
  {
    id: "about",
    n: "02",
    label: "The author",
    title: "Proof has a person behind it.",
    gloss: "who is behind the work",
  },
  {
    id: "stack",
    n: "03",
    label: "Stack",
    title: "The tools I reach for.",
    gloss: "languages, backend, infra, practice",
  },
  {
    id: "path",
    n: "04",
    label: "Path",
    title: "How I got here.",
    gloss: "work, study, and the rest",
  },
  {
    id: "contact",
    n: "05",
    label: "Contact",
    title: "Let's build something.",
    gloss: "the fastest way in",
  },
  {
    id: "appendix",
    n: "A.",
    label: "Appendix",
    title: "The other system I run on.",
    gloss: "what built me — the influences",
  },
] as const;

export function Contents() {
  return (
    <nav aria-label="Contents" className="border-t border-border">
      <Container>
        <Reveal className="py-12 sm:py-16">
          <p className="mono-label">Contents</p>
          <ol className="mt-8">
            {contents.map((c) => (
              <li key={c.id}>
                <a
                  href={`#${c.id}`}
                  /* gap-x separates the numeral from the title on mobile (no
                     rule there); at lg+ it is 0 so the rule and titles land on
                     the SAME x as the section spine below (whose grid has no
                     column gap). */
                  className="group grid grid-cols-[2.5rem_minmax(0,1fr)] items-baseline gap-x-4 border-t border-border py-4 sm:gap-x-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-x-0 xl:grid-cols-[260px_minmax(0,1fr)]"
                >
                  <span className="flex items-baseline gap-3 lg:pr-10">
                    <span className="font-mono text-sm text-text-faint tabular-nums">
                      {c.n}
                    </span>
                    <span className="mono-label hidden lg:inline">
                      {c.label}
                    </span>
                  </span>
                  <span className="flex flex-wrap items-baseline gap-x-4 gap-y-1 lg:border-l lg:border-border lg:pl-12 xl:pl-16">
                    <span className="accent-underline font-serif text-lg text-text sm:text-xl">
                      {c.title}
                    </span>
                    <span className="font-mono text-[0.7rem] leading-relaxed text-text-faint">
                      {c.gloss}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </Reveal>
      </Container>
    </nav>
  );
}

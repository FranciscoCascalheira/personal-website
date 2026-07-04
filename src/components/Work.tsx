import Link from "next/link";
import { projects } from "@/lib/data";
import { Reveal } from "./Reveal";
import { Section, SectionHeading } from "./Section";
import { StatusBadge } from "./ui";

/** Exhibit A: not a card, a doorway. The case study is the product; this
 *  block states the claim's evidence and hands the reader through. */
function CaseStudyTeaser() {
  const flagship = projects[0];
  return (
    <Reveal>
      <Link
        href="/work/opportonities"
        className="group block border border-border bg-bg-elevated/40 transition-colors hover:border-border-strong"
      >
        <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="mono-label mb-4 flex items-center gap-3">
              <span className="text-accent-text">Exhibit A</span>
              <StatusBadge status={flagship.status} />
            </p>
            <h3 className="text-3xl font-medium tracking-tight text-text sm:text-4xl">
              {flagship.name}
            </h3>
            <p className="mt-2 text-lg text-text-muted">{flagship.tagline}</p>
            <p className="mt-5 max-w-xl leading-relaxed text-text-muted">
              A full engineering teardown: the 12-model schema as an explorable
              map, the application state machine, the decisions that broke and
              how they were fixed — sourced from the real repository.
            </p>
            <p className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-text">
              <span className="accent-underline">Read the case study</span>
              <span
                className="transition-transform group-hover:translate-x-0.5"
                aria-hidden
              >
                →
              </span>
            </p>
          </div>

          <ul className="grid content-start gap-px self-center border border-border bg-border sm:grid-cols-2">
            {flagship.metrics.map((m) => (
              <li key={m.label} className="bg-bg px-5 py-4">
                <span className="block text-xl font-medium text-text">
                  {m.value}
                </span>
                <span className="mt-0.5 block text-xs text-text-muted">
                  {m.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Link>
    </Reveal>
  );
}

/** Further exhibits: a terse index, not a card grid. Depth lives in
 *  Exhibit A; these rows state what shipped and step aside. */
function ExhibitIndex() {
  const rest = projects.slice(1);
  return (
    <div className="border border-border">
      {rest.map((p, i) => (
        <Reveal
          key={p.slug}
          delay={i * 60}
          className={`grid gap-2 px-6 py-5 sm:grid-cols-[84px_1.1fr_1.6fr_auto] sm:items-baseline sm:gap-6 ${
            i > 0 ? "border-t border-border" : ""
          }`}
        >
          <span className="mono-label">{`Exhibit ${"BCD"[i] ?? ""}`}</span>
          <div>
            <h3 className="text-base font-medium text-text">{p.name}</h3>
            <p className="mono-label mt-1">{p.role}</p>
          </div>
          <p className="text-sm leading-relaxed text-text-muted">
            {p.tagline}. {p.contributions[0]}
          </p>
          <span className="mono-label sm:text-right">
            {p.year} · {p.status}
          </span>
        </Reveal>
      ))}
    </div>
  );
}

export function Work() {
  return (
    <Section id="work">
      <SectionHeading
        index="01"
        label="The evidence"
        title="One system carries the argument."
      >
        Real systems with real users. The flagship gets the depth it earned;
        the rest is stated briefly and honestly.
      </SectionHeading>

      <div className="space-y-6">
        <CaseStudyTeaser />
        <ExhibitIndex />
      </div>
    </Section>
  );
}

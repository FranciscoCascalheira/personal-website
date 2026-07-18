import Link from "next/link";
import { projects, statusLegend, type Project } from "@/lib/data";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

/** Exhibit letter from a project's place in the record: A is the flagship,
 *  B the second case study, C onward the ledger. Kept off the render index so
 *  splitting the projects across three tiers can't renumber them. */
const letter = (p: Project) => String.fromCharCode(65 + projects.indexOf(p));

/** Exhibit A is the one structural deployment of the accent: a full amber
 *  field, ink on it, ruled like the rest of the record. Not a card — a
 *  plate bound into the document. The single loud moment. */
function CaseStudyTeaser({ project }: { project: Project }) {
  return (
    <Reveal>
      <Link
        href={project.caseStudyHref ?? "#"}
        className="group block bg-field text-field-ink"
      >
        <div className="p-6 sm:p-10">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em]">
              Exhibit {letter(project)}
            </p>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em]">
              {project.status}
            </p>
          </div>

          <h3 className="mt-6 font-serif text-[clamp(2.4rem,4.5vw,4.25rem)] leading-[0.95] tracking-[-0.01em] text-field-ink">
            {project.name}
          </h3>
          <p className="mt-3 max-w-xl text-lg leading-relaxed text-field-ink-muted">
            {project.tagline}. A full engineering teardown: the 12-model
            schema as an explorable map, the application state machine, the
            decisions that broke and how they were fixed — sourced from the
            real repository.
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-y-6 border-t border-field-rule pt-6 sm:grid-cols-4">
            {project.metrics.map((m, i) => (
              <div
                key={m.label}
                className={i > 0 ? "sm:border-l sm:border-field-rule sm:pl-6" : ""}
              >
                <dt className="font-serif text-3xl leading-none sm:text-4xl">
                  {m.value}
                </dt>
                <dd className="mt-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-field-ink-muted">
                  {m.label}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-8 inline-flex items-center gap-2 border-t-2 border-field-ink pt-3 text-sm font-medium">
            Read the case study
            <span
              className="transition-transform group-hover:translate-x-0.5"
              aria-hidden
            >
              →
            </span>
          </p>
        </div>
      </Link>
    </Reveal>
  );
}

/** The second case study: a full exhibit, but ink-on-paper, not the flooded
 *  field. Rules and space give it weight — the metric row is the presence —
 *  without a second amber moment or a bordered card. It sits a clear step
 *  below Exhibit A and a clear step above the ledger. */
function SecondaryCase({ project, blurb }: { project: Project; blurb: string }) {
  return (
    <Reveal>
      <Link
        href={project.caseStudyHref ?? "#"}
        className="group block border-t-2 border-border-strong pt-7"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="mono-label">Exhibit {letter(project)}</p>
          <p className="mono-label">
            {project.year} · {project.status}
          </p>
        </div>

        <h3 className="mt-5 font-serif text-[clamp(2rem,3.6vw,2.9rem)] leading-[0.98] tracking-[-0.01em] text-text">
          {project.name}
        </h3>
        <p className="mono-label mt-2">{project.role}</p>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-text-muted">
          {blurb}
        </p>

        <dl className="mt-7 grid grid-cols-3 gap-x-5 border-t border-border pt-5 sm:gap-x-8">
          {project.metrics.map((m, i) => (
            <div
              key={m.label}
              className={i > 0 ? "border-l border-border pl-5 sm:pl-8" : ""}
            >
              <dt className="font-serif text-2xl leading-none text-text sm:text-3xl">
                {m.value}
              </dt>
              <dd className="mono-label mt-2">{m.label}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-7 inline-flex items-center gap-2 border-t-2 border-text pt-3 text-sm font-medium text-text">
          Read the case study
          <span
            className="transition-transform group-hover:translate-x-0.5"
            aria-hidden
          >
            →
          </span>
        </p>
      </Link>
    </Reveal>
  );
}

/** The remaining exhibits: a ruled ledger, not a card grid. Depth lives in the
 *  case studies above; these rows state what shipped and step aside. */
function ExhibitIndex({ items }: { items: Project[] }) {
  return (
    <div>
      {items.map((p, i) => (
        <Reveal
          key={p.slug}
          delay={i * 60}
          /* The status column is pinned, not `auto`. Each row is its own grid
             container (Reveal wraps it to stagger the entrance), so an `auto`
             track sized itself to its own row's text and no two rows shared a
             column position. A ledger's entire claim is that it is a table. */
          className="grid gap-2 border-t border-border py-6 sm:grid-cols-[90px_1.1fr_1.6fr_12rem] sm:items-baseline sm:gap-6"
        >
          <span className="mono-label">Exhibit {letter(p)}</span>
          <div>
            <h3 className="text-base font-medium text-text">
              {p.caseStudyHref ? (
                <Link href={p.caseStudyHref} className="accent-underline text-text">
                  {p.name}
                </Link>
              ) : (
                p.name
              )}
            </h3>
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
      <Rule />
      {/* A ledger states its units. Three status words that read like a ladder
          and define nothing are decoration; these are the definitions. The
          term stays mono (the data token); the gloss is a sentence, so sans. */}
      <dl className="mt-3 flex flex-col gap-1 text-[0.8rem] leading-relaxed text-text-faint sm:flex-row sm:flex-wrap sm:gap-x-5">
        {statusLegend.map((s) => (
          <div key={s.term} className="flex items-baseline gap-2">
            <dt className="mono-label whitespace-nowrap">{s.term}</dt>
            <dd className="text-text-muted">{s.gloss}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Rule() {
  return <div aria-hidden className="h-px w-full bg-border" />;
}

/** The one-line pitch for a secondary case study — kept out of the ledger's
 *  metric row so it sells the story instead of repeating the numbers. */
const blurbs: Record<string, string> = {
  unispot:
    "A staffing console that ran the bars at NOS Alive 2026 for FR Eventos — live, from a container behind the main stage. A full teardown: the 18-model schema, the shift lifecycle, and the idempotent console that outlasted a festival's network.",
};

export function Work() {
  const flagship = projects.find((p) => p.flagship) ?? projects[0];
  const secondary = projects.filter((p) => p.caseStudyHref && !p.flagship);
  const ledger = projects.filter((p) => !p.flagship && !p.caseStudyHref);

  return (
    <Section
      id="work"
      index="01"
      label="The evidence"
      title="One system carries the argument."
      lede="Real systems with real users. The flagship gets the depth it earned; the second, a case study of its own; the rest is stated briefly and honestly."
    >
      <div className="space-y-10">
        <CaseStudyTeaser project={flagship} />
        {secondary.map((p) => (
          <SecondaryCase key={p.slug} project={p} blurb={blurbs[p.slug] ?? p.tagline} />
        ))}
        <ExhibitIndex items={ledger} />
      </div>
    </Section>
  );
}

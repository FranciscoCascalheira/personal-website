import Link from "next/link";
import { projects } from "@/lib/data";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

/** Exhibit A is the one structural deployment of the accent: a full amber
 *  field, ink on it, ruled like the rest of the record. Not a card — a
 *  plate bound into the document. */
function CaseStudyTeaser() {
  const flagship = projects[0];
  return (
    <Reveal>
      <Link
        href="/work/opportonities"
        className="group block bg-field text-field-ink"
      >
        <div className="p-6 sm:p-10">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em]">
              Exhibit A
            </p>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em]">
              {flagship.status}
            </p>
          </div>

          <h3 className="mt-6 text-[clamp(1.9rem,3.4vw,3rem)] font-medium leading-[1] tracking-[-0.03em] text-field-ink">
            {flagship.name}
          </h3>
          <p className="mt-3 max-w-xl text-lg leading-relaxed text-field-ink-muted">
            {flagship.tagline}. A full engineering teardown: the 12-model
            schema as an explorable map, the application state machine, the
            decisions that broke and how they were fixed — sourced from the
            real repository.
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-y-6 border-t border-field-rule pt-6 sm:grid-cols-4">
            {flagship.metrics.map((m, i) => (
              <div
                key={m.label}
                className={i > 0 ? "sm:border-l sm:border-field-rule sm:pl-6" : ""}
              >
                <dt className="text-3xl font-medium leading-none tracking-tight tabular-nums">
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

/** Further exhibits: a ruled ledger, not a card grid. Depth lives in
 *  Exhibit A; these rows state what shipped and step aside. */
function ExhibitIndex() {
  const rest = projects.slice(1);
  return (
    <div>
      {rest.map((p, i) => (
        <Reveal
          key={p.slug}
          delay={i * 60}
          className="grid gap-2 border-t border-border py-6 sm:grid-cols-[90px_1.1fr_1.6fr_auto] sm:items-baseline sm:gap-6"
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
      <Rule />
    </div>
  );
}

function Rule() {
  return <div aria-hidden className="h-px w-full bg-border" />;
}

export function Work() {
  return (
    <Section
      id="work"
      index="01"
      label="The evidence"
      title="One system carries the argument."
      lede="Real systems with real users. The flagship gets the depth it earned; the rest is stated briefly and honestly."
    >
      <div className="space-y-10">
        <CaseStudyTeaser />
        <ExhibitIndex />
      </div>
    </Section>
  );
}

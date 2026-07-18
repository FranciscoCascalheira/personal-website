import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Container } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { SchemaExplorer } from "@/components/case/SchemaExplorer";
import { Lifecycle } from "@/components/case/Lifecycle";
import { ConsoleBatch } from "@/components/case/ConsoleBatch";
import { NosAlivePlate } from "@/components/case/NosAlivePlate";
import {
  caseMeta,
  abstract,
  problem,
  constraints,
  schemaModels,
  domains,
  lifecycle,
  decisions,
  whatBroke,
  outcome,
  publicRecord,
} from "@/lib/case-study-unispot";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "UniSpot — an engineering case study",
  description:
    "How a staffing console — built lead-developer with two colleagues — ran the bars at NOS Alive 2026 for FR Eventos: the 18-model schema, the shift lifecycle, the idempotent console that survived a festival's network, and what broke.",
};

/** A numbered section of the record: ghost folio numeral and mono label in
 *  the margin, serif title and content hanging off the vertical rule. Same
 *  component as the opPORTOnities case study. */
function DocSection({
  id,
  n,
  label,
  title,
  children,
}: {
  id?: string;
  n: string;
  label: string;
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-border">
      <Container>
        <div className="grid gap-y-8 py-14 sm:py-20 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-y-0 xl:grid-cols-[260px_minmax(0,1fr)]">
          <Reveal
            as="aside"
            className="flex items-baseline gap-4 lg:sticky lg:top-24 lg:block lg:self-start lg:pr-10"
          >
            <p className="folio" aria-hidden data-folio={n} />
            <p className="mono-label lg:mt-5">{label}</p>
          </Reveal>
          <div className="min-w-0 lg:border-l lg:border-border lg:pl-12 xl:pl-16">
            <Reveal>
              <h2 className="display text-[clamp(1.9rem,3.4vw,3.1rem)]">
                {title}
              </h2>
            </Reveal>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/** Front matter: the seven-part shape, so a reader knows the argument is finite
 *  and where it ends. Same spine as the sections below. */
const contents = [
  { id: "abstract", n: "00", label: "Abstract", title: "What this document claims.", gloss: "the claim, and the four numbers under it" },
  { id: "problem", n: "01", label: "The problem", title: "What a festival floor needs.", gloss: "sign-in sheets, WhatsApp, a spreadsheet" },
  { id: "constraints", n: "02", label: "Constraints", title: "The rules of the job.", gloss: "a dropping network, nights past midnight, one shared database" },
  { id: "system", n: "03", label: "The system", title: "Eighteen models, one console.", gloss: "the schema, and the shift lifecycle" },
  { id: "decisions", n: "04", label: "Decisions", title: "What held.", gloss: "four that held, each with its commit" },
  { id: "broke", n: "05", label: "What broke", title: "What broke.", gloss: "three tenant leaks, a race, and the kiosk I deleted" },
  { id: "outcome", n: "06", label: "Outcome", title: "Where it stands today.", gloss: "a live pilot, corroborated by the festival's own map" },
] as const;

export default function UniSpotCaseStudyPage() {
  return (
    <>
      {/* slim document header */}
      <header className="no-print fixed inset-x-0 top-0 z-40 border-b border-border bg-bg">
        <Container className="flex h-14 items-center justify-between">
          <Link href="/" className="link-quiet font-mono text-xs">
            ← Francisco Cascalheira
          </Link>
          <div className="flex items-center gap-4">
            <span className="mono-label hidden sm:block">{caseMeta.docId}</span>
            <ThemeToggle />
          </div>
        </Container>
      </header>

      <main className="pt-14">
        {/* document title block — the plate cover */}
        <section className="border-b border-border py-16 sm:py-24">
          <Container>
            <Reveal immediate>
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <p className="mono-label">Case study · {caseMeta.event}</p>
                <p className="stamp">{caseMeta.status}</p>
              </div>
              <h1 className="line-mask mt-10">
                <span className="line-inner display text-[clamp(3rem,9vw,8.5rem)]">
                  {caseMeta.title}
                </span>
              </h1>
              <p className="mt-6 max-w-2xl font-serif text-2xl italic leading-snug text-text sm:text-3xl">
                {abstract.claim}
              </p>
            </Reveal>

            <Reveal delay={120} immediate>
              <dl className="mt-14">
                {[
                  { k: "Client", v: caseMeta.client },
                  { k: "Event", v: caseMeta.event },
                  { k: "Role", v: caseMeta.role },
                  { k: "Stack", v: caseMeta.stack },
                  {
                    k: "Public record",
                    /* The provenance row. The festival's own site map is FR
                       Eventos' working copy, not a public URL, so it is not cited
                       here as if a reader could pull it — it is fig. 0. What a
                       reader can check is who FR Eventos is and that the festival
                       ran on these dates. */
                    v: (
                      <ul className="space-y-1.5">
                        {publicRecord.map((r) => (
                          <li key={r.id}>
                            <a
                              href={r.url}
                              target="_blank"
                              rel="noreferrer"
                              className="accent-underline text-text"
                            >
                              {r.cite}
                              <span className="ml-1 text-text-faint" aria-hidden>
                                ↗
                              </span>
                            </a>
                            <span className="mt-0.5 block font-mono text-[0.68rem] leading-relaxed text-text-faint">
                              {r.attests}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ),
                  },
                ].map((row) => (
                  <div
                    key={row.k}
                    className={`grid items-baseline gap-x-4 border-t border-border py-3 text-sm sm:grid-cols-[140px_1fr] ${
                      row.k === "Public record"
                        ? "gap-y-2 sm:gap-y-0"
                        : "grid-cols-[110px_1fr]"
                    }`}
                  >
                    <dt className="mono-label">{row.k}</dt>
                    <dd className="text-text">{row.v}</dd>
                  </div>
                ))}
                <div aria-hidden className="h-px w-full bg-border" />
              </dl>
            </Reveal>
          </Container>
        </section>

        {/* fig. 0 — the engraved site, the cover plate. Full container width, the
            signature figure, sat where the reader meets the claim. */}
        <section className="border-b border-border">
          <Container>
            <Reveal className="py-12 sm:py-16">
              <p className="mono-label mb-6">
                fig. 0 · the site, and who ran it
              </p>
              <NosAlivePlate />
            </Reveal>
          </Container>
        </section>

        {/* contents — front matter navigation on the section spine */}
        <nav aria-label="Contents" className="border-b border-border">
          <Container>
            <Reveal className="py-12 sm:py-16">
              <p className="mono-label">Contents</p>
              <ol className="mt-8">
                {contents.map((c) => (
                  <li key={c.id}>
                    <a
                      href={`#${c.id}`}
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

        {/* 00 — abstract */}
        <DocSection id="abstract" n="00" label="Abstract" title="What this document claims.">
          <Reveal>
            <p className="measure text-lg leading-relaxed text-text-muted">
              {abstract.body}
            </p>
          </Reveal>
          <Reveal delay={100}>
            <dl className="mt-10 grid grid-cols-2 gap-y-8 border-t border-border-strong pt-6 lg:grid-cols-4">
              {abstract.metrics.map((m, i) => (
                <div
                  key={m.label}
                  className={i > 0 ? "lg:border-l lg:border-border lg:pl-8" : ""}
                >
                  <dt className="font-serif text-4xl leading-none text-text sm:text-5xl">
                    {m.value}
                  </dt>
                  <dd className="mono-label mt-3">{m.label}</dd>
                  {"footnote" in m && m.footnote ? (
                    <dd className="mt-1 font-mono text-[0.68rem] leading-relaxed text-text-faint">
                      {m.footnote}
                    </dd>
                  ) : null}
                  {"record" in m && m.record ? (
                    <dd className="mt-1 text-xs">
                      {publicRecord
                        .filter((r) => r.id === m.record)
                        .map((r) => (
                          <a
                            key={r.id}
                            href={r.url}
                            target="_blank"
                            rel="noreferrer"
                            className="link-quiet"
                          >
                            {r.cite}
                            <span className="ml-1 text-text-faint" aria-hidden>
                              ↗
                            </span>
                          </a>
                        ))}
                    </dd>
                  ) : null}
                </div>
              ))}
            </dl>
          </Reveal>
        </DocSection>

        {/* 01 — problem */}
        <DocSection id="problem" n="01" label="The problem" title="What a festival floor needs.">
          <Reveal>
            <div className="measure space-y-5 text-lg leading-relaxed text-text-muted">
              {problem.paragraphs.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </Reveal>
        </DocSection>

        {/* 02 — constraints */}
        <DocSection id="constraints" n="02" label="Constraints" title="The rules of the job.">
          <div className="grid gap-x-12 sm:grid-cols-2">
            {constraints.map((c, i) => (
              <Reveal
                key={c.k}
                delay={i * 60}
                className="border-t border-border py-6"
              >
                <h3 className="text-base font-medium text-text">{c.k}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  {c.v}
                </p>
              </Reveal>
            ))}
          </div>
        </DocSection>

        {/* 03 — the system */}
        <DocSection id="system" n="03" label="The system" title="Eighteen models, one console.">
          <Reveal>
            <p className="measure text-lg leading-relaxed text-text-muted">
              The platform stands on eighteen Prisma models over PostgreSQL. This
              is the real schema, sanitised to shapes — click a model, or walk it
              with the arrow keys.
            </p>
          </Reveal>
          <Reveal delay={100} className="mt-10">
            <SchemaExplorer
              models={schemaModels}
              domains={domains}
              initialId="shift"
              caption="fig. 1 — 18 relational models · lead developer, with two colleagues · ran live at NOS Alive 2026"
            />
          </Reveal>

          <Reveal className="mt-16">
            <p className="measure text-lg leading-relaxed text-text-muted">
              A shift is the contested object: it is planned against a bar, filled
              by whoever turns up, corrected when they punch in wrong, and finally
              billed. Its life is an explicit sequence — actuals from clock
              punches, dated by the operational day, and made final by a human.
            </p>
          </Reveal>
          <Reveal delay={100} className="mt-10">
            <Lifecycle lifecycle={lifecycle} />
          </Reveal>
        </DocSection>

        {/* 04 — what held */}
        <DocSection id="decisions" n="04" label="Decisions" title="What held.">
          <div className="measure space-y-12">
            {decisions.map((d, i) => (
              <Reveal key={d.index} delay={i * 40}>
                <article className="border-t border-border pt-6">
                  <h3 className="flex items-baseline gap-3 text-xl font-medium text-text">
                    <span className="font-mono text-sm text-accent-text">
                      {d.index}
                    </span>
                    {d.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-text-muted">
                    {d.body}
                  </p>
                  <p className="mono-label mt-3">commit: “{d.evidence}”</p>
                </article>
              </Reveal>
            ))}
          </div>
        </DocSection>

        {/* 05 — what broke: the honest ledger, ending in fig. 4 */}
        <DocSection id="broke" n="05" label="What broke" title="What broke.">
          <Reveal>
            <p className="measure text-lg leading-relaxed text-text-muted">
              A live festival is an honest test. Here is what broke — some of it
              days before the gates opened, some of it my own good code that
              turned out to be the wrong thing to keep.
            </p>
          </Reveal>
          <Reveal className="mt-10">
            <div className="measure space-y-12">
              {whatBroke.map((e) => (
                <article key={e.index} className="border-t border-border pt-6">
                  <h3 className="flex items-baseline gap-3 text-xl font-medium text-text">
                    <span className="font-mono text-sm text-accent-text">
                      {e.index}
                    </span>
                    {e.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-text-muted">
                    <span className="mono-label mr-2">Was</span>
                    {e.was}
                  </p>
                  <p className="mt-2 leading-relaxed text-text-muted">
                    <span className="mono-label mr-2">Now</span>
                    {e.now}
                  </p>
                </article>
              ))}
            </div>
          </Reveal>

          {/* fig. 4 — the console batch made playable */}
          <Reveal className="mt-16">
            <p className="measure text-lg leading-relaxed text-text-muted">
              The first of those — the idempotent console — is the engine that
              actually carried the festival. It is worth seeing run. The lever is
              the only variable: whether a batch key was written before the work.
            </p>
          </Reveal>
          <Reveal delay={100} className="mt-10">
            <ConsoleBatch />
          </Reveal>
        </DocSection>

        {/* 06 — outcome */}
        <DocSection id="outcome" n="06" label="Outcome" title="Where it stands today.">
          <Reveal>
            <div className="measure space-y-5 text-lg leading-relaxed text-text-muted">
              {outcome.paragraphs.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </Reveal>
        </DocSection>

        {/* end of document */}
        <section className="border-t border-border py-16 sm:py-20">
          <Container className="flex flex-wrap items-end justify-between gap-8">
            <div>
              <p className="mono-label mb-4">End of case study</p>
              <a
                href={`mailto:${site.email}`}
                className="accent-underline break-all font-serif text-2xl text-text sm:text-4xl"
              >
                {site.email}
              </a>
            </div>
            <Link href="/" className="link-quiet font-mono text-xs">
              ← Back to the index
            </Link>
          </Container>
        </section>
      </main>
    </>
  );
}

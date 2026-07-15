import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Container } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { SchemaExplorer } from "@/components/case/SchemaExplorer";
import { Lifecycle } from "@/components/case/Lifecycle";
import { AuditLedger } from "@/components/case/AuditLedger";
import { RaceCondition } from "@/components/case/RaceCondition";
import { auditExhibits } from "@/lib/audit";
import { raceIntro } from "@/lib/race";
import {
  caseMeta,
  abstract,
  problem,
  constraints,
  decisions,
  outcome,
} from "@/lib/case-study";
import { getProductionStatus } from "@/lib/proof";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "opPORTOnities — an engineering case study",
  description:
    "How a second-year student built, alone, the recruitment platform behind Câmara Municipal do Porto's summer-internship programme: the 12-model schema, the application state machine, the decisions and what broke.",
};

/** A numbered section of the record: ghost folio numeral and mono label in
 *  the margin, serif title and content hanging off the vertical rule. */
function DocSection({
  n,
  label,
  title,
  children,
}: {
  n: string;
  label: string;
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-border">
      <Container>
        <div className="grid gap-y-8 py-14 sm:py-20 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-y-0 xl:grid-cols-[260px_minmax(0,1fr)]">
          <Reveal
            as="aside"
            className="flex items-baseline gap-4 lg:sticky lg:top-24 lg:block lg:self-start lg:pr-10"
          >
            <p className="folio" aria-hidden>
              {n}
            </p>
            <p className="mono-label lg:mt-5">{label}</p>
          </Reveal>
          <div className="lg:border-l lg:border-border lg:pl-12 xl:pl-16">
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

export default async function CaseStudyPage() {
  const status = await getProductionStatus();

  const checkedAt = status
    ? new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
      }).format(new Date(status.checkedAt))
    : null;

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
            <Reveal>
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <p className="mono-label">Case study · {caseMeta.period}</p>
                <p className="stamp">
                  {status ? (
                    <>
                      <span
                        className="size-1.5 rounded-full bg-positive"
                        aria-hidden
                      />
                      In production · API responding
                      {checkedAt ? ` · ${checkedAt} UTC` : null}
                    </>
                  ) : (
                    caseMeta.status
                  )}
                </p>
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

            <Reveal delay={120}>
              <dl className="mt-14">
                {[
                  { k: "Client", v: caseMeta.client },
                  { k: "Programme", v: caseMeta.programme },
                  { k: "Role", v: caseMeta.role },
                  { k: "Stack", v: caseMeta.stack },
                ].map((row) => (
                  <div
                    key={row.k}
                    className="grid grid-cols-[110px_1fr] items-baseline gap-4 border-t border-border py-3 text-sm sm:grid-cols-[140px_1fr]"
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

        {/* 00 — abstract */}
        <DocSection n="00" label="Abstract" title="What this document claims.">
          <Reveal>
            <p className="max-w-3xl text-lg leading-relaxed text-text-muted">
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
                    <dd className="mt-1 text-xs text-text-faint">
                      {m.footnote}
                    </dd>
                  ) : null}
                </div>
              ))}
            </dl>
          </Reveal>
        </DocSection>

        {/* 01 — problem */}
        <DocSection n="01" label="The problem" title="What the city needed.">
          <Reveal>
            <div className="max-w-3xl space-y-5 text-lg leading-relaxed text-text-muted">
              {problem.paragraphs.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </Reveal>
        </DocSection>

        {/* 02 — constraints */}
        <DocSection n="02" label="Constraints" title="The rules of the job.">
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
        <DocSection n="03" label="The system" title="Twelve models, one machine.">
          <Reveal>
            <p className="max-w-3xl text-lg leading-relaxed text-text-muted">
              The whole platform stands on twelve Prisma models over
              PostgreSQL. This is the real schema, sanitised to shapes — click
              a model, or walk it with the arrow keys.
            </p>
          </Reveal>
          <Reveal delay={100} className="mt-10">
            <SchemaExplorer />
          </Reveal>

          <Reveal className="mt-16">
            <p className="max-w-3xl text-lg leading-relaxed text-text-muted">
              An application is the contested object: companies compete for
              candidates, candidates weigh offers, and the council supervises
              all of it. Its lifecycle is an explicit state machine — every
              transition timestamped, every selection given a deadline.
            </p>
          </Reveal>
          <Reveal delay={100} className="mt-10">
            <Lifecycle />
          </Reveal>
        </DocSection>

        {/* 04 — decisions & what broke */}
        <DocSection
          n="04"
          label="Decisions"
          title="What broke, and what held."
        >
          <div className="max-w-3xl space-y-12">
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

          {/* fig. 3 — the audit, audited */}
          <Reveal className="mt-16">
            <p className="max-w-3xl text-lg leading-relaxed text-text-muted">
              Before the largest release I audited the whole platform myself,
              because nobody else was going to. It landed as one commit. Here
              is what was actually in it — recounted from the diff, including
              where the recount disagrees with what I wrote at the time.
            </p>
          </Reveal>
          <Reveal delay={100} className="mt-10">
            <AuditLedger />
          </Reveal>

          <Reveal className="mt-16">
            <div className="max-w-3xl space-y-12">
              {auditExhibits.map((e) => (
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

          {/* fig. 4 — exhibit 3.4, made playable */}
          <Reveal className="mt-16">
            <p className="max-w-3xl text-lg leading-relaxed text-text-muted">
              {raceIntro}
            </p>
          </Reveal>
          <Reveal delay={100} className="mt-10">
            <RaceCondition />
          </Reveal>
        </DocSection>

        {/* 05 — outcome */}
        <DocSection n="05" label="Outcome" title="Where it stands today.">
          <Reveal>
            <div className="max-w-3xl space-y-5 text-lg leading-relaxed text-text-muted">
              {outcome.paragraphs.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </Reveal>
          {status ? (
            <Reveal delay={80}>
              <p className="mono-label mt-8 flex items-center gap-2">
                <span
                  className="size-1.5 rounded-full bg-positive"
                  aria-hidden
                />
                Production API responding at time of render · checked{" "}
                {checkedAt} UTC · refreshed every 5 minutes
              </p>
            </Reveal>
          ) : null}
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

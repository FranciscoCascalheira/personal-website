import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Container } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { SchemaExplorer } from "@/components/case/SchemaExplorer";
import { Lifecycle } from "@/components/case/Lifecycle";
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

/** Numbered document section: mono index + label above, hairline underneath. */
function DocSection({
  n,
  label,
  children,
}: {
  n: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-border py-14 sm:py-20">
      <Container>
        <Reveal>
          <h2 className="mono-label mb-8 flex items-center gap-2">
            <span className="text-accent-text">{n}</span>
            <span className="h-px w-6 bg-border-strong" aria-hidden />
            {label}
          </h2>
        </Reveal>
        {children}
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
      <header className="fixed inset-x-0 top-0 z-40 border-b border-border bg-bg/85 backdrop-blur-sm">
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
        {/* document title block */}
        <section className="border-b border-border py-16 sm:py-24">
          <Container>
            <Reveal>
              <p className="mono-label mb-6">
                Case study · {caseMeta.period}
              </p>
              <h1 className="max-w-3xl text-4xl font-medium leading-[1.05] tracking-[-0.03em] sm:text-6xl">
                {caseMeta.title}
              </h1>
              <p className="mt-5 max-w-2xl font-serif text-2xl italic leading-snug text-text sm:text-3xl">
                {abstract.claim}
              </p>
            </Reveal>

            <Reveal delay={120}>
              <dl className="mt-12 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { k: "Client", v: caseMeta.client },
                  { k: "Programme", v: caseMeta.programme },
                  { k: "Role", v: caseMeta.role },
                  {
                    k: "Status",
                    v: status ? (
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="size-1.5 rounded-full bg-positive"
                          aria-hidden
                        />
                        In production — API responding, checked {checkedAt} UTC
                      </span>
                    ) : (
                      caseMeta.status
                    ),
                  },
                ].map((row) => (
                  <div key={row.k} className="bg-bg px-5 py-4">
                    <dt className="mono-label mb-1.5">{row.k}</dt>
                    <dd className="text-sm text-text">{row.v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mono-label mt-3">{caseMeta.stack}</p>
            </Reveal>
          </Container>
        </section>

        {/* 00 — abstract */}
        <DocSection n="00" label="Abstract">
          <Reveal>
            <p className="max-w-3xl text-lg leading-relaxed text-text-muted">
              {abstract.body}
            </p>
          </Reveal>
          <Reveal delay={100}>
            <ul className="mt-10 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
              {abstract.metrics.map((m) => (
                <li key={m.label} className="bg-bg px-5 py-5">
                  <span className="block text-2xl font-medium text-text">
                    {m.value}
                  </span>
                  <span className="mt-1 block text-sm text-text-muted">
                    {m.label}
                  </span>
                  {"footnote" in m && m.footnote ? (
                    <span className="mono-label mt-2 block">{m.footnote}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </Reveal>
        </DocSection>

        {/* 01 — problem */}
        <DocSection n="01" label="The problem">
          <Reveal>
            <div className="max-w-3xl space-y-5 text-lg leading-relaxed text-text-muted">
              {problem.paragraphs.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </Reveal>
        </DocSection>

        {/* 02 — constraints */}
        <DocSection n="02" label="Constraints">
          <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2">
            {constraints.map((c, i) => (
              <Reveal key={c.k} delay={i * 60} className="bg-bg p-6 sm:p-7">
                <h3 className="text-base font-medium text-text">{c.k}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  {c.v}
                </p>
              </Reveal>
            ))}
          </div>
        </DocSection>

        {/* 03 — the system */}
        <DocSection n="03" label="The system">
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
        <DocSection n="04" label="Decisions & what broke">
          <div className="max-w-3xl space-y-12">
            {decisions.map((d, i) => (
              <Reveal key={d.index} delay={i * 40}>
                <article>
                  <h3 className="flex items-baseline gap-3 text-xl font-medium text-text">
                    <span className="font-mono text-sm text-accent-text">
                      {d.index}
                    </span>
                    {d.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-text-muted">
                    {d.body}
                  </p>
                  <p className="mono-label mt-3">
                    commit: “{d.evidence}”
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </DocSection>

        {/* 05 — outcome */}
        <DocSection n="05" label="Outcome">
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
                <span className="size-1.5 rounded-full bg-positive" aria-hidden />
                Production API responding at time of render · checked{" "}
                {checkedAt} UTC · refreshed every 5 minutes
              </p>
            </Reveal>
          ) : null}
        </DocSection>

        {/* end of document */}
        <section className="border-t border-border py-16 sm:py-20">
          <Container className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="mono-label mb-3">End of case study</p>
              <a
                href={`mailto:${site.email}`}
                className="accent-underline break-all text-lg font-medium text-text sm:text-2xl"
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

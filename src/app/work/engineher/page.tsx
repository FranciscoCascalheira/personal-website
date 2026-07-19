import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Container } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { SchemaExplorer } from "@/components/case/SchemaExplorer";
import { Lifecycle } from "@/components/case/Lifecycle";
import { TeamPlate } from "@/components/case/TeamPlate";
import { TeamCadence } from "@/components/case/TeamCadence";
import { RubricBreakdown } from "@/components/case/RubricBreakdown";
import {
  caseMeta,
  assessment,
  abstract,
  problem,
  constraints,
  schemaModels,
  domains,
  lifecycle,
  teamwork,
  outcome,
} from "@/lib/case-study-engineher";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "EngineHER — an engineering case study",
  description:
    "How a five-person team built a mentorship app for engineering students across three Agile sprints to four releases — the commit split, the review pattern, the CI gate, and what the course's own rubric said about it.",
};

/** A numbered section of the record: ghost folio numeral and mono label in
 *  the margin, serif title and content hanging off the vertical rule. Same
 *  component as the other two case studies. */
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

/** Front matter: the seven-part shape, so a reader knows the argument is
 *  finite and where it ends. Same spine as the sections below. */
const contents = [
  { id: "abstract", n: "00", label: "Abstract", title: "What this document claims.", gloss: "the claim, and the four numbers under it" },
  { id: "problem", n: "01", label: "The problem", title: "What a mentorship gap needs.", gloss: "who a student pictures, and who she can ask" },
  { id: "constraints", n: "02", label: "Constraints", title: "The rules of the job.", gloss: "a fixed academic clock, five people, one codebase" },
  { id: "system", n: "03", label: "The system", title: "Five models, one mentorship.", gloss: "the schema, and the request lifecycle" },
  { id: "teamwork", n: "04", label: "The team", title: "How five people worked.", gloss: "the commit split, the reviews, the cadence, the CI gate" },
  { id: "assessment", n: "05", label: "The evaluation", title: "What the rubric said.", gloss: "the course's own grade for team 4.3" },
  { id: "outcome", n: "06", label: "Outcome", title: "Where it stands today.", gloss: "delivered, accepted, and my part in it" },
] as const;

export default function EngineHERCaseStudyPage() {
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
                <p className="mono-label">Case study · {caseMeta.course}</p>
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
                  { k: "Team", v: caseMeta.team },
                  { k: "Course", v: caseMeta.course },
                  { k: "Role", v: caseMeta.role },
                  { k: "Stack", v: caseMeta.stack },
                  {
                    k: "Assessed by",
                    /* Not a public-record link — the other two case studies
                       cite documents a reader can pull themselves; this is a
                       private course rubric, said so plainly rather than
                       dressed up as something it isn't. */
                    v: (
                      <div>
                        <p className="text-text">{assessment.cite}</p>
                        <p className="mt-0.5 font-mono text-[0.68rem] leading-relaxed text-text-faint">
                          {assessment.note}
                        </p>
                      </div>
                    ),
                  },
                ].map((row) => (
                  <div
                    key={row.k}
                    className="grid grid-cols-[110px_1fr] items-baseline gap-x-4 gap-y-1 border-t border-border py-3 text-sm sm:grid-cols-[140px_1fr]"
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

        {/* fig. 0 — the team, the cover plate */}
        <section className="border-b border-border">
          <Container>
            <Reveal className="py-12 sm:py-16">
              <p className="mono-label mb-6">fig. 0 · five people, one team</p>
              <TeamPlate />
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
                </div>
              ))}
            </dl>
          </Reveal>
        </DocSection>

        {/* 01 — problem */}
        <DocSection id="problem" n="01" label="The problem" title="What a mentorship gap needs.">
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
        <DocSection id="system" n="03" label="The system" title="Five models, one mentorship.">
          <Reveal>
            <p className="measure text-lg leading-relaxed text-text-muted">
              The app stands on five Firestore collections. This is the real
              schema, sanitised to shapes — click a model, or walk it with
              the arrow keys.
            </p>
          </Reveal>
          <Reveal delay={100} className="mt-10">
            <SchemaExplorer
              models={schemaModels}
              domains={domains}
              initialId="mentorshipRequest"
              caption="fig. 1 — 5 Firestore collections · team of five · delivered for FEUP's ESOF course"
            />
          </Reveal>

          <Reveal className="mt-16">
            <p className="measure text-lg leading-relaxed text-text-muted">
              A mentorship request is the app&apos;s central object: sent by a
              mentee, answered by a mentor, and — once accepted — the door
              into a chat thread between the two.
            </p>
          </Reveal>
          <Reveal delay={100} className="mt-10">
            <Lifecycle lifecycle={lifecycle} />
          </Reveal>
        </DocSection>

        {/* 04 — how the team worked */}
        <DocSection id="teamwork" n="04" label="The team" title="How five people worked.">
          <Reveal>
            <p className="measure text-lg leading-relaxed text-text-muted">
              The product here is unremarkable by design — a course project,
              built to spec, in three months. What is worth reading is the
              process: four independent signals, each checkable against the
              repository or the course&apos;s own record.
            </p>
          </Reveal>
          <Reveal delay={100} className="mt-10">
            <TeamCadence />
          </Reveal>
          <Reveal className="mt-16">
            <div className="measure space-y-12">
              {teamwork.map((t, i) => (
                <Reveal key={t.index} delay={i * 40}>
                  <article className="border-t border-border pt-6">
                    <h3 className="flex items-baseline gap-3 text-xl font-medium text-text">
                      <span className="font-mono text-sm text-accent-text">
                        {t.index}
                      </span>
                      {t.title}
                    </h3>
                    <p className="mt-3 leading-relaxed text-text-muted">
                      {t.body}
                    </p>
                    <p className="mono-label mt-3">source: {t.evidence}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </Reveal>
        </DocSection>

        {/* 05 — the evaluation */}
        <DocSection id="assessment" n="05" label="The evaluation" title="What the rubric said.">
          <Reveal>
            <div className="measure space-y-5 text-lg leading-relaxed text-text-muted">
              <p>{assessment.attests}</p>
              <p className="text-base text-text-muted">{assessment.note}</p>
            </div>
          </Reveal>
          <Reveal delay={100} className="mt-10">
            <RubricBreakdown />
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

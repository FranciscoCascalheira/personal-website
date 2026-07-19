import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Container } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { KeyBlitzPlate } from "@/components/case/KeyBlitzPlate";
import { InterruptDispatch } from "@/components/case/InterruptDispatch";
import { RtcPath } from "@/components/case/RtcPath";
import {
  caseMeta,
  abstract,
  problem,
  constraints,
  myPart,
  outcome,
} from "@/lib/case-study-lcom";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "KeyBlitz — a low-level engineering case study",
  description:
    "The register: a device driver and a game drawn one pixel at a time, in C on MINIX 3, with no graphics library — the counterweight to a dossier that otherwise lives at the top of the stack.",
};

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
              <h2 className="display text-[clamp(1.9rem,3.4vw,3.1rem)]">{title}</h2>
            </Reveal>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </Container>
    </section>
  );
}

const contents = [
  { id: "abstract", n: "00", label: "Abstract", title: "What this document claims.", gloss: "the register, and the four numbers under it" },
  { id: "problem", n: "01", label: "The problem", title: "When the mountain is gone.", gloss: "no library, no framework, no OS to lean on" },
  { id: "constraints", n: "02", label: "Constraints", title: "The rules of the metal.", gloss: "interrupts not polling, a raw framebuffer, a live defence" },
  { id: "system", n: "03", label: "The system", title: "Four interrupts, one loop.", gloss: "how a microkernel game is wired" },
  { id: "mine", n: "04", label: "My part", title: "A driver, and everything you see.", gloss: "the RTC driver, and the interface layer" },
  { id: "outcome", n: "05", label: "Outcome", title: "Why it's in the dossier.", gloss: "the counterweight — breadth, honestly" },
] as const;

export default function KeyBlitzCaseStudyPage() {
  return (
    <>
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
        {/* document title block */}
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
                  { k: "Course", v: caseMeta.course },
                  { k: "Team", v: caseMeta.team },
                  { k: "Role", v: caseMeta.role },
                  { k: "Stack", v: caseMeta.stack },
                  {
                    k: "Corroboration",
                    /* Not a grade, not an outside authority — said plainly. */
                    v: (
                      <div>
                        <p className="text-text">The game runs, and the code is open to read.</p>
                        <p className="mt-0.5 font-mono text-[0.68rem] leading-relaxed text-text-faint">
                          The weakest-corroborated of the four here, on purpose — the claim is breadth, not a mark.
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

        {/* fig. 0 — the game, engraved */}
        <section className="border-b border-border">
          <Container>
            <Reveal className="py-12 sm:py-16">
              <p className="mono-label mb-6">fig. 0 · the game, redrawn</p>
              <KeyBlitzPlate />
            </Reveal>
          </Container>
        </section>

        {/* contents */}
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
                        <span className="font-mono text-sm text-text-faint tabular-nums">{c.n}</span>
                        <span className="mono-label hidden lg:inline">{c.label}</span>
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
            <p className="measure text-lg leading-relaxed text-text-muted">{abstract.body}</p>
          </Reveal>
          <Reveal delay={100}>
            <dl className="mt-10 grid grid-cols-2 gap-y-8 border-t border-border-strong pt-6 lg:grid-cols-4">
              {abstract.metrics.map((m, i) => (
                <div key={m.label} className={i > 0 ? "lg:border-l lg:border-border lg:pl-8" : ""}>
                  <dt className="font-serif text-4xl leading-none text-text sm:text-5xl">{m.value}</dt>
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
        <DocSection id="problem" n="01" label="The problem" title="When the mountain is gone.">
          <Reveal>
            <div className="measure space-y-5 text-lg leading-relaxed text-text-muted">
              {problem.paragraphs.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </Reveal>
        </DocSection>

        {/* 02 — constraints */}
        <DocSection id="constraints" n="02" label="Constraints" title="The rules of the metal.">
          <div className="grid gap-x-12 sm:grid-cols-2">
            {constraints.map((c, i) => (
              <Reveal key={c.k} delay={i * 60} className="border-t border-border py-6">
                <h3 className="text-base font-medium text-text">{c.k}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">{c.v}</p>
              </Reveal>
            ))}
          </div>
        </DocSection>

        {/* 03 — the system */}
        <DocSection id="system" n="03" label="The system" title="Four interrupts, one loop.">
          <Reveal>
            <p className="measure text-lg leading-relaxed text-text-muted">
              A microkernel doesn&apos;t hand you an event loop — you write one. Four
              devices raise hardware interrupts; a single blocking call collects
              them and a bitmask says which fired. This is the whole team&apos;s
              architecture; my line in it is the RTC.
            </p>
          </Reveal>
          <Reveal delay={100} className="mt-10">
            <InterruptDispatch />
          </Reveal>
        </DocSection>

        {/* 04 — my part */}
        <DocSection id="mine" n="04" label="My part" title="A driver, and everything you see.">
          <Reveal>
            <div className="measure space-y-5 text-lg leading-relaxed text-text-muted">
              {myPart.paragraphs.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </Reveal>
          <Reveal delay={100} className="mt-12">
            <RtcPath />
          </Reveal>
        </DocSection>

        {/* 05 — outcome */}
        <DocSection id="outcome" n="05" label="Outcome" title="Why it's in the dossier.">
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

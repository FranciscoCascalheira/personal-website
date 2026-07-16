import Link from "next/link";
import { Reveal } from "./Reveal";
import { Container } from "./Section";
import { LiveStatusHeader } from "./LiveStatus";
import { MagneticLink } from "./MagneticLink";
import { Fig0Plate } from "./Fig0Plate";
import { Fig0Depth } from "./Fig0Depth";
import { publicRecord } from "@/lib/case-study";
import { site } from "@/lib/site";

type Proof = {
  productionOk: boolean;
  checkedAt: string | null;
};

/** The masthead of the record. The claim is set at viewport scale in the
 *  document's serif voice; the evidence follows as a ruled ledger, not a
 *  box. The margin column annotates: dossier id, role, place, live clock. */
export function Hero({ proof }: { proof: Proof }) {
  return (
    <section id="top" className="pt-16">
      <Container>
        <div className="grid gap-y-10 pb-16 pt-16 sm:pt-24 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-y-0 xl:grid-cols-[260px_minmax(0,1fr)]">
          {/* marginalia — the document's running header */}
          <Reveal
            as="aside"
            className="flex flex-wrap items-baseline gap-x-6 gap-y-2 lg:sticky lg:top-24 lg:block lg:self-start lg:pr-10"
          >
            <p className="print-only mono-label mb-2">
              Public record · printed edition · franciscocascalheira.com
            </p>
            <p className="mono-label">{"/// FC-Dossier"}</p>
            <p className="mono-label lg:mt-2">Software developer</p>
            <p className="mono-label lg:mt-2">{site.locator}</p>
            <div className="lg:mt-8">
              <LiveStatusHeader />
            </div>
          </Reveal>

          {/* the claim */}
          <div className="lg:border-l lg:border-border lg:pl-12 xl:pl-16">
            <Reveal>
              <h1 className="line-mask">
                <span className="line-inner display max-w-[17ch] text-[clamp(2.75rem,7vw,6.75rem)]">
                  The City of Porto runs its youth-internship programme on
                  software{" "}
                  <em className="focus-in not-italic">
                    <span className="italic text-accent-text">
                      I built alone
                    </span>
                  </em>
                  .
                </span>
              </h1>
            </Reveal>

            <Reveal delay={140}>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-text-muted">
                I&apos;m Francisco Cascalheira, a second-year Computer
                Engineering student at FEUP. For opPORTOnities I sat in the
                requirements meetings, designed the 12-model schema, wrote all
                294 commits, and deployed it. It is in production now.
              </p>
            </Reveal>

            <Reveal delay={220}>
              <div className="no-print mt-10 flex flex-wrap items-center gap-3">
                <MagneticLink
                  href="/work/opportonities"
                  className="group inline-flex items-center gap-2 bg-text px-6 py-3 text-sm font-medium text-bg"
                >
                  Read the case study
                  <span
                    className="transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  >
                    →
                  </span>
                </MagneticLink>
                <a
                  href="#contact"
                  className="inline-flex items-center border border-border-strong px-6 py-3 text-sm font-medium text-text transition-colors hover:bg-bg-elevated"
                >
                  Get in touch
                </a>
              </div>
            </Reveal>

            {/* fig. 0 — the survey plate: the system etched over the city */}
            <Reveal delay={280} className="mt-16 sm:mt-20">
              <figure>
                <Fig0Depth>
                  <Fig0Plate />
                </Fig0Depth>
                <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-t border-border pt-3">
                  <span className="max-w-xl font-mono text-[0.72rem] font-medium leading-relaxed text-text-faint">
                    fig. 0 — The matching network over the seven freguesias of
                    Porto, engraved from the official administrative charts.
                    The amber line is an accepted application — the door the
                    platform exists to open.
                  </span>
                  <span className="mono-label whitespace-nowrap" aria-hidden>
                    ● candidate&ensp;□ company&ensp;— match
                  </span>
                </figcaption>
              </figure>
            </Reveal>

            {/* the evidence — a ruled ledger, stamped */}
            <Reveal delay={300} className="mt-16 sm:mt-20">
              <div className="flex flex-wrap items-end justify-between gap-4 pb-4">
                <p className="mono-label">Exhibit record</p>
                <p className="stamp">
                  {proof.productionOk ? (
                    <>
                      <span
                        className="size-1.5 rounded-full bg-positive"
                        aria-hidden
                      />
                      In production · API responding
                      {proof.checkedAt ? ` · ${proof.checkedAt} UTC` : null}
                    </>
                  ) : (
                    "In production"
                  )}
                </p>
              </div>
              <dl>
                {[
                  {
                    k: "Client",
                    /* The one line here a stranger can check without me: the
                       council's own programme page. It does not name me — it
                       establishes that the programme, and the platform it
                       points at, are real. */
                    v: (
                      <a
                        href={publicRecord[0].url}
                        target="_blank"
                        rel="noreferrer"
                        className="link-quiet"
                      >
                        Câmara Municipal do Porto
                        <span className="ml-1 text-text-faint" aria-hidden>
                          ↗
                        </span>
                      </a>
                    ),
                  },
                  { k: "Commits", v: "294 — sole author, verified by git" },
                  { k: "Positions", v: "99 in production — 60 placed" },
                  { k: "Stack", v: "TS · Node · Postgres · React" },
                ].map((row) => (
                  <div
                    key={row.k}
                    className="grid grid-cols-[110px_1fr] items-baseline gap-4 border-t border-border py-3 text-sm sm:grid-cols-[140px_1fr]"
                  >
                    <dt className="mono-label">{row.k}</dt>
                    <dd className="text-text">{row.v}</dd>
                  </div>
                ))}
              </dl>
              <div className="border-t border-border pt-4">
                <p className="mono-label">
                  <Link href="/work/opportonities" className="accent-underline">
                    Full engineering teardown →
                  </Link>
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}

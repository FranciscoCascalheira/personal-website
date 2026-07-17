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

/** The masthead of the record — the cover, not a section. The running header
 *  is a thin ruled strip; the claim then owns the first screen at monumental
 *  scale (the one loud moment on the site), and immediately below it the
 *  disciplined document resumes: fig. 0 and a ruled ledger of receipts. The
 *  sequence is the argument — an extraordinary claim, then the evidence to
 *  audit it. The marginalia/folio language lives in the numbered sections
 *  that follow; a masthead is full-bleed by convention. */
export function Hero({ proof }: { proof: Proof }) {
  return (
    <section id="top" className="pt-16">
      <Container>
        {/* running header — horizontal masthead strip.
            immediate: the whole masthead is above the fold, so it plays its
            rise-in as a CSS load animation rather than waiting for hydration —
            the LCP text is in this block's neighbours and must paint on first
            render, not ~3s later on a slow phone. */}
        <Reveal
          as="div"
          immediate
          className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-border pb-5 pt-10 sm:pt-16"
        >
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
            <p className="mono-label">{"/// FC-Dossier"}</p>
            <p className="mono-label">Software developer</p>
            <p className="mono-label">{site.locator}</p>
          </div>
          <div className="no-print">
            <LiveStatusHeader />
          </div>
          <p className="print-only mono-label">
            Public record · printed edition · franciscocascalheira.com
          </p>
        </Reveal>

        {/* the claim — monumental, owning the first screen */}
        <div className="pb-14 pt-12 sm:pb-20 sm:pt-16">
          <Reveal immediate>
            <h1 className="line-mask">
              <span className="line-inner display max-w-[17ch] text-[clamp(2.7rem,7.4vw,7rem)] leading-[0.92]">
                The City of Porto runs its youth-internship programme on
                software{" "}
                <em className="focus-in not-italic">
                  <span className="italic text-accent-text">I built alone</span>
                </em>
                .
              </span>
            </h1>
          </Reveal>

          {/* intro + actions as ONE left cluster — the CTAs sit directly under
              the paragraph so they never strand across the monumental air on the
              right, which is the cover's deliberate breathing room */}
          <Reveal delay={160} immediate>
            <div className="mt-12 max-w-xl sm:mt-14">
              <p className="text-lg leading-relaxed text-text-muted">
                I&apos;m Francisco Cascalheira, a second-year Computer
                Engineering student at FEUP. For opPORTOnities I sat in the
                requirements meetings, designed the 12-model schema, wrote all
                294 commits, and deployed it. It is in production now.
              </p>
              <div className="no-print mt-8 flex flex-wrap items-center gap-3">
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
            </div>
          </Reveal>
        </div>

        {/* the document resumes — fig. 0 and the receipts, full width */}
        <div className="pb-16">
            {/* fig. 0 — the survey plate: the system etched over the city */}
            <Reveal delay={120}>
              <figure>
                {/* On a phone the survey is a landscape sheet crushed to a
                    ~195px strip: the map goes faint and every label drops under
                    the sub-640px micro cut. Give it real width in a scroll rail
                    (the fig. 4 idiom) — the plate renders at 40rem, ~1.8× taller
                    and legible, and you swipe to pan the city. Above sm it is
                    whole and full-width exactly as before, and the WebGL depth
                    layer (fine-pointer, ≥640px only) never sees the rail. */}
                <div className="plate-rail -mx-5 overflow-x-auto overscroll-x-contain sm:mx-0 sm:overflow-x-visible">
                  <div className="min-w-[40rem] px-5 sm:min-w-0 sm:px-0">
                    <Fig0Depth>
                      <Fig0Plate />
                    </Fig0Depth>
                  </div>
                </div>
                <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-t border-border pt-3">
                  <span className="max-w-xl font-mono text-[0.72rem] font-medium leading-relaxed text-text-faint">
                    fig. 0 — The matching network over the seven freguesias of
                    Porto, engraved from the official administrative charts.
                    The amber line is an accepted application — the door the
                    platform exists to open.
                  </span>
                  <span className="mono-label whitespace-nowrap" aria-hidden>
                    ● candidate&ensp;□ company&ensp;— match
                    <span className="ml-3 text-text-faint sm:hidden">
                      · swipe →
                    </span>
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
      </Container>
    </section>
  );
}

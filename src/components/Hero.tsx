import Link from "next/link";
import { Reveal } from "./Reveal";
import { Container } from "./Section";
import { LiveStatusHeader } from "./LiveStatus";
import { MagneticLink } from "./MagneticLink";
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
                <span className="line-inner headline max-w-[20ch] text-[clamp(2rem,4.6vw,3.5rem)]">
                  The City of Porto runs its youth-internship programme on
                  software{" "}
                  <em className="focus-in not-italic">
                    <span className="serif-accent text-[1.15em] text-accent-text">
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
              <div className="mt-10 flex flex-wrap items-center gap-3">
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
                  { k: "Client", v: "Câmara Municipal do Porto" },
                  { k: "Commits", v: "294 — sole author, verified by git" },
                  { k: "Vacancies", v: "380+ handled in production" },
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

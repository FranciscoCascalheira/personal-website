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

/** The claim, then the evidence. The hero's job is one sentence a recruiter
 *  can repeat to a colleague — everything else on the page defends it. */
export function Hero({ proof }: { proof: Proof }) {
  return (
    <section id="top" className="relative overflow-hidden pt-36 sm:pt-44">
      <div className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" />

      <Container>
        <div className="grid items-start gap-12 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
          {/* left — the claim */}
          <div>
            <Reveal>
              <p className="mono-label mb-8">
                {`/// FC-Dossier · Software developer · ${site.locator}`}
              </p>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="text-balance text-4xl font-medium leading-[1.08] tracking-[-0.03em] sm:text-5xl">
                <span className="text-gradient">
                  The City of Porto runs its youth-internship programme on
                  software{" "}
                </span>
                <span className="focus-in font-serif text-4xl italic text-accent sm:text-5xl">
                  I built alone
                </span>
                <span className="text-gradient">.</span>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-text-muted">
                I&apos;m Francisco Cascalheira, a second-year Computer
                Engineering student at FEUP. For opPORTOnities I sat in the
                requirements meetings, designed the 12-model schema, wrote all
                294 commits, and deployed it. It is in production now.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <MagneticLink
                  href="/work/opportonities"
                  className="group inline-flex items-center gap-2 rounded-full bg-text px-5 py-2.5 text-sm font-medium text-bg"
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
                  className="inline-flex items-center rounded-full border border-border-strong px-5 py-2.5 text-sm font-medium text-text transition-colors hover:bg-bg-elevated"
                >
                  Get in touch
                </a>
              </div>
            </Reveal>
          </div>

          {/* right — the evidence panel: live where truthfully live */}
          <Reveal delay={200} className="lg:pt-2">
            <div className="border border-border bg-bg-elevated p-6">
              <div className="mb-5">
                <LiveStatusHeader />
              </div>
              <dl className="divide-y divide-border">
                <div className="grid grid-cols-[92px_1fr] gap-3 py-2.5 text-sm">
                  <dt className="font-mono text-xs uppercase tracking-wider text-text-faint">
                    Status
                  </dt>
                  <dd className="text-text">
                    {proof.productionOk ? (
                      <span className="inline-flex items-baseline gap-2">
                        <span
                          className="size-1.5 self-center rounded-full bg-positive"
                          aria-hidden
                        />
                        In production — API responding
                        {proof.checkedAt
                          ? ` · checked ${proof.checkedAt} UTC`
                          : null}
                      </span>
                    ) : (
                      "In production"
                    )}
                  </dd>
                </div>
                {[
                  { k: "Client", v: "Câmara Municipal do Porto" },
                  { k: "Commits", v: "294 — sole author, verified by git" },
                  { k: "Vacancies", v: "380+ handled in production" },
                  { k: "Stack", v: "TS · Node · Postgres · React" },
                ].map((row) => (
                  <div
                    key={row.k}
                    className="grid grid-cols-[92px_1fr] gap-3 py-2.5 text-sm"
                  >
                    <dt className="font-mono text-xs uppercase tracking-wider text-text-faint">
                      {row.k}
                    </dt>
                    <dd className="text-text">{row.v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mono-label mt-4">
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

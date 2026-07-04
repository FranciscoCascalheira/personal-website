import { Reveal } from "./Reveal";
import { Container } from "./Section";
import { LiveStatusHeader } from "./LiveStatus";
import { HeroField } from "./HeroField";
import { MagneticLink } from "./MagneticLink";
import { site } from "@/lib/site";

const currently = [
  { k: "Building", v: "opPORTOnities" },
  { k: "For", v: "Câmara Municipal do Porto" },
  { k: "Role", v: "Sole developer" },
  { k: "Status", v: "In production" },
  { k: "Stack", v: "TS · Node · Postgres · React" },
];

const stats = [
  { k: "In production", v: "A recruitment platform the City of Porto runs on" },
  { k: "500+ commits", v: "Solo, across opPORTOnities and UniSpot" },
  { k: "FEUP · 2nd year", v: "Computer Engineering, still a student" },
];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-36 sm:pt-44">
      <div className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" />
      <HeroField />

      <Container>
        <div className="grid items-start gap-12 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
          {/* left — the statement */}
          <div>
            <Reveal>
              <p className="mono-label mb-8">
                {`/// Software developer · ${site.locator}`}
              </p>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="text-balance text-4xl font-medium leading-[1.05] tracking-[-0.03em] sm:text-5xl lg:text-6xl">
                <span className="text-gradient">I build software that </span>
                <span className="focus-in font-serif text-4xl italic text-accent sm:text-5xl lg:text-6xl">
                  actually ships
                </span>
                <span className="text-gradient">.</span>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-text-muted">
                Second-year Computer Engineering student at FEUP and the sole
                developer of a recruitment platform the City of Porto runs on
                today. I own products from the first requirements meeting to the
                production deploy.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <MagneticLink
                  href="#work"
                  className="group inline-flex items-center gap-2 rounded-full bg-text px-5 py-2.5 text-sm font-medium text-bg"
                >
                  See selected work
                  <span className="transition-transform group-hover:translate-x-0.5" aria-hidden>
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

          {/* right — the currently card (mono metadata, Delta-style) */}
          <Reveal delay={200} className="lg:pt-2">
            <div className="rounded-2xl border border-border bg-bg-elevated p-6">
              <div className="mb-5">
                <LiveStatusHeader />
              </div>
              <dl className="divide-y divide-border">
                {currently.map((row) => (
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
            </div>
          </Reveal>
        </div>

        {/* stat strip */}
        <Reveal delay={320}>
          <dl className="mt-20 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
            {stats.map((s) => (
              <div key={s.k} className="bg-bg px-6 py-7">
                <dt className="text-lg font-medium text-text">{s.k}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-text-muted">
                  {s.v}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Container>
    </section>
  );
}

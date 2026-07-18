import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

/** The sheet: wide, with real margins. Content inside hangs off the
 *  marginalia rule — this is deliberately wider than a blog measure. */
export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1520px] px-5 sm:px-10 ${className}`}>
      {children}
    </div>
  );
}

/** A full-bleed ruled line — the document's horizontal structure. */
export function Rule({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`h-px w-full bg-border ${className}`} />;
}

/** One numbered section of the record.
 *
 *  Left: the marginalia column — a ghost folio numeral and a mono label,
 *  sticky so the margin annotates the content as you read. A vertical rule
 *  divides margin from body for the section's full height.
 *  Right: a serif display title, an optional lede, then the content.
 */
export function Section({
  id,
  index,
  label,
  title,
  lede,
  children,
  minor = false,
}: {
  id?: string;
  index: string;
  label: string;
  title: ReactNode;
  lede?: ReactNode;
  children: ReactNode;
  /** Supporting matter, not a rival monument. A minor section drops the
   *  display title to a quiet serif, tightens its air, and inlines its folio —
   *  so the page has hierarchy (Work is loud; the stack that supports it is
   *  not) and a composed rhythm instead of six equal headlines. */
  minor?: boolean;
}) {
  if (minor) {
    return (
      <section id={id} className="scroll-mt-20 border-t border-border">
        <Container>
          <div className="grid gap-y-6 py-12 sm:py-14 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-y-0 xl:grid-cols-[260px_minmax(0,1fr)]">
            <Reveal
              as="aside"
              className="flex items-baseline gap-3 lg:block lg:self-start lg:pr-10"
            >
              <p className="font-mono text-sm text-text-faint" aria-hidden>
                {index}
              </p>
              <p className="mono-label lg:mt-2">{label}</p>
            </Reveal>

            <div className="lg:border-l lg:border-border lg:pl-12 xl:pl-16">
              <Reveal className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
                <h2 className="font-serif text-[clamp(1.5rem,2.4vw,2.1rem)] leading-tight text-text">
                  {title}
                </h2>
                {lede ? (
                  <p className="max-w-md text-sm leading-relaxed text-text-muted">
                    {lede}
                  </p>
                ) : null}
              </Reveal>
              <div className="mt-8">{children}</div>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section id={id} className="scroll-mt-20 border-t border-border">
      <Container>
        <div className="grid gap-y-8 py-16 sm:py-24 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-y-0 xl:grid-cols-[260px_minmax(0,1fr)]">
          <Reveal
            as="aside"
            className="flex items-baseline gap-4 lg:sticky lg:top-24 lg:block lg:self-start lg:pr-10"
          >
            <p className="folio" aria-hidden data-folio={index} />
            <p className="mono-label lg:mt-5">{label}</p>
          </Reveal>

          <div className="lg:border-l lg:border-border lg:pl-12 xl:pl-16">
            <Reveal>
              <h2 className="display text-[clamp(2.3rem,4.6vw,4.4rem)]">
                {title}
              </h2>
              {lede ? (
                <p className="mt-6 max-w-xl leading-relaxed text-text-muted">
                  {lede}
                </p>
              ) : null}
            </Reveal>
            <div className="mt-12 sm:mt-14">{children}</div>
          </div>
        </div>
      </Container>
    </section>
  );
}

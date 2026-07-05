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
}: {
  id?: string;
  index: string;
  label: string;
  title: ReactNode;
  lede?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-border">
      <Container>
        <div className="grid gap-y-8 py-16 sm:py-24 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-y-0 xl:grid-cols-[260px_minmax(0,1fr)]">
          <Reveal
            as="aside"
            className="flex items-baseline gap-4 lg:sticky lg:top-24 lg:block lg:self-start lg:pr-10"
          >
            <p className="folio" aria-hidden>
              {index}
            </p>
            <p className="mono-label lg:mt-5">{label}</p>
          </Reveal>

          <div className="lg:border-l lg:border-border lg:pl-12 xl:pl-16">
            <Reveal>
              <h2 className="headline text-[clamp(1.6rem,2.6vw,2.4rem)]">
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

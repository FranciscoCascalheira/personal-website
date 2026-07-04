import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1120px] px-6 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}

export function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-24 border-t border-border py-24 sm:py-32 ${className}`}
    >
      <Container>{children}</Container>
    </section>
  );
}

/** The asymmetric, left-aligned section header: a mono index + label on top,
 *  a large title below, and an optional supporting line to the right. */
export function SectionHeading({
  index,
  label,
  title,
  children,
}: {
  index: string;
  label: string;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Reveal className="mb-14 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
      <div>
        <p className="mono-label mb-5 flex items-center gap-2">
          <span className="text-accent">{index}</span>
          <span className="h-px w-6 bg-border-strong" aria-hidden />
          {label}
        </p>
        <h2 className="max-w-2xl text-3xl font-medium leading-[1.1] sm:text-4xl">
          {title}
        </h2>
      </div>
      {children ? (
        <p className="max-w-sm text-sm leading-relaxed text-text-muted md:text-right">
          {children}
        </p>
      ) : null}
    </Reveal>
  );
}

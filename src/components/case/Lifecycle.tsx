"use client";

import { Fragment } from "react";
import { lifecycle as opportonitiesLifecycle } from "@/lib/case-study";
import { useInView } from "@/lib/motion";

type State = { id: string; label: string; note: string };
type LifecycleData = {
  states: readonly State[];
  terminal: readonly State[];
  caption: string;
};

/** fig. 2 — a state machine as a live diagram.
 *
 * The states are typeset on a single line (a column on small screens) and
 * joined by hairlines through which an amber pulse travels once the figure
 * is in view — the machine reads as running, because it is. Notes annotate
 * each state below; terminal states close the figure as a ruled footnote.
 *
 * Data-driven so both case studies share it; defaults to opPORTOnities'
 * application lifecycle, so its call site is unchanged. */
export function Lifecycle({
  lifecycle = opportonitiesLifecycle,
}: {
  lifecycle?: LifecycleData;
} = {}) {
  const { ref, inView } = useInView<HTMLElement>();

  return (
    <figure
      ref={ref}
      className={`border-y border-border-strong ${inView ? "pipeline-live" : ""}`}
      aria-labelledby="fig2-caption"
    >
      <div className="py-7">
        {/* the machine */}
        <div className="flex flex-col sm:flex-row sm:items-center" aria-hidden>
          {lifecycle.states.map((s, i) => (
            <Fragment key={s.id}>
              <span className="w-fit border-b-2 border-accent pb-1 font-mono text-xs text-text">
                {s.id}
              </span>
              {i < lifecycle.states.length - 1 && (
                <span
                  className="flow-link"
                  style={{ "--flow-delay": `${i * 0.45}s` } as React.CSSProperties}
                />
              )}
            </Fragment>
          ))}
        </div>

        {/* the annotations */}
        <ol className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {lifecycle.states.map((s, i) => (
            <li key={s.id}>
              <p className="mono-label">
                {`0${i + 1}`} <span className="text-accent-text">{s.id}</span>
              </p>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                {s.note}
              </p>
            </li>
          ))}
        </ol>

        {/* terminal states — the footnote */}
        <div className="mt-8 border-t border-border pt-5">
          <p className="mono-label mb-3">Terminal states</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {lifecycle.terminal.map((t) => (
              <li key={t.id} className="font-mono text-xs text-text-muted">
                <span className="text-text">{t.id}</span>
                <span className="text-text-faint"> · {t.note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <figcaption
        id="fig2-caption"
        className="border-t border-border-strong py-3"
      >
        <span className="mono-label">{lifecycle.caption}</span>
      </figcaption>
    </figure>
  );
}

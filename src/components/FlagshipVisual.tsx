"use client";

import { useInView } from "@/lib/motion";
import { CountMetric } from "./ui";

const pipeline = ["Candidates", "Companies", "Vacancies", "Applications"];

const metrics = [
  { value: "294", label: "solo commits" },
  { value: "380+", label: "vacancies" },
  { value: "12", label: "data models" },
  { value: "Live", label: "in production" },
];

/**
 * A stylised schematic of the flagship — the real domain of the platform (its
 * end-to-end application pipeline and headline metrics) without exposing any
 * production UI or client data. The pipeline reads as a live system: a signal
 * travels the connectors like an application moving through the funnel.
 */
export function FlagshipVisual() {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div ref={ref}>
      <div className="overflow-hidden rounded-xl border border-border bg-bg-inset">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="flex gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-full bg-border-strong" />
            <span className="size-2.5 rounded-full bg-border-strong" />
            <span className="size-2.5 rounded-full bg-border-strong" />
          </span>
          <span className="ml-2 truncate rounded-md bg-bg px-3 py-1 font-mono text-xs text-text-faint">
            opportunities · cm-porto
          </span>
        </div>
        <div className="px-6 py-8">
          <p className="text-2xl font-medium tracking-tight text-text">
            op<span className="text-accent">PORTO</span>nities
          </p>
          <p className="mono-label mt-2">Talent for the City of Porto</p>

          {/* the pipeline — a signal flows through it once in view, so it
              reads as a live system (an application moving through the funnel),
              never a static diagram. */}
          <div
            className={`mt-7 flex flex-col items-stretch gap-0 sm:flex-row sm:items-center ${
              inView ? "pipeline-live" : ""
            }`}
          >
            {pipeline.map((e, i) => (
              <div key={e} className="contents">
                <span className="rounded-md border border-border bg-bg px-3 py-2 text-center text-sm text-text sm:py-1.5">
                  {e}
                </span>
                {i < pipeline.length - 1 ? (
                  <span
                    className="flow-link"
                    style={{ ["--flow-delay" as string]: `${i * 0.5}s` }}
                    aria-hidden
                  />
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border">
            {metrics.map((m) => (
              <dl key={m.label} className="bg-bg-inset px-4 py-3">
                <CountMetric
                  value={m.value}
                  label={m.label}
                  active={inView}
                  className="text-lg font-medium tabular-nums text-text"
                />
              </dl>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-3 font-mono text-xs text-text-faint">
        {"/// Illustrative schematic — production UI withheld (client data)"}
      </p>
    </div>
  );
}

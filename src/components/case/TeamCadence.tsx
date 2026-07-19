import { cadence } from "@/lib/case-study-engineher";

/** fig. 3 — the cadence. Five lanes, one per person, each split into the three
 *  months the code was written. The bar in a cell is that month's commits,
 *  scaled to the busiest cell across everyone, so the eye reads two things at
 *  once: one person's arc left-to-right, and who was on the repo in any given
 *  month top-to-bottom. The four tagged releases sit on the same axis at their
 *  real dates. Static, ruled, ink + one amber lane (mine) — the same quiet
 *  register as fig. 0. */
export function TeamCadence() {
  const maxCell = Math.max(...cadence.lanes.flatMap((l) => l.counts));

  return (
    <figure className="border-y border-border-strong" aria-labelledby="fig3-caption">
      <div className="py-8 sm:py-10">
        {/* month axis + release ticks */}
        <div className="mb-6">
          <div className="grid grid-cols-[120px_minmax(0,1fr)] items-end gap-4 sm:grid-cols-[200px_minmax(0,1fr)]">
            <span className="mono-label">releases →</span>
            {/* Staggered over two rows so the two May releases (v0.3.0, v0.4.0,
                close together on a narrow axis) never touch; the last is
                right-anchored so it can't clip the figure's edge at 390. */}
            <div className="relative h-8">
              {cadence.releases.map((r, i) => (
                <span
                  key={r.tag}
                  className={`absolute whitespace-nowrap font-mono text-[0.6rem] text-accent-text ${
                    i % 2 === 0 ? "top-0" : "top-4"
                  } ${
                    i === 0
                      ? ""
                      : i === cadence.releases.length - 1
                        ? "-translate-x-full"
                        : "-translate-x-1/2"
                  }`}
                  style={{ left: `${r.at * 100}%` }}
                >
                  {r.tag}
                </span>
              ))}
            </div>
          </div>
          {/* the release ruled marks on the timeline */}
          <div className="mt-1 grid grid-cols-[120px_minmax(0,1fr)] gap-4 sm:grid-cols-[200px_minmax(0,1fr)]">
            <span aria-hidden />
            <div className="relative h-2 border-t border-border">
              {cadence.releases.map((r) => (
                <span
                  key={r.tag}
                  aria-hidden
                  className="absolute top-0 h-2 w-px bg-accent/60"
                  style={{ left: `${r.at * 100}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* the lanes */}
        <ol className="space-y-3">
          {cadence.lanes.map((lane, li) => (
            <li
              key={lane.label + li}
              className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-4 sm:grid-cols-[200px_minmax(0,1fr)]"
            >
              <span
                className={`font-mono text-[0.7rem] leading-tight ${
                  lane.mine ? "text-accent-text" : "text-text-muted"
                }`}
              >
                {lane.label}
              </span>
              <div className="grid grid-cols-3 gap-x-3">
                {lane.counts.map((c, mi) => (
                  <div key={mi} className="flex items-center gap-2">
                    <span aria-hidden className="h-3 flex-1 bg-border/60">
                      <span
                        className={`block h-full ${lane.mine ? "bg-accent" : "bg-text-faint"}`}
                        style={{ width: `${maxCell ? (c / maxCell) * 100 : 0}%` }}
                      />
                    </span>
                    <span className="w-6 shrink-0 text-right font-mono text-[0.62rem] tabular-nums text-text-faint">
                      {c}
                    </span>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ol>

        {/* month labels under the columns */}
        <div className="mt-3 grid grid-cols-[120px_minmax(0,1fr)] gap-4 sm:grid-cols-[200px_minmax(0,1fr)]">
          <span aria-hidden />
          <div className="grid grid-cols-3 gap-x-3">
            {cadence.months.map((m) => (
              <span key={m} className="mono-label">
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>

      <figcaption id="fig3-caption" className="border-t border-border-strong py-3">
        <span className="mono-label">{cadence.caption}</span>
      </figcaption>
    </figure>
  );
}

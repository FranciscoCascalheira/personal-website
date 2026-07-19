import {
  teamShares,
  releases,
  teamPlateCaption,
} from "@/lib/case-study-engineher";

/** fig. 0 — the signature figure for a case study whose claim is the team,
 *  not one engineered fix. No engraved plate, no Three.js: the plainest
 *  possible rendering of "five people, nobody over a third" — ranked ruled
 *  bars by commit share, with the four tagged releases laid beneath them on
 *  the sprint cadence that produced them. Static; the claim doesn't need
 *  motion to be legible. */
export function TeamPlate() {
  const maxPct = Math.max(...teamShares.map((s) => s.pct));

  return (
    <figure className="border-y border-border-strong" aria-labelledby="fig0-caption">
      <div className="py-8 sm:py-10">
        {/* the bars — commit share, ranked */}
        <ol className="space-y-4">
          {teamShares.map((s) => (
            <li key={s.label + s.commits} className="grid grid-cols-[1fr_auto] items-baseline gap-4 sm:grid-cols-[220px_1fr_auto]">
              <span
                className={`hidden font-mono text-xs sm:block ${
                  s.mine ? "text-accent-text" : "text-text-muted"
                }`}
              >
                {s.label}
              </span>
              <span
                aria-hidden
                className="h-2 w-full self-center bg-border sm:h-3"
              >
                <span
                  className={`block h-full ${s.mine ? "bg-accent" : "bg-text-faint"}`}
                  style={{ width: `${(s.pct / maxPct) * 100}%` }}
                />
              </span>
              <span className="font-mono text-xs tabular-nums text-text">
                {s.commits} · {s.pct}%
              </span>
              <span className="col-span-2 font-mono text-[0.7rem] text-text-muted sm:hidden">
                {s.label}
              </span>
            </li>
          ))}
        </ol>

        {/* the cadence — three sprints, four releases */}
        <div className="mt-10 border-t border-border pt-6">
          <p className="mono-label mb-4">Three sprints, four releases</p>
          <ol className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            {releases.map((r) => (
              <li key={r.tag} className="border-l-2 border-accent pl-3">
                <p className="font-serif text-lg text-text">{r.tag}</p>
                <p className="font-mono text-[0.68rem] text-text-faint">
                  {r.sprint} · {r.date}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <figcaption id="fig0-caption" className="border-t border-border-strong py-3">
        <span className="mono-label">{teamPlateCaption}</span>
      </figcaption>
    </figure>
  );
}

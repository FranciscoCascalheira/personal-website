import { rubric } from "@/lib/case-study-engineher";

/** fig. 4 — the professor's rubric, made an artifact. Nine activities, each a
 *  bar to twenty showing the weighted score team 4.3 earned, ordered strongest
 *  to weakest. The total the section states is called out once, plainly. Below
 *  it, the one honest arc worth naming: a criterion the team was weak at early
 *  and got measurably good at. All of it is team 4.3's own row on the shared
 *  rubric — no other team, no individual. Ruled, ink + amber, static. */
export function RubricBreakdown() {
  const FULL = 20;

  return (
    <figure className="border-y border-border-strong" aria-labelledby="fig4-caption">
      <div className="py-8 sm:py-10">
        {/* the headline total */}
        <div className="mb-8 flex flex-wrap items-baseline gap-x-6 gap-y-1 border-b border-border pb-6">
          <span className="font-serif text-4xl leading-none text-text sm:text-5xl">
            {rubric.total.score}
            <span className="text-text-faint">/{FULL}</span>
          </span>
          <span className="mono-label">
            {rubric.total.weightEarned} of {rubric.total.weightOf} available weight · every
            team-graded activity
          </span>
        </div>

        {/* the per-activity bars */}
        <ol className="space-y-2.5">
          {rubric.categories.map((c) => (
            <li
              key={c.name}
              className="grid grid-cols-[130px_minmax(0,1fr)_auto] items-center gap-3 sm:grid-cols-[190px_minmax(0,1fr)_auto] sm:gap-4"
            >
              <span className="text-[0.8rem] leading-tight text-text-muted">{c.name}</span>
              {/* Neutral ink, not amber: on this page amber means "the signal"
                  (my lane in fig. 0/3). These bars rank the team's score — the
                  numbers carry it — so they stay ink and let the 17.9/20
                  headline own the first read. The one amber here is the climb's
                  endpoint below. */}
              <span aria-hidden className="h-2.5 w-full bg-border/60">
                <span
                  className="block h-full bg-text-faint"
                  style={{ width: `${(c.score / FULL) * 100}%` }}
                />
              </span>
              <span className="w-16 text-right font-mono text-xs tabular-nums text-text">
                {c.score.toFixed(1)}
                <span className="text-text-faint"> · {c.weight.toFixed(2)}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="mono-label mt-3">activity · score /20 · weight</p>

        {/* the honest climb */}
        <div className="mt-8 border-t border-border pt-6">
          <p className="text-[0.8rem] leading-relaxed text-text-muted">
            <span className="font-medium text-text">{rubric.climb.label}</span> — {rubric.climb.note}:
          </p>
          <div className="mt-3 flex items-center gap-2">
            {rubric.climb.scores.map((s, i) => (
              <span key={i} className="flex items-center gap-2">
                <span
                  className={`inline-flex h-8 min-w-8 items-center justify-center px-2 font-mono text-sm tabular-nums ${
                    i === rubric.climb.scores.length - 1
                      ? "bg-accent text-field-ink"
                      : "border border-border text-text-muted"
                  }`}
                >
                  {s}
                </span>
                {i < rubric.climb.scores.length - 1 && (
                  <span aria-hidden className="font-mono text-xs text-text-faint">
                    →
                  </span>
                )}
              </span>
            ))}
            <span className="mono-label ml-2">sprint 0 → 3</span>
          </div>
        </div>
      </div>

      <figcaption id="fig4-caption" className="border-t border-border-strong py-3">
        <span className="mono-label">{rubric.caption}</span>
      </figcaption>
    </figure>
  );
}

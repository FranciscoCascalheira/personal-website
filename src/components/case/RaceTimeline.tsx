import type { Guard, RaceStep } from "@/lib/race";

/** fig. 4's diagram — the race drawn as time, because the subject is time.
 *
 *  A list read top to bottom teaches sequence. This race is about two things
 *  happening at the same instant, so time runs left to right and the two
 *  transactions get a lane each. Underneath runs the thing they are fighting
 *  over — young_profiles.y_01.status — as a track that flips ACTIVE→BLOCKED at
 *  the only moment that matters: T1's commit, when its work stops being private
 *  and becomes true for everyone.
 *
 *  The three guards are meant to be ONE picture with ONE variable: where T2
 *  puts its leader down onto the track. Two things are load-bearing for that,
 *  and both had to be built deliberately:
 *
 *  1. THE FLIP IS PINNED. Steps are laid out proportionally either side of the
 *     commit rather than by index, so the flip sits at the same x in all three
 *     guards even though they have 12, 15 and 10 steps. Spacing by index let
 *     the flip slide ~56px between guards and reshuffled every mark, which
 *     destroys the comparison the figure exists to make.
 *  2. A LEADER MEANS ASKING. Only reads and claims draw one. A blind
 *     `UPDATE ... SET status='BLOCKED'` touches the row but never consults it,
 *     so drawing it would make "no guard" look symmetric — both lanes reaching
 *     for the track — when its whole lesson is that Beta never asks. Under
 *     "no guard" Beta's column is empty, and the absence is the point.
 *
 *  Pure SVG, server-rendered: no JavaScript, no canvas, and it prints.
 */

const W = 1000;
const H = 272;
const PAD_L = 92;
const PAD_R = 28;
const RIGHT = W - PAD_R;
const LANE_1 = 58;
const LANE_2 = 124;
const TRACK = 206;
/** Pinned across every guard, so the lever moves the leader and nothing else. */
const FLIP = 640;
const SPOT_Y = TRACK + 40;

export function RaceTimeline({
  guard,
  actual,
  upto,
}: {
  guard: Guard;
  /** Live results by step id; absent before a run. */
  actual?: Map<string, string>;
  /** How far the playhead has travelled; -1 means "printed", show everything. */
  upto?: number;
}) {
  const steps = guard.steps;
  const n = steps.length;
  const commitAt = steps.findIndex((s) => s.actor === "T1" && s.kind === "commit");
  const t2First = steps.findIndex((s) => s.actor === "T2");

  /** Proportional either side of a pinned flip — see note 1 above. */
  const x = (i: number) => {
    if (commitAt <= 0) return PAD_L + (i * (RIGHT - PAD_L)) / Math.max(n - 1, 1);
    if (i < commitAt) return PAD_L + (i / commitAt) * (FLIP - PAD_L);
    if (i === commitAt) return FLIP;
    return (
      FLIP +
      ((i - commitAt) / Math.max(n - 1 - commitAt, 1)) * (RIGHT - FLIP)
    );
  };

  const laneY = (s: RaceStep) => (s.actor === "T1" ? LANE_1 : LANE_2);
  const shown = (i: number) => upto === undefined || upto < 0 || i <= upto;
  // Nothing may assert the flip has happened before the playhead reaches it.
  const flipped = shown(commitAt);

  const winFrom = x(Math.max(t2First, 0));

  const spotAt = guard.spotlight.at
    ? steps.findIndex((s) => s.id === guard.spotlight.at)
    : -1;
  const spotX = spotAt >= 0 ? x(spotAt) : (winFrom + FLIP) / 2;
  // Geist Mono at 10px ≈ 6px per character.
  const halfLen = (guard.spotlight.text.length * 6) / 2;
  const spotAnchor =
    spotX - halfLen < 4 ? "start" : spotX + halfLen > W - 4 ? "end" : "middle";
  const spotTx =
    spotAnchor === "start" ? 4 : spotAnchor === "end" ? W - 4 : spotX;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label={`Timeline of the race under the ${guard.lever} guard. ${guard.reading}`}
    >
      {/* The window is the stage, not the verdict — it stays out of the accent
          so the decisive mark inside it can still be the loudest thing here. */}
      <rect
        x={winFrom}
        y={30}
        width={Math.max(FLIP - winFrom, 0)}
        height={TRACK - 30 - 12}
        className="fill-bg-inset"
      />
      {[winFrom, FLIP].map((wx) => (
        <line
          key={wx}
          x1={wx}
          y1={30}
          x2={wx}
          y2={TRACK - 12}
          className="stroke-border-strong"
          strokeWidth={1}
          strokeDasharray="2 3"
        />
      ))}
      <text
        x={(winFrom + FLIP) / 2}
        y={22}
        textAnchor="middle"
        className="fill-text-faint font-mono text-[10px] uppercase tracking-[0.14em]"
      >
        the race window
      </text>

      {/* lanes */}
      {(["T1", "T2"] as const).map((actor) => {
        const y = actor === "T1" ? LANE_1 : LANE_2;
        return (
          <g key={actor}>
            <text x={0} y={y + 3} className="fill-text font-mono text-[11px]">
              {actor === "T1" ? "Alfa, Lda." : "Beta, S.A."}
            </text>
            <line
              x1={PAD_L - 12}
              y1={y}
              x2={W - 6}
              y2={y}
              className="stroke-border"
              strokeWidth={1}
            />
          </g>
        );
      })}

      {/* The disputed row. Both segments are solid: BLOCKED is not a lesser
          truth than ACTIVE, it is the truth after the flip. */}
      <text x={0} y={TRACK + 3} className="fill-text-faint font-mono text-[11px]">
        y_01.status
      </text>
      <line
        x1={PAD_L - 12}
        y1={TRACK}
        x2={W - 6}
        y2={TRACK}
        className="stroke-text-muted"
        strokeWidth={2}
      />
      <text
        x={PAD_L - 8}
        y={TRACK + 18}
        className="fill-text-muted font-mono text-[10px]"
      >
        ACTIVE
      </text>

      {/* T1's commit IS the flip — draw the causation rather than imply it */}
      {flipped && (
        <>
          <line
            x1={FLIP}
            y1={LANE_1 + 10}
            x2={FLIP}
            y2={TRACK + 7}
            className="stroke-text"
            strokeWidth={1}
          />
          <circle cx={FLIP} cy={TRACK} r={3} className="fill-text" />
          <text
            x={FLIP + 8}
            y={TRACK + 18}
            className="fill-text font-mono text-[10px]"
          >
            BLOCKED
          </text>
        </>
      )}

      {/* Leaders: only where a transaction ASKS the row. A blind write touches
          it without consulting it, and drawing that would flatten the lesson. */}
      {steps.map((s, i) =>
        (s.track === "read" || s.track === "claim") && shown(i) ? (
          <line
            key={`lead-${s.id}`}
            x1={x(i)}
            y1={laneY(s) + 8}
            x2={x(i)}
            y2={TRACK - 6}
            className={s.decisive ? "stroke-accent" : "stroke-text-faint"}
            strokeWidth={s.decisive ? 1.5 : 1}
          />
        ) : null,
      )}

      {/* marks */}
      {steps.map((s, i) => {
        if (!shown(i)) return null;
        const y = laneY(s);
        const val = actual?.get(s.id) ?? s.expect;
        const ink = s.decisive ? "fill-accent" : "fill-text";
        const label =
          s.kind === "begin"
            ? "begin"
            : s.kind === "commit"
              ? "commit"
              : s.kind === "abort"
                ? "rollback"
                : s.id.split("-")[1];

        return (
          <g key={s.id}>
            {s.kind === "commit" ? (
              <rect x={x(i) - 1.5} y={y - 9} width={3} height={18} className={ink} />
            ) : s.kind === "check" ? (
              <circle
                cx={x(i)}
                cy={y}
                r={4}
                className={`fill-bg ${s.decisive ? "stroke-accent" : "stroke-text"}`}
                strokeWidth={1.5}
              />
            ) : s.kind === "begin" ? (
              <line
                x1={x(i)}
                y1={y - 5}
                x2={x(i)}
                y2={y + 5}
                className="stroke-text-faint"
                strokeWidth={1}
              />
            ) : s.kind === "abort" ? (
              <circle
                cx={x(i)}
                cy={y}
                r={4.5}
                className="fill-bg stroke-positive"
                strokeWidth={1.5}
              />
            ) : (
              <rect x={x(i) - 3.5} y={y - 3.5} width={7} height={7} className={ink} />
            )}

            {/* the beat, and what Postgres answered */}
            <text
              x={x(i)}
              y={y - 14}
              textAnchor="middle"
              className={`font-mono text-[10px] ${
                s.decisive ? "fill-accent-text" : "fill-text-faint"
              }`}
            >
              {label}
            </text>
            {(s.kind === "check" || s.decisive || s.kind === "abort") && (
              <text
                x={x(i)}
                y={y + 20}
                textAnchor="middle"
                className={`font-mono text-[10px] ${
                  s.decisive
                    ? "fill-accent-text"
                    : s.kind === "abort"
                      ? "fill-positive"
                      : "fill-text-muted"
                }`}
              >
                {val}
              </text>
            )}
          </g>
        );
      })}

      {/* The punchline gets its own row, below the track and clear of every
          vertical — struck through, it was worse than absent. */}
      {flipped && (
        <>
          {spotAt >= 0 && (
            <line
              x1={spotX}
              y1={TRACK + 7}
              x2={spotX}
              y2={SPOT_Y - 9}
              className="stroke-accent"
              strokeWidth={1}
            />
          )}
          <text
            x={spotTx}
            y={SPOT_Y}
            textAnchor={spotAnchor}
            className="fill-accent-text font-mono text-[10px]"
          >
            {guard.spotlight.text}
          </text>
        </>
      )}
    </svg>
  );
}

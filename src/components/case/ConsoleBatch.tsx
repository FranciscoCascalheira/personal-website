"use client";

import { useEffect, useRef, useState } from "react";

/** fig. 4 — the lost-ack retry, made a picture.
 *
 *  This is the real mechanism that carried NOS Alive: a mass action commits, its
 *  acknowledgement is lost on venue wifi, and `withDbRetry` re-sends the same
 *  batch. The lever is the only variable — whether a ConsoleActionBatch key was
 *  written as the transaction's first row.
 *
 *  Time runs left to right. The top lane is the request; the track beneath it is
 *  the count of people in the database, because that is what a wrong retry
 *  corrupts. Everything up to the retry is identical between the two levers; only
 *  the last beat differs, so the figure is one picture with one variable.
 *
 *  Ink law (from fig. 4 of the other case): amber marks the moment the bug is
 *  decided (the duplication); green `--positive` marks the guard holding (the
 *  key colliding and refusing to re-run); plain ink is everything factual.
 *
 *  Pure SVG, server-rendered: it prints, and needs no JavaScript to be read —
 *  the lever only swaps which of two true endings is shown.
 */

type Lever = "none" | "batch";

const W = 1000;
const H = 250;
const REQ = 60; // the request lane
const TRACK = 168; // the "people in the database" track
const SPOT = TRACK + 46;

// Beats, pinned. Only the outcome at OUT changes with the lever.
const SEND = 120;
const WRITE = 262;
const COMMIT = 404;
const ACK = 546;
const RETRY = 688;
const OUT = 872;

const levers: { id: Lever; label: string; reading: string }[] = [
  {
    id: "none",
    label: "No batch key",
    reading:
      "The retry has nothing to collide with, so the server runs the whole batch again — twenty people and their hours, a second time.",
  },
  {
    id: "batch",
    label: "ConsoleActionBatch",
    reading:
      "The batch key was the transaction's first row, so it committed with the work. The retry collides on the primary key and returns the stored result instead of re-running.",
  },
];

/** A count label sitting on the track at a given x. */
function Count({ x, n, tone }: { x: number; n: number; tone: string }) {
  return (
    <text
      x={x}
      y={TRACK + 20}
      textAnchor="middle"
      className={`font-mono text-[11px] ${tone}`}
    >
      {n} in DB
    </text>
  );
}

function Timeline({ lever }: { lever: Lever }) {
  const held = lever === "batch";
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label={`The mass-entry retry under ${
        held ? "the ConsoleActionBatch key" : "no batch key"
      }. ${levers.find((l) => l.id === lever)!.reading}`}
    >
      {/* lane + track rules */}
      <text x={0} y={REQ + 3} className="fill-text font-mono text-[11px]">
        request
      </text>
      <line
        x1={92}
        y1={REQ}
        x2={W - 6}
        y2={REQ}
        className="stroke-border"
        strokeWidth={1}
      />
      <text x={0} y={TRACK + 3} className="fill-text-faint font-mono text-[11px]">
        people
      </text>
      <line
        x1={92}
        y1={TRACK}
        x2={W - 6}
        y2={TRACK}
        className="stroke-text-muted"
        strokeWidth={2}
      />

      {/* the lost-ack window: from commit to retry, the client is blind */}
      <rect
        x={ACK}
        y={30}
        width={RETRY - ACK}
        height={TRACK - 30 - 12}
        className="fill-bg-inset"
      />
      {[ACK, RETRY].map((wx) => (
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
        x={(ACK + RETRY) / 2}
        y={22}
        textAnchor="middle"
        className="fill-text-faint font-mono text-[10px] uppercase tracking-[0.14em]"
      >
        ack lost
      </text>

      {/* request beats: send → write → commit → (ack ✗) → retry */}
      {[
        { x: SEND, label: "send", kind: "dot" },
        { x: WRITE, label: "write ×20", kind: "dot" },
        { x: COMMIT, label: "commit", kind: "commit" },
        { x: ACK, label: "✗", kind: "lost" },
        { x: RETRY, label: "retry", kind: "dot" },
      ].map((b) => (
        <g key={b.label}>
          {b.kind === "commit" ? (
            <rect x={b.x - 1.5} y={REQ - 9} width={3} height={18} className="fill-text" />
          ) : b.kind === "lost" ? (
            <text
              x={b.x}
              y={REQ + 4}
              textAnchor="middle"
              className="fill-text-faint font-mono text-[12px]"
            >
              ✗
            </text>
          ) : (
            <rect x={b.x - 3.5} y={REQ - 3.5} width={7} height={7} className="fill-text" />
          )}
          {b.kind !== "lost" && (
            <text
              x={b.x}
              y={REQ - 14}
              textAnchor="middle"
              className="fill-text-faint font-mono text-[10px]"
            >
              {b.label}
            </text>
          )}
        </g>
      ))}

      {/* the write drops 20 people onto the track (causation, drawn) */}
      <line
        x1={WRITE}
        y1={REQ + 8}
        x2={WRITE}
        y2={TRACK - 6}
        className="stroke-text-faint"
        strokeWidth={1}
      />
      <circle cx={WRITE} cy={TRACK} r={3} className="fill-text" />

      {/* count segments: 0 before write, 20 after, then the outcome decides */}
      <Count x={(92 + WRITE) / 2} n={0} tone="fill-text-faint" />
      <Count x={(WRITE + OUT) / 2} n={20} tone="fill-text-muted" />

      {/* the outcome — the only thing the lever moves */}
      <line
        x1={OUT}
        y1={REQ + 8}
        x2={OUT}
        y2={TRACK - 6}
        className={held ? "stroke-positive" : "stroke-accent"}
        strokeWidth={1.5}
      />
      {held ? (
        <>
          {/* the key collides and refuses — the guard holds */}
          <circle
            cx={OUT}
            cy={REQ}
            r={4.5}
            className="fill-bg stroke-positive"
            strokeWidth={1.5}
          />
          <text
            x={OUT}
            y={REQ - 14}
            textAnchor="middle"
            className="fill-positive font-mono text-[10px]"
          >
            P2002
          </text>
          <circle cx={OUT} cy={TRACK} r={3} className="fill-positive" />
          <Count x={(OUT + W - 20) / 2} n={20} tone="fill-positive" />
          <line
            x1={OUT}
            y1={TRACK + 7}
            x2={OUT}
            y2={SPOT - 9}
            className="stroke-positive"
            strokeWidth={1}
          />
          <text
            x={OUT}
            y={SPOT}
            textAnchor="middle"
            className="fill-positive font-mono text-[10px]"
          >
            stored result returned · nothing re-run
          </text>
        </>
      ) : (
        <>
          {/* the batch runs again — twenty more people, twenty more bills */}
          <rect x={OUT - 3.5} y={REQ - 3.5} width={7} height={7} className="fill-accent" />
          <text
            x={OUT}
            y={REQ - 14}
            textAnchor="middle"
            className="fill-accent-text font-mono text-[10px]"
          >
            INSERT ×20
          </text>
          <circle cx={OUT} cy={TRACK} r={3.5} className="fill-accent" />
          <Count x={(OUT + W - 20) / 2} n={40} tone="fill-accent-text" />
          <line
            x1={OUT}
            y1={TRACK + 7}
            x2={OUT}
            y2={SPOT - 9}
            className="stroke-accent"
            strokeWidth={1}
          />
          <text
            x={OUT}
            y={SPOT}
            textAnchor="middle"
            className="fill-accent-text font-mono text-[10px]"
          >
            twenty people, and their hours, duplicated
          </text>
        </>
      )}
    </svg>
  );
}

export function ConsoleBatch() {
  const [lever, setLever] = useState<Lever>("none");
  const btnRefs = useRef(new Map<Lever, HTMLButtonElement>());
  const railRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  // On a phone the rail opens on send → commit, and the outcome the lever
  // actually changes (40-duplicated vs 20-held) sits off the right edge. When
  // the reader toggles, bring the outcome into view so the change is visible.
  // On desktop the rail does not overflow, so this is a no-op.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const r = railRef.current;
    if (r && r.scrollWidth > r.clientWidth)
      r.scrollTo({ left: r.scrollWidth, behavior: "smooth" });
  }, [lever]);

  // Roving tabindex with wrapping arrows, matching the schema explorer.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key))
      return;
    e.preventDefault();
    const order = levers.map((l) => l.id);
    const i = order.indexOf(lever);
    const delta = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
    const next = order[(i + delta + order.length) % order.length];
    setLever(next);
    btnRefs.current.get(next)?.focus();
  };

  const active = levers.find((l) => l.id === lever)!;

  return (
    <figure className="border-y border-border-strong" aria-labelledby="fig4-caption">
      <div className="py-7">
        {/* the lever */}
        <div
          role="radiogroup"
          aria-label="Whether a batch key was written"
          className="flex flex-wrap gap-2"
          onKeyDown={onKeyDown}
        >
          {levers.map((l) => {
            const on = l.id === lever;
            return (
              <button
                key={l.id}
                ref={(el) => {
                  if (el) btnRefs.current.set(l.id, el);
                  else btnRefs.current.delete(l.id);
                }}
                type="button"
                role="radio"
                aria-checked={on}
                tabIndex={on ? 0 : -1}
                onClick={() => setLever(l.id)}
                className={`border-b-2 pb-1 font-mono text-xs transition-colors ${
                  on
                    ? "border-accent text-accent-text"
                    : "border-transparent text-text-muted hover:border-border-strong hover:text-text"
                }`}
              >
                {l.label}
              </button>
            );
          })}
        </div>

        <p className="mt-5 max-w-[46rem] text-sm leading-relaxed text-text-muted">
          <span className="mono-label mr-2">Enter 20 anonymous staff</span>
          {active.reading}
        </p>

        <div
          ref={railRef}
          className="mt-6 overflow-x-auto overscroll-x-contain print:overflow-visible"
        >
          <div className="min-w-[44rem] print:min-w-0">
            <Timeline lever={lever} />
          </div>
        </div>

        {/* the method — the honest 2PC/limits note, like fig. 4 of the other case */}
        <div className="mt-6 border-t border-border pt-5">
          <p className="mono-label mb-2">Method</p>
          <p className="max-w-[46rem] text-sm leading-relaxed text-text-muted">
            The batch key is <span className="font-mono text-xs">ConsoleActionBatch.id</span>,
            written as the first statement of the mass-entry transaction so it
            commits atomically with the twenty inserts. A re-send collides on the
            primary key (Prisma <span className="font-mono text-xs">P2002</span>)
            and returns the stored <span className="font-mono text-xs">result</span>{" "}
            rather than re-executing. Mass exit closes with an atomic{" "}
            <span className="font-mono text-xs">updateMany</span> over still-open
            shifts, so a second manager closing the same bar gets a count of zero,
            not a phantom exit. The same change collapsed twenty per-person
            transactions into one — a measured 101s → 13s for a bar of twenty.
          </p>
        </div>
      </div>

      <figcaption id="fig4-caption" className="border-t border-border-strong py-3">
        <span className="mono-label">
          fig. 4 — the lost-ack retry · commit{" "}
          <span className="font-mono">ece2ce0</span> · the batch key is the referee
        </span>
      </figcaption>
    </figure>
  );
}

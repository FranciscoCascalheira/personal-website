"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  raceGuards,
  raceCaption,
  raceMethod,
  raceEngineWeight,
  raceError,
  raceFinalState,
  type Guard,
  type MatchRow,
} from "@/lib/race";
import type { EngineLine, RaceResult } from "@/lib/race-engine";
import { usePrefersReducedMotion } from "@/lib/motion";
import { RaceTimeline } from "./RaceTimeline";

type Phase = "printed" | "loading" | "running" | "measured" | "error";

/** fig. 4 — the race condition, drawn as time and then actually run.
 *
 *  Three things, in the order a reader needs them:
 *
 *    1. the timeline — what happened, with the race window drawn and the
 *       disputed row running underneath as a track. One screen, no scrolling.
 *    2. the outcome — the matches table itself. "Placed twice" is not a number,
 *       it is two rows with the same young_id, so that is what it shows.
 *    3. the engine log — what was actually done to a real Postgres, including
 *       the two-phase commit the figure uses to interleave. Read-only: this is
 *       a record of what ran, not a console to type into.
 *
 *  Everything above is server-rendered from the same array the engine executes,
 *  so no-JS, mobile, reduced-motion and the print edition get the whole
 *  argument, and the diagram cannot drift from the run.
 */
export function RaceCondition() {
  const [guardId, setGuardId] = useState(raceGuards[0].id);
  const guard = raceGuards.find((g) => g.id === guardId) as Guard;

  const [phase, setPhase] = useState<Phase>("printed");
  const [actual, setActual] = useState<Map<string, string>>(new Map());
  const [lines, setLines] = useState<EngineLine[]>([]);
  const [run, setRun] = useState<RaceResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [head, setHead] = useState(-1);
  const [elapsed, setElapsed] = useState(0);

  const reduced = usePrefersReducedMotion();
  const cancelled = useRef<{ cancelled: boolean }>({ cancelled: false });
  const timer = useRef<number | null>(null);
  const clock = useRef<number | null>(null);
  const leverRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const stopAll = () => {
    if (timer.current !== null) window.clearInterval(timer.current);
    if (clock.current !== null) window.clearInterval(clock.current);
    timer.current = clock.current = null;
  };

  useEffect(() => () => stopAll(), []);

  /** Changing the lever puts the figure back to printed: the previous guard's
   *  measurements are not evidence about this one. */
  const selectGuard = (id: string) => {
    cancelled.current.cancelled = true;
    stopAll();
    setGuardId(id);
    setPhase("printed");
    setActual(new Map());
    setLines([]);
    setRun(null);
    setError(null);
    setHead(-1);
  };

  /** The ARIA radio pattern: one tab stop, arrows move and select within it —
   *  the way fig. 1's map already behaves. */
  const onLeverKey = (e: React.KeyboardEvent) => {
    if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(e.key)) return;
    e.preventDefault();
    const i = raceGuards.findIndex((g) => g.id === guardId);
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
    const next = raceGuards[(i + step + raceGuards.length) % raceGuards.length];
    selectGuard(next.id);
    leverRefs.current.get(next.id)?.focus();
  };

  const start = useCallback(async () => {
    cancelled.current = { cancelled: false };
    const signal = cancelled.current;
    setPhase("loading");
    setError(null);
    setActual(new Map());
    setLines([]);
    setRun(null);
    setHead(-1);

    // A 5.6 MB engine is a long silence on a slow line. Rather than fake a
    // progress bar over a fetch we do not control, count the seconds honestly.
    setElapsed(0);
    const startedAt = Date.now();
    clock.current = window.setInterval(
      () => setElapsed(Math.round((Date.now() - startedAt) / 1000)),
      1000,
    );

    try {
      const { runRace } = await import("@/lib/race-engine");
      if (signal.cancelled) return;
      setPhase("running");
      const got = new Map<string, string>();
      const log: EngineLine[] = [];
      const out = await runRace(
        guard,
        (r) => got.set(r.step.id, r.actual),
        signal,
        (l) => log.push(l),
      );
      if (signal.cancelled) return;
      if (clock.current !== null) window.clearInterval(clock.current);
      setActual(got);
      setLines(log);
      setRun(out);
      setPhase("measured");

      // The playhead walks the timeline so the interleave happens in time
      // rather than merely being reported.
      if (reduced) {
        setHead(guard.steps.length);
        return;
      }
      // Park the head on the first step in the same commit as `measured`.
      // Leaving it at -1 ("printed, show all") until the first tick flashed the
      // whole diagram — flip, BLOCKED, punchline — before the run reached them.
      setHead(0);
      let i = 1;
      timer.current = window.setInterval(() => {
        setHead(i);
        i += 1;
        if (i > guard.steps.length) stopAll();
      }, 260);
    } catch (e) {
      if (signal.cancelled) return;
      stopAll();
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg.length > 120 ? `${msg.slice(0, 117)}…` : msg);
      setPhase("error");
    }
  }, [guard, reduced]);

  const measured = phase === "measured";
  const busy = phase === "loading" || phase === "running";
  const rows: MatchRow[] = measured && run ? run.rows : raceFinalState[guard.id];

  return (
    <figure
      className="border-y border-border-strong"
      aria-labelledby="fig4-caption"
    >
      {/* the lever */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-b border-border py-4">
        <div
          role="radiogroup"
          aria-label="Guard on the confirm"
          onKeyDown={onLeverKey}
          className="no-print flex flex-wrap items-baseline gap-x-5 gap-y-2"
        >
          <span className="mono-label">Guard</span>
          {raceGuards.map((g) => {
            const on = g.id === guardId;
            return (
              <button
                key={g.id}
                type="button"
                role="radio"
                aria-checked={on}
                ref={(el) => {
                  if (el) leverRefs.current.set(g.id, el);
                  else leverRefs.current.delete(g.id);
                }}
                tabIndex={on ? 0 : -1}
                onClick={() => selectGuard(g.id)}
                className={`border-b-2 pb-1 font-mono text-xs transition-colors ${
                  on
                    ? "border-accent text-accent-text"
                    : "border-transparent text-text-muted hover:text-text"
                }`}
              >
                {g.lever}
              </button>
            );
          })}
        </div>
        <p className="font-mono text-xs text-text-faint">
          <span className="text-text">{guard.commit}</span> · {guard.date}
        </p>
      </div>

      {/* 1 — the diagram */}
      <div className="py-6">
        <p className="mb-5 max-w-3xl text-sm leading-relaxed text-text-muted">
          {guard.summary}
        </p>
        {/* A 1000-unit viewBox squeezed into a phone renders its labels at
            ~4px. Below the breakpoint the diagram keeps a legible scale and
            scrolls inside its own rail instead; print gets it whole. */}
        <div className="-mx-1 overflow-x-auto overscroll-x-contain px-1 print:overflow-visible">
          <div className="min-w-[52rem] print:min-w-0">
            <RaceTimeline
              guard={guard}
              actual={measured ? actual : undefined}
              upto={measured ? head : -1}
            />
          </div>
        </div>
        <p className="mono-label mt-2 sm:hidden">scroll the diagram sideways →</p>
        {/* The vocabulary, said once. Without it the leader — the one mark that
            carries the whole lesson — is a line the reader has to guess at. */}
        <p className="mt-3 max-w-3xl font-mono text-xs leading-relaxed text-text-faint">
          key — a hollow mark asks a question · a filled mark writes · the tall
          bar is T1&apos;s commit, which is the flip · a line dropping to
          y_01.status means that step asked the row what it currently says
        </p>
      </div>

      {/* 2 — the outcome: the table, not a number */}
      <div className="border-t border-border py-5">
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
          <p className="mono-label">matches</p>
          <p
            className={`font-mono text-xs ${
              guard.matches > 1 ? "text-text" : "text-positive"
            }`}
          >
            {guard.verdict}
          </p>
        </div>

        <div className="mt-3 overflow-x-auto overscroll-x-contain">
          <table className="min-w-[26rem] border-collapse text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-border">
                {["id", "application_id", "young_id", "vacancy_id"].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="py-1.5 pr-6 font-normal text-text-faint"
                  >
                    {h}
                  </th>
                ))}
                {/* the annotation column is still a column: an empty head
                    leaves its cells with nothing to be described by */}
                <th scope="col" className="py-1.5 font-normal text-text-faint">
                  <span className="sr-only">note</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                // The second row is the bug, stated as a fact about a person.
                const dup = rows.findIndex((o) => o.young_id === r.young_id) !== i;
                return (
                  <tr key={r.id} className="border-b border-border last:border-b-0">
                    <td className="py-1.5 pr-8 text-text">{r.id}</td>
                    <td className="py-1.5 pr-6 text-text">{r.application_id}</td>
                    <td
                      className={`py-1.5 pr-6 ${dup ? "text-accent-text" : "text-text"}`}
                    >
                      {r.young_id}
                    </td>
                    <td className="py-1.5 pr-6 text-text">{r.vacancy_id}</td>
                    <td className="whitespace-nowrap py-1.5 text-accent-text">
                      {dup ? "← the same candidate, placed again" : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {guard.matches === 1 && (
          <p className="mt-3 max-w-3xl border-l-2 border-border-strong pl-3 font-mono text-xs leading-relaxed text-text-muted">
            <span className="text-positive">{raceError.status}</span> —{" "}
            <span className="text-text">&ldquo;{raceError.message}&rdquo;</span>
            <span className="text-text-faint"> · {raceError.source}</span>
          </p>
        )}

        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-text-muted">
          {guard.reading}
        </p>

        {measured && run && !run.agrees && (
          <p className="mt-3 max-w-3xl border-l-2 border-accent pl-3 font-mono text-xs leading-relaxed text-accent-text">
            The run disagrees with the printed figure: Postgres returned{" "}
            {run.matches} row{run.matches === 1 ? "" : "s"} where this figure
            claims {guard.matches}. Trust the run, not the print — and tell me,
            because one of the two is wrong.
          </p>
        )}
      </div>

      {/* 3 — the ask, and then what the engine actually did */}
      <div className="no-print border-t border-border py-5">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <button
            type="button"
            onClick={start}
            disabled={busy}
            aria-describedby="fig4-run-note"
            className="border border-border-strong px-4 py-2 font-mono text-xs text-text transition-colors hover:border-accent hover:text-accent-text disabled:cursor-progress disabled:text-text-faint"
          >
            {phase === "printed" && "Fire both confirmations →"}
            {phase === "loading" &&
              `Fetching PostgreSQL — ${raceEngineWeight} · ${elapsed}s`}
            {phase === "running" && "Racing…"}
            {measured && "Run it again →"}
            {phase === "error" && "Try again →"}
          </button>

          <p
            id="fig4-run-note"
            aria-live="polite"
            className="font-mono text-xs text-text-faint"
          >
            {phase === "printed" &&
              `Loads a real ${raceEngineWeight} Postgres, compiled to WebAssembly — only if you ask.`}
            {phase === "loading" &&
              "A whole Postgres, arriving. It is cached after this."}
            {phase === "running" && "Two transactions, one instant."}
            {measured && run && (
              <>
                <span className="text-text">measured</span> · {run.version} ·{" "}
                {run.ms} ms · in this page, not the production database
              </>
            )}
            {phase === "error" && (
              <span className="text-accent-text">
                The database did not start: {error}
              </span>
            )}
          </p>
        </div>

        {lines.length > 0 && <EngineLog lines={lines} />}
      </div>

      {/* the three guards, side by side — the part that prints */}
      <div className="border-t border-border-strong py-5">
        <p className="mono-label">The three guards</p>
        <dl className="mt-3">
          {raceGuards.map((g) => (
            <div
              key={g.id}
              className="grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 border-b border-border py-2.5 last:border-b-0 sm:grid-cols-[minmax(0,18rem)_6rem_minmax(0,1fr)]"
            >
              <dt
                className={`font-mono text-xs ${
                  g.id === guardId ? "text-text" : "text-text-muted"
                }`}
              >
                {g.lever}
              </dt>
              <dd className="text-right font-mono text-xs text-text-faint sm:text-left">
                {g.commit}
              </dd>
              <dd
                className={`col-span-2 font-mono text-xs sm:col-span-1 ${
                  g.matches > 1 ? "text-text-muted" : "text-positive"
                }`}
              >
                {g.verdict}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="border-t border-border py-4">
        <p className="mono-label">Method</p>
        <p className="measure mt-2 text-sm leading-relaxed text-text-faint">
          {raceMethod}
        </p>
      </div>

      <figcaption id="fig4-caption" className="border-t border-border py-3">
        <span className="mono-label">{raceCaption}</span>
      </figcaption>
    </figure>
  );
}

/** What was really done to the database, in the order it was really done —
 *  which is not the reader's order, because the interleave is built out of
 *  two-phase commit. That difference is the interesting part, so it is shown
 *  rather than smoothed over. */
function EngineLog({ lines }: { lines: EngineLine[] }) {
  return (
    <div className="mt-5">
      <p className="mono-label mb-2">
        What the engine did · in the order it really happened
      </p>
      <ol className="max-h-64 overflow-y-auto border-l border-border pl-3">
        {lines.map((l, i) => (
          <li
            key={i}
            className="flex flex-wrap items-baseline gap-x-3 py-0.5 font-mono text-[11px] leading-relaxed"
          >
            <span
              className={`w-5 shrink-0 ${
                l.actor === "T2" ? "text-text-muted" : "text-text-faint"
              }`}
            >
              {l.actor ?? ""}
            </span>
            {/* The 409 is the guard holding, so it is green here exactly as it
                is on the diagram and in the verdict — one fact, one hue. Other
                transaction control is structure, not accent. */}
            <span
              className={
                l.kind === "note"
                  ? "italic text-text-faint"
                  : l.kind === "ctl"
                    ? "text-text-muted"
                    : l.kind === "boot"
                      ? "text-text-muted"
                      : "min-w-0 break-all text-text"
              }
            >
              {l.text}
            </span>
            {l.out && (
              <span
                className={
                  l.out === String(raceError.status)
                    ? "text-positive"
                    : "text-text-faint"
                }
              >
                → {l.out}
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

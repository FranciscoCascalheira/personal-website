"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  raceGuards,
  raceCaption,
  raceMethod,
  raceEngineWeight,
  raceError,
  type Guard,
  type RaceStep,
} from "@/lib/race";
import type { RaceResult, StepResult } from "@/lib/race-engine";
import { usePrefersReducedMotion } from "@/lib/motion";

type Phase = "printed" | "loading" | "running" | "measured" | "error";

/** fig. 4 — the race condition, set as a court transcript and then run.
 *
 *  Two transactions, two columns, one time axis down the left: the shape of an
 *  interleave, in ink. The whole document is here before any JavaScript runs —
 *  the steps, the results, the verdict, and the three guards side by side — so
 *  a reader with no JS, a phone, reduced motion or a printer gets the entire
 *  argument. The live Postgres is an upgrade on top, behind an explicit ask,
 *  because the colophon promises it loads only on demand.
 *
 *  The printed results and the executed statements come from the same array in
 *  race.ts, so the diagram cannot drift from the run. If Postgres ever answers
 *  something other than what is printed, the figure says so rather than
 *  quietly re-rendering.
 */
export function RaceCondition() {
  const [guardId, setGuardId] = useState(raceGuards[0].id);
  const guard = raceGuards.find((g) => g.id === guardId) as Guard;

  const [phase, setPhase] = useState<Phase>("printed");
  const [results, setResults] = useState<Map<string, StepResult>>(new Map());
  const [run, setRun] = useState<RaceResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shown, setShown] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const reduced = usePrefersReducedMotion();
  const cancelled = useRef<{ cancelled: boolean }>({ cancelled: false });
  const timer = useRef<number | null>(null);
  const clock = useRef<number | null>(null);
  const leverRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const stopReveal = () => {
    if (timer.current !== null) window.clearInterval(timer.current);
    timer.current = null;
  };

  const stopClock = () => {
    if (clock.current !== null) window.clearInterval(clock.current);
    clock.current = null;
  };

  // Changing the lever puts the figure back to its printed state: the previous
  // guard's measurements are not evidence about this one.
  const selectGuard = (id: string) => {
    cancelled.current.cancelled = true;
    stopReveal();
    stopClock();
    setGuardId(id);
    setPhase("printed");
    setResults(new Map());
    setRun(null);
    setError(null);
    setShown(0);
  };

  useEffect(
    () => () => {
      stopReveal();
      stopClock();
    },
    [],
  );

  const start = useCallback(async () => {
    cancelled.current = { cancelled: false };
    const signal = cancelled.current;
    setPhase("loading");
    setError(null);
    setResults(new Map());
    setRun(null);
    setShown(0);

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
      const collected: StepResult[] = [];
      const out = await runRace(guard, (r) => collected.push(r), signal);
      if (signal.cancelled) return;
      stopClock();
      setResults(new Map(collected.map((r) => [r.step.id, r])));
      setRun(out);
      setPhase("measured");

      // The wave travels down the transcript in tick order — the only way to
      // watch an interleave happen in time rather than read that it did.
      if (reduced) {
        setShown(guard.steps.length);
        return;
      }
      let i = 0;
      timer.current = window.setInterval(() => {
        i += 1;
        setShown(i);
        if (i >= guard.steps.length) stopReveal();
      }, 90);
    } catch (e) {
      if (signal.cancelled) return;
      stopClock();
      // Kept to one line: an unbounded WASM stack would break the band.
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg.length > 120 ? `${msg.slice(0, 117)}…` : msg);
      setPhase("error");
    }
  }, [guard, reduced]);

  /** The ARIA radio pattern: the group is a single tab stop and the arrows
   *  move — and select — within it, the way fig. 1's map already behaves. */
  const onLeverKey = (e: React.KeyboardEvent) => {
    const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    const i = raceGuards.findIndex((g) => g.id === guardId);
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
    const next = raceGuards[(i + step + raceGuards.length) % raceGuards.length];
    selectGuard(next.id);
    leverRefs.current.get(next.id)?.focus();
  };

  const measured = phase === "measured";
  const busy = phase === "loading" || phase === "running";

  return (
    <figure
      className="border-y border-border-strong"
      aria-labelledby="fig4-caption"
    >
      {/* the lever */}
      <div className="border-b border-border py-5">
        {/* On paper the levers are inert, and the line below already names the
            guard — so they stay out of the print edition. */}
        <div
          role="radiogroup"
          aria-label="Guard on the confirm"
          onKeyDown={onLeverKey}
          className="no-print flex flex-wrap items-baseline gap-x-2 gap-y-2"
        >
          <span className="mono-label mr-2">Guard</span>
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
                // a radiogroup is one tab stop; the arrows move within it
                tabIndex={on ? 0 : -1}
                onClick={() => selectGuard(g.id)}
                // selected the way fig. 1 selects: a rule, not a filled chip
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

        <p className="mt-4 font-mono text-xs text-text-faint">
          <span className="text-text">{guard.commit}</span> · {guard.date}
        </p>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-text-muted">
          {guard.summary}
        </p>
      </div>

      {/* the transcript — the figure proper, given the air to be one */}
      <div className="relative py-8">
        {/* the time axis: one continuous rule down the column boundary, drawn
            once rather than stitched out of each row's border */}
        <span
          aria-hidden
          className="absolute inset-y-8 hidden w-px bg-border sm:block"
          style={{ left: "calc(50% + 2.25rem)" }}
        />
        {/* Column heads only mean anything once there are two columns. Below
            sm the transactions stack into one, and each row carries its own
            actor tag — a "T1" head over a column holding both would lie. */}
        <div className="hidden gap-x-4 border-b border-border pb-3 sm:grid sm:grid-cols-[2.5rem_1fr_1fr]">
          <span className="mono-label">t</span>
          <span className="mono-label">T1 — company A confirms</span>
          <span className="mono-label sm:pl-6">T2 — company B confirms</span>
        </div>

        <ol>
          {guard.steps.map((step, i) => (
            <StepRow
              key={step.id}
              step={step}
              tick={i + 1}
              result={results.get(step.id)}
              revealed={measured && shown > i}
              pending={(busy || measured) && !(measured && shown > i)}
            />
          ))}
        </ol>
      </div>

      {/* the verdict */}
      <div className="border-t border-border py-5">
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
          <p className="mono-label">Verdict</p>
          {/* the words carry the outcome; green is kept for the guard holding */}
          <p
            className={`font-mono text-xs ${
              guard.matches > 1 ? "text-text" : "text-positive"
            }`}
          >
            {guard.verdict}
            <span className="text-text-faint"> · </span>
            <span className="tabular-nums">
              matches = {measured && run ? run.matches : guard.matches}
            </span>
          </p>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-muted">
          {guard.reading}
        </p>

        {measured && run && !run.agrees && (
          <p className="mt-3 max-w-3xl border-l-2 border-accent pl-3 font-mono text-xs leading-relaxed text-accent-text">
            The run disagrees with the printed diagram: Postgres returned{" "}
            {run.matches} match{run.matches === 1 ? "" : "es"} where this figure
            claims {guard.matches}. Trust the run, not the print — and tell me,
            because one of the two is wrong.
          </p>
        )}
      </div>

      {/* the ask — nothing above loaded a byte of Postgres */}
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

        {/* the refusal itself, in the words the losing company actually gets */}
        <p className="mt-4 max-w-3xl border-l-2 border-border-strong pl-3 font-mono text-xs leading-relaxed text-text-muted">
          <span className="text-positive">{raceError.status}</span> —{" "}
          <span className="text-text">&ldquo;{raceError.message}&rdquo;</span>
          <span className="text-text-faint"> · {raceError.source}</span>
        </p>
      </div>

      {/* how the interleave is produced, said out loud — marginalia, not a
          peer of the verdict */}
      <div className="border-t border-border py-4">
        <p className="mono-label">Method</p>
        <p className="mt-2 max-w-3xl text-xs leading-relaxed text-text-faint">
          {raceMethod}
        </p>
      </div>

      <figcaption id="fig4-caption" className="border-t border-border py-3">
        <span className="mono-label">{raceCaption}</span>
      </figcaption>
    </figure>
  );
}

/** One tick of the interleave.
 *
 *  The ink law, so amber keeps exactly one job: amber marks the instant the
 *  race is decided (the tick and its result) — and a disagreement, which is the
 *  only other thing worth interrupting a reader for. Green is the site's
 *  reserved "holding" ink and marks the refusal: a 409 here is the guard
 *  working, not a failure. Everything else is plain ink. The results are
 *  verified ground truth, so they are set in full ink when printed; they only
 *  fall back to faint while a live run is re-measuring them, which is what the
 *  wave down the transcript is. */
function StepRow({
  step,
  tick,
  result,
  revealed,
  pending,
}: {
  step: RaceStep;
  tick: number;
  result?: StepResult;
  revealed: boolean;
  pending: boolean;
}) {
  const value = revealed && result ? result.actual : step.expect;
  const disagrees = revealed && result ? !result.agrees : false;
  const emphasis = step.decisive || disagrees;

  const resultInk = emphasis
    ? "text-accent-text"
    : step.kind === "abort"
      ? "text-positive"
      : pending
        ? "text-text-faint"
        : "text-text";

  const cell = (
    <div className="min-w-0">
      <span className="mono-label sm:hidden">{step.actor}</span>
      <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-text">
        {step.sql}
      </pre>
      <p
        className={`mt-1 font-mono text-xs transition-colors duration-150 ${resultInk}`}
        style={{ transitionTimingFunction: "var(--ease-press)" }}
      >
        <span aria-hidden>→ </span>
        <span className="sr-only">result: </span>
        {value}
        {disagrees && (
          <span className="text-text"> (printed: {step.expect})</span>
        )}
      </p>
      {step.note && (
        <p className="mt-1.5 max-w-md text-xs leading-relaxed text-text-muted">
          {step.note}
        </p>
      )}
    </div>
  );

  return (
    <li className="grid break-inside-avoid grid-cols-[2.5rem_1fr] gap-x-4 border-b border-border py-3 last:border-b-0 sm:grid-cols-[2.5rem_1fr_1fr]">
      <span
        className={`font-mono text-xs tabular-nums ${
          step.decisive ? "text-accent-text" : "text-text-faint"
        }`}
      >
        {String(tick).padStart(2, "0")}
      </span>

      <div className={step.actor === "T1" ? "" : "hidden sm:block"}>
        {step.actor === "T1" ? cell : null}
      </div>
      <div
        className={`sm:pl-6 ${step.actor === "T2" ? "" : "hidden sm:block"}`}
      >
        {step.actor === "T2" ? cell : null}
      </div>
    </li>
  );
}

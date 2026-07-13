"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** The gate for the fig. 0 depth layer. Renders the stage/card pair around the
 *  server-rendered SVG plate and, only on capable clients — fine pointer,
 *  ≥640px, motion allowed, WebGL — lazily imports the Three.js module once the
 *  plate is in view and the main thread is idle. Everything else (mobile,
 *  touch, reduced motion, no JS, no WebGL, import failure) keeps the SVG
 *  engraving, which is the document of record.
 */
export function Fig0Depth({ children }: { children: ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const forced = window.location.hash === "#plate3d"; // debugging hook
    if (
      !forced &&
      (reducedMotion.matches ||
        !window.matchMedia("(pointer: fine)").matches ||
        !window.matchMedia("(min-width: 640px)").matches)
    ) {
      return;
    }
    // probe WebGL before paying for the three chunk
    const probe = document.createElement("canvas");
    if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;
    let idleHandle: number | undefined;
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
    let firstVisibleAt = 0;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        firstVisibleAt = performance.now();
        const run = async () => {
          try {
            const mod = await import("@/lib/plate-depth");
            if (cancelled) return;
            // if the SVG etch just played, don't re-etch in 3D — the
            // crossfade is the handover
            const skipIntro = performance.now() - firstVisibleAt < 4000;
            cleanup = mod.mountPlateDepth(stage, { skipIntro });
          } catch (err) {
            // network or WebGL failure — the flat plate stands
            if (process.env.NODE_ENV !== "production") {
              console.warn("fig. 0 depth layer failed to mount:", err);
            }
          }
        };
        if ("requestIdleCallback" in window) {
          idleHandle = requestIdleCallback(run, { timeout: 2000 });
        } else {
          timeoutHandle = setTimeout(run, 700);
        }
      },
      { threshold: 0.2 },
    );
    io.observe(stage);

    // if the user turns on reduced motion mid-session, stand down to the SVG
    const onMotionChange = () => {
      if (reducedMotion.matches && !forced) {
        cleanup?.();
        cleanup = undefined;
      }
    };
    reducedMotion.addEventListener("change", onMotionChange);

    return () => {
      cancelled = true;
      io.disconnect();
      reducedMotion.removeEventListener("change", onMotionChange);
      if (idleHandle !== undefined && "cancelIdleCallback" in window) {
        cancelIdleCallback(idleHandle);
      }
      if (timeoutHandle !== undefined) clearTimeout(timeoutHandle);
      cleanup?.();
    };
  }, []);

  return (
    <div ref={stageRef} className="plate-stage">
      <div className="plate-card relative">{children}</div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import type { Influence } from "@/lib/influences";
import type { BustController } from "@/lib/bust-scene";

type Bust = NonNullable<Influence["bust"]>;

/** The marble plate in the fig. A margin. On capable clients (≥640px, WebGL)
 *  it engraves the selected thinker's real museum scan — but only once the
 *  plate has scrolled into view and the main thread is idle, the same gate
 *  fig. 0 uses: the marble arrives on demand, as the colophon claims.
 *  Reduced-motion holds a still pose. Everyone else sees only the credit
 *  line — no fake portrait, no placeholder. When two thinkers share one
 *  stone (the Socrates–Seneca herm), switching between them turns the same
 *  marble instead of reloading it.
 */
export function BustPlate({ bust }: { bust: Bust }) {
  const figRef = useRef<HTMLElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<BustController | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const fig = figRef.current;
    if (!fig) return;
    if (!window.matchMedia("(min-width: 640px)").matches) return;
    const probe = document.createElement("canvas");
    if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) return;

    let cancelled = false;
    let idleHandle: number | undefined;
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ink = () =>
      getComputedStyle(document.documentElement).getPropertyValue("--text").trim();

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const run = async () => {
          try {
            const mod = await import("@/lib/bust-scene");
            if (cancelled || !boxRef.current) return;
            const controller = mod.mountBust(boxRef.current, {
              ink: ink(),
              reducedMotion: reduced,
            });
            if (!controller) return;
            controllerRef.current = controller;
            if (process.env.NODE_ENV !== "production") {
              (window as unknown as Record<string, unknown>).__bust = controller;
            }
            setActive(true);
          } catch {
            // chunk or GL failure — the credit line stands alone
          }
        };
        if ("requestIdleCallback" in window) {
          idleHandle = requestIdleCallback(run, { timeout: 2000 });
        } else {
          timeoutHandle = setTimeout(run, 500);
        }
      },
      { threshold: 0.15 },
    );
    io.observe(fig);

    const themeObserver = new MutationObserver(() =>
      controllerRef.current?.setInk(ink()),
    );
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      cancelled = true;
      io.disconnect();
      themeObserver.disconnect();
      if (idleHandle !== undefined && "cancelIdleCallback" in window) {
        cancelIdleCallback(idleHandle);
      }
      if (timeoutHandle !== undefined) clearTimeout(timeoutHandle);
      controllerRef.current?.dispose();
      controllerRef.current = null;
    };
  }, []);

  // every bust change re-poses the same mounted scene
  useEffect(() => {
    if (active) controllerRef.current?.show(bust);
  }, [active, bust]);

  return (
    <figure ref={figRef} className="mt-5 hidden sm:block">
      <div
        ref={boxRef}
        className={`bust-stage relative w-full overflow-hidden border border-border bg-bg-elevated transition-[height] ${
          active ? "aspect-[4/3]" : "h-0 border-0"
        }`}
      />
      <figcaption
        className={`flex items-baseline justify-between gap-4 border-b border-border pb-2 font-mono text-[0.68rem] font-medium text-text-faint ${
          active ? "mt-3" : "mt-0 border-t pt-2"
        }`}
      >
        <span>{bust.credit}</span>
      </figcaption>
    </figure>
  );
}

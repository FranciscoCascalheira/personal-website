"use client";

import { useEffect, useRef, useState } from "react";
import type { Influence } from "@/lib/influences";
import { portraitPlates } from "@/lib/portrait-plates";
import type { BustController } from "@/lib/bust-scene";

/** The plate in the fig. A margin. Every covered thinker gets a static
 *  engraved plate (pre-engraved by scripts/engrave.py from a
 *  license-checked source — credit under each). Both theme variants are in
 *  the DOM; CSS shows the right one, and print always gets the ivory ink.
 *
 *  The three with museum marble upgrade progressively: on capable clients
 *  (≥640px, WebGL), once the plate is in view and the thread is idle, the
 *  live Three.js engraving mounts over the static plate — which doubles as
 *  its loading state. The GL scene is armed once and persists across
 *  selection changes, so walking Socrates → Seneca turns the same stone.
 */
export function PortraitPlate({ influence }: { influence: Influence }) {
  const plate = portraitPlates[influence.id];
  const bust = influence.bust;

  const figRef = useRef<HTMLElement>(null);
  const glBoxRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<BustController | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const armedRef = useRef(false);
  const bustRef = useRef(bust);
  const [glActive, setGlActive] = useState(false);

  // keep a ref of the current selection for the async mount path
  useEffect(() => {
    bustRef.current = bust;
  }, [bust]);

  // arm the GL machinery once, the first time a marble thinker is selected
  useEffect(() => {
    if (!bust || armedRef.current) return;
    const fig = figRef.current;
    if (!fig) return;
    if (!window.matchMedia("(min-width: 640px)").matches) return;
    const probe = document.createElement("canvas");
    if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) return;
    armedRef.current = true;

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
            if (cancelled || !glBoxRef.current) return;
            const controller = mod.mountBust(glBoxRef.current, {
              ink: ink(),
              reducedMotion: reduced,
            });
            if (!controller) return;
            controllerRef.current = controller;
            if (process.env.NODE_ENV !== "production") {
              (window as unknown as Record<string, unknown>).__bust = controller;
            }
            if (bustRef.current) controller.show(bustRef.current);
            setGlActive(true);
          } catch {
            // chunk or GL failure — the static plate stands
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

    cleanupRef.current = () => {
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
  }, [bust]);

  // dispose only when the whole figure leaves the tree
  useEffect(() => () => cleanupRef.current?.(), []);

  // every selection change re-poses the mounted stone (the herm turn)
  useEffect(() => {
    if (bust && controllerRef.current) controllerRef.current.show(bust);
  }, [bust]);

  if (!plate && !bust) return null;
  const showGl = glActive && !!bust;

  return (
    <figure ref={figRef} className="mt-5">
      <div className="relative aspect-[4/3] w-full overflow-hidden border border-border bg-bg-elevated">
        {plate && (
          <>
            {/* the ivory variant loads eagerly: it is also what PRINTS,
                and a hidden lazy image would never be fetched */}
            <img
              src={plate.light}
              alt={`Engraved plate — ${influence.name}`}
              loading="eager"
              decoding="async"
              className="plate-img-light absolute inset-0 h-full w-full object-cover"
            />
            <img
              src={plate.dark}
              alt={`Engraved plate — ${influence.name}`}
              loading="lazy"
              decoding="async"
              className="plate-img-dark absolute inset-0 h-full w-full object-cover"
            />
          </>
        )}
        <div
          ref={glBoxRef}
          className={`absolute inset-0 transition-opacity duration-300 ease-[var(--ease-press)] ${
            showGl ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        />
      </div>
      <figcaption className="mt-3 flex items-baseline justify-between gap-4 border-b border-border pb-2 font-mono text-[0.68rem] font-medium text-text-faint">
        {showGl || !plate?.source ? (
          <span>{showGl ? bust!.credit : (plate?.credit ?? bust?.credit)}</span>
        ) : (
          <a
            href={plate.source}
            target="_blank"
            rel="noreferrer"
            className="accent-underline"
          >
            {plate.credit}
          </a>
        )}
      </figcaption>
    </figure>
  );
}

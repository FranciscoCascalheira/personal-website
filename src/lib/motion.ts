"use client";

import { useEffect, useRef, useState } from "react";

/** True when the visitor asked for reduced motion. SSR-safe (false first). */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

/** Fires once when the element first scrolls into view. */
export function useInView<T extends HTMLElement>(rootMargin = "0px 0px -12% 0px") {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.25, rootMargin },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [rootMargin]);
  return { ref, inView };
}

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * Counts a numeric target up from zero once `active` turns true. Non-numeric
 * values (e.g. "Live", "MVC") are returned verbatim, never animated.
 * Preserves a trailing suffix such as the "+" in "380+".
 */
export function useCountUp(raw: string, active: boolean, duration = 1100) {
  const match = raw.match(/^(\d[\d,]*)(.*)$/);
  const target = match ? parseInt(match[1].replace(/,/g, ""), 10) : null;
  const suffix = match ? match[2] : "";
  const reduced = usePrefersReducedMotion();

  // Only the running animation drives state; every static case is derived
  // below, so the effect never calls setState synchronously.
  const [animated, setAnimated] = useState<string | null>(null);

  const shouldAnimate = target !== null && !reduced && active;

  useEffect(() => {
    if (!shouldAnimate) return;
    let frame = 0;
    let start: number | null = null;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const current = Math.round(easeOutExpo(p) * (target as number));
      setAnimated(`${current.toLocaleString("en-US")}${suffix}`);
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [shouldAnimate, target, suffix, duration]);

  if (target === null) return raw;
  if (reduced) return raw;
  if (!active) return `0${suffix}`;
  return animated ?? `0${suffix}`;
}

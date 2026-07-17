"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  className?: string;
  /** Above-the-fold content that is in view on load. Skips the
   *  IntersectionObserver and plays the same rise-in as a pure-CSS load
   *  animation (`.reveal-load`), so it paints on first render instead of
   *  waiting for hydration — the difference between a ~1s and a ~3s LCP on a
   *  slow phone. Do not use for content below the fold; it would animate
   *  before it is seen. */
  immediate?: boolean;
};

/** Fades + lifts its children into view once, when scrolled to.
 *  Reduced-motion visitors get the content immediately — handled in CSS,
 *  so the observer never needs to force state for them. */
export function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  className = "",
  immediate = false,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (immediate) return;
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [immediate]);

  if (immediate) {
    return (
      <Tag
        className={`reveal-load ${className}`}
        style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
      >
        {children}
      </Tag>
    );
  }

  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`}
      data-revealed={revealed}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}

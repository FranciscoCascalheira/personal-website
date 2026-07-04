"use client";

import { useEffect, useState } from "react";

/**
 * A genuinely live Porto local-time readout, so the pulsing status dot on the
 * "Currently" card reflects something real rather than a hardcoded claim.
 * Renders nothing until mounted to avoid an SSR/client mismatch.
 */
export function LiveClock({ className = "" }: { className?: string }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const fmt = () =>
      new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Europe/Lisbon",
      }).format(new Date());
    const kick = setTimeout(() => setTime(fmt()), 0);
    const id = setInterval(() => setTime(fmt()), 1000);
    return () => {
      clearTimeout(kick);
      clearInterval(id);
    };
  }, []);

  return (
    <span className={className} suppressHydrationWarning>
      {time ?? "··:··:··"}
    </span>
  );
}

/** Whether it's plausibly working hours in Porto — a small honest touch. */
function porToHour() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    hour12: false,
    timeZone: "Europe/Lisbon",
  }).formatToParts(new Date());
  return parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
}

export function LiveStatusHeader() {
  const [awake, setAwake] = useState(true);
  useEffect(() => {
    const update = () => {
      const h = porToHour();
      setAwake(h >= 8 && h < 24);
    };
    const kick = setTimeout(update, 0);
    const id = setInterval(update, 60_000);
    return () => {
      clearTimeout(kick);
      clearInterval(id);
    };
  }, []);

  return (
    <p className="mono-label flex items-center gap-2">
      <span className="relative flex size-1.5" aria-hidden>
        <span
          className={`absolute inline-flex size-full rounded-full ${
            awake ? "animate-ping bg-positive/70" : "bg-text-faint"
          }`}
        />
        <span
          className={`relative inline-flex size-1.5 rounded-full ${
            awake ? "bg-positive" : "bg-text-faint"
          }`}
        />
      </span>
      Currently
      <span className="text-text-faint">·</span>
      <LiveClock className="font-mono tabular-nums normal-case tracking-normal" />
      <span className="text-text-faint">Porto</span>
    </p>
  );
}

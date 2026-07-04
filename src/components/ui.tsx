"use client";

import type { Project } from "@/lib/data";
import { useCountUp, useInView } from "@/lib/motion";

const statusColor: Record<Project["status"], string> = {
  "In production": "bg-positive",
  Shipped: "bg-accent",
  Delivered: "bg-text-faint",
};

export function StatusBadge({ status }: { status: Project["status"] }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-text-muted">
      <span className={`size-1.5 rounded-full ${statusColor[status]}`} aria-hidden />
      {status}
    </span>
  );
}

export function StackChips({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-md border border-border bg-bg-inset px-2.5 py-1 font-mono text-xs text-text-muted"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

export function CountMetric({
  value,
  label,
  active,
  className = "text-xl font-medium tabular-nums text-text",
}: {
  value: string;
  label: string;
  active: boolean;
  className?: string;
}) {
  const shown = useCountUp(value, active);
  return (
    <div>
      <dt className={className}>{shown}</dt>
      <dd className="mono-label mt-1">{label}</dd>
    </div>
  );
}

export function MetricRow({ metrics }: { metrics: Project["metrics"] }) {
  const { ref, inView } = useInView<HTMLDListElement>();
  return (
    <dl ref={ref} className="flex flex-wrap gap-x-8 gap-y-4">
      {metrics.map((m) => (
        <CountMetric key={m.label} value={m.value} label={m.label} active={inView} />
      ))}
    </dl>
  );
}

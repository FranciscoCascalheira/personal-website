"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { influences, clusters } from "@/lib/influences";
import { BustPlate } from "./BustPlate";

type Line = { x1: number; y1: number; x2: number; y2: number; strong?: boolean };

/** fig. A — the influence map, typeset as a document plate.
 *
 *  The same construction as fig. 1 on the case study: names set directly on
 *  the paper as typographic nodes, the selected thinker's real relationships
 *  drawn as amber hairlines measured from live DOM rects. Lines are the
 *  union of outgoing and incoming debts, so selecting Cervantes lights the
 *  same wire as selecting Girard. One relationship — the cave and the
 *  machine — is set heavier: it is the sentence the whole site keeps
 *  repeating.
 */
export function InfluenceMap() {
  const [selectedId, setSelectedId] = useState<string>("plato");
  const mapRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef(new Map<string, HTMLButtonElement>());
  const [lines, setLines] = useState<Line[]>([]);

  const selected = useMemo(
    () => influences.find((i) => i.id === selectedId) ?? influences[0],
    [selectedId],
  );

  // a thinker's connections = outgoing links ∪ incoming links.
  // Invariant: an incoming link's label is rendered on BOTH ends, so labels
  // must read correctly from either direction ("his teacher" would not —
  // write reciprocal links explicitly in the data when the label is one-way).
  const connections = useMemo(() => {
    const out = selected.links.map((l) => ({ ...l }));
    const seen = new Set(out.map((l) => l.to));
    for (const other of influences) {
      if (other.id === selected.id) continue;
      for (const l of other.links) {
        if (l.to === selected.id && !seen.has(other.id)) {
          out.push({ to: other.id, label: l.label, strong: l.strong });
          seen.add(other.id);
        }
      }
    }
    return out;
  }, [selected]);

  const relatedIds = useMemo(
    () => new Set(connections.map((c) => c.to)),
    [connections],
  );

  const measure = useCallback(() => {
    const map = mapRef.current;
    const from = nodeRefs.current.get(selected.id);
    if (!map || !from) return;
    const mapRect = map.getBoundingClientRect();
    const a = from.getBoundingClientRect();
    const next: Line[] = [];
    for (const c of connections) {
      const toEl = nodeRefs.current.get(c.to);
      if (!toEl) continue;
      const b = toEl.getBoundingClientRect();
      next.push({
        x1: a.left + a.width / 2 - mapRect.left,
        y1: a.top + a.height / 2 - mapRect.top,
        x2: b.left + b.width / 2 - mapRect.left,
        y2: b.top + b.height / 2 - mapRect.top,
        strong: c.strong,
      });
    }
    setLines(next);
  }, [selected, connections]);

  useLayoutEffect(measure, [measure]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(map);
    return () => ro.disconnect();
  }, [measure]);

  // Roving arrow-key navigation across the flat order.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.key))
      return;
    e.preventDefault();
    const order = influences.map((i) => i.id);
    const i = order.indexOf(selectedId);
    const delta = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
    const nextId = order[(i + delta + order.length) % order.length];
    setSelectedId(nextId);
    nodeRefs.current.get(nextId)?.focus();
  };

  return (
    <figure
      className="border-y border-border-strong"
      aria-labelledby="figA-caption"
    >
      <div className="grid lg:grid-cols-[1.2fr_1fr]">
        {/* the map — thinkers set as type, debts drawn as ink */}
        <div
          ref={mapRef}
          className="relative border-b border-border py-7 lg:border-b-0 lg:border-r lg:pr-10"
          onKeyDown={onKeyDown}
          role="listbox"
          aria-label="Influences. Use the arrow keys to move between thinkers."
        >
          <svg
            className="no-print pointer-events-none absolute inset-0 h-full w-full"
            aria-hidden
          >
            {lines.map((l, i) => (
              <g key={i}>
                <line
                  x1={l.x1}
                  y1={l.y1}
                  x2={l.x2}
                  y2={l.y2}
                  stroke="var(--accent)"
                  strokeOpacity={l.strong ? 0.85 : 0.5}
                  strokeWidth={l.strong ? 1.8 : 1}
                />
                <circle
                  cx={l.x2}
                  cy={l.y2}
                  r={2.5}
                  fill="var(--accent)"
                  fillOpacity={0.8}
                />
              </g>
            ))}
          </svg>

          <div className="relative space-y-6">
            {clusters.map((c) => (
              <div key={c.id} role="group" aria-label={c.label}>
                <p className="mono-label mb-2.5" aria-hidden>
                  {c.label}
                </p>
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {influences
                    .filter((i) => i.cluster === c.id)
                    .map((i) => {
                      const isSelected = i.id === selected.id;
                      const isRelated = relatedIds.has(i.id);
                      return (
                        <button
                          key={i.id}
                          ref={(el) => {
                            if (el) nodeRefs.current.set(i.id, el);
                            else nodeRefs.current.delete(i.id);
                          }}
                          type="button"
                          role="option"
                          tabIndex={isSelected ? 0 : -1}
                          aria-selected={isSelected}
                          onClick={() => setSelectedId(i.id)}
                          className={`relative border-b-2 pb-1 font-mono text-xs transition-colors ${
                            isSelected
                              ? "border-accent text-accent-text"
                              : isRelated
                                ? "border-accent/40 text-text"
                                : "border-transparent text-text-muted hover:border-border-strong hover:text-text"
                          }`}
                        >
                          {i.name}
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>

          <p className="mono-label mt-8 hidden sm:block" aria-hidden>
            ← → to walk the library
          </p>
        </div>

        {/* the marginal note — first person, works actually read */}
        <div className="py-7 lg:pl-10" role="region" aria-label="Influence detail">
          <div className="flex items-baseline justify-between gap-4">
            <h3
              className="font-serif text-2xl italic text-text"
              aria-live="polite"
            >
              {selected.name}
            </h3>
            <span className="mono-label whitespace-nowrap">
              {selected.dates}
            </span>
          </div>
          <p className="mono-label mt-1">
            {clusters.find((c) => c.id === selected.cluster)?.label}
          </p>

          {selected.bust && <BustPlate bust={selected.bust} />}

          <p className="mt-4 text-sm leading-relaxed text-text-muted">
            {selected.note}
          </p>

          {selected.read && selected.read.length > 0 && (
            <>
              <p className="mono-label mt-6 mb-2">Read</p>
              <ul className="space-y-1">
                {selected.read.map((w) => (
                  <li
                    key={w}
                    className="border-l border-border pl-3 font-mono text-xs leading-relaxed text-text-muted"
                  >
                    {w}
                  </li>
                ))}
              </ul>
            </>
          )}

          {connections.length > 0 && (
            <>
              <p className="mono-label mt-6 mb-2">Connections</p>
              <ul className="space-y-1">
                {connections.map((c) => {
                  const target = influences.find((i) => i.id === c.to);
                  return (
                    <li key={`${c.to}-${c.label}`} className="font-mono text-xs">
                      <button
                        type="button"
                        onClick={() => setSelectedId(c.to)}
                        className="accent-underline text-accent-text"
                      >
                        {target?.name ?? c.to}
                      </button>
                      <span className="text-text-faint"> · {c.label}</span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      </div>

      <figcaption
        id="figA-caption"
        className="border-t border-border-strong py-3"
      >
        <span className="mono-label">
          fig. A — the other system · every line is a documented debt · marble
          only where museums have scanned it · politics deliberately absent
        </span>
      </figcaption>
    </figure>
  );
}

"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { schemaModels, domains } from "@/lib/case-study";

type Line = { x1: number; y1: number; x2: number; y2: number };

/** fig. 1 — the real 12-model schema, typeset as a document plate.
 *
 * No chips, no panel chrome: the models are set directly on the paper as
 * typographic nodes, and the selected model's relations are drawn as ink
 * hairlines with amber endpoints, measured from live DOM rects so they
 * survive resize and theme changes. The figure sits between two strong
 * rules, captioned like a printed plate.
 */
export function SchemaExplorer() {
  const [selectedId, setSelectedId] = useState<string>("application");
  const mapRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef(new Map<string, HTMLButtonElement>());
  const [lines, setLines] = useState<Line[]>([]);

  const selected = useMemo(
    () => schemaModels.find((m) => m.id === selectedId) ?? schemaModels[0],
    [selectedId]
  );
  const relatedIds = useMemo(
    () => new Set(selected.relations.map((r) => r.to)),
    [selected]
  );

  const measure = useCallback(() => {
    const map = mapRef.current;
    const from = nodeRefs.current.get(selected.id);
    if (!map || !from) return;
    const mapRect = map.getBoundingClientRect();
    const a = from.getBoundingClientRect();
    const next: Line[] = [];
    for (const rel of selected.relations) {
      const toEl = nodeRefs.current.get(rel.to);
      if (!toEl) continue;
      const b = toEl.getBoundingClientRect();
      next.push({
        x1: a.left + a.width / 2 - mapRect.left,
        y1: a.top + a.height / 2 - mapRect.top,
        x2: b.left + b.width / 2 - mapRect.left,
        y2: b.top + b.height / 2 - mapRect.top,
      });
    }
    setLines(next);
  }, [selected]);

  useLayoutEffect(measure, [measure]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(map);
    return () => ro.disconnect();
  }, [measure]);

  // Roving arrow-key navigation across the flat model order.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.key))
      return;
    e.preventDefault();
    const order = schemaModels.map((m) => m.id);
    const i = order.indexOf(selectedId);
    const delta = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
    const nextId = order[(i + delta + order.length) % order.length];
    setSelectedId(nextId);
    nodeRefs.current.get(nextId)?.focus();
  };

  return (
    <figure
      className="border-y border-border-strong"
      aria-labelledby="fig1-caption"
    >
      <div className="grid lg:grid-cols-[1.15fr_1fr]">
        {/* the map — models set as type, relations drawn as ink */}
        <div
          ref={mapRef}
          className="relative border-b border-border py-7 lg:border-b-0 lg:border-r lg:pr-10"
          onKeyDown={onKeyDown}
          role="listbox"
          aria-label="Data models. Use the arrow keys to move between models."
        >
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
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
                  strokeOpacity={0.5}
                  strokeWidth={1}
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

          <div className="relative space-y-7">
            {domains.map((d) => (
              <div key={d.id} role="group" aria-label={d.label}>
                <p className="mono-label mb-3" aria-hidden>
                  {d.label}
                </p>
                <div className="flex flex-wrap gap-x-5 gap-y-2.5">
                  {schemaModels
                    .filter((m) => m.domain === d.id)
                    .map((m) => {
                      const isSelected = m.id === selected.id;
                      const isRelated = relatedIds.has(m.id);
                      return (
                        <button
                          key={m.id}
                          ref={(el) => {
                            if (el) nodeRefs.current.set(m.id, el);
                            else nodeRefs.current.delete(m.id);
                          }}
                          type="button"
                          role="option"
                          tabIndex={isSelected ? 0 : -1}
                          aria-selected={isSelected}
                          onClick={() => setSelectedId(m.id)}
                          className={`relative border-b-2 pb-1 font-mono text-xs transition-colors ${
                            isSelected
                              ? "border-accent text-accent-text"
                              : isRelated
                                ? "border-accent/40 text-text"
                                : "border-transparent text-text-muted hover:border-border-strong hover:text-text"
                          }`}
                        >
                          {m.name}
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>

          <p className="mono-label mt-8 hidden sm:block" aria-hidden>
            ← → to walk the schema
          </p>
        </div>

        {/* the marginal notes — footnotes for the selected model */}
        <div className="py-7 lg:pl-10" role="region" aria-label="Model detail">
          <div className="flex items-baseline justify-between gap-4">
            <h3
              className="font-serif text-2xl italic text-text"
              aria-live="polite"
            >
              {selected.name}
            </h3>
            <span className="mono-label">
              {domains.find((d) => d.id === selected.domain)?.label}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            {selected.purpose}
          </p>

          <p className="mono-label mt-6 mb-2">Shape</p>
          <ul className="space-y-1">
            {selected.fields.map((f) => (
              <li
                key={f}
                className="border-l border-border pl-3 font-mono text-xs leading-relaxed text-text-muted"
              >
                {f}
              </li>
            ))}
          </ul>

          {selected.relations.length > 0 && (
            <>
              <p className="mono-label mt-6 mb-2">Relations</p>
              <ul className="space-y-1">
                {selected.relations.map((r) => {
                  const target = schemaModels.find((m) => m.id === r.to);
                  return (
                    <li key={`${r.to}-${r.label}`} className="font-mono text-xs">
                      <button
                        type="button"
                        onClick={() => setSelectedId(r.to)}
                        className="accent-underline text-accent-text"
                      >
                        {target?.name ?? r.to}
                      </button>
                      <span className="text-text-faint"> · {r.label}</span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          <p className="mt-6 border-t border-border pt-4 text-sm leading-relaxed text-text-muted">
            <span className="font-medium text-text">
              Why it&apos;s shaped this way —{" "}
            </span>
            {selected.note}
          </p>
        </div>
      </div>

      <figcaption
        id="fig1-caption"
        className="border-t border-border-strong py-3"
      >
        <span className="mono-label">
          fig. 1 — 12 relational models · one developer · in production for
          Câmara Municipal do Porto
        </span>
      </figcaption>
    </figure>
  );
}

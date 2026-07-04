import { lifecycle } from "@/lib/case-study";

/** fig. 2 — the application state machine, rendered as a document figure.
 *  Static and legible: the states are the content, not a decoration. */
export function Lifecycle() {
  return (
    <figure className="hairline bg-bg-elevated/40">
      <div className="p-5 sm:p-7">
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {lifecycle.states.map((s, i) => (
            <li key={s.id} className="relative">
              <p className="mono-label mb-2.5">
                {`0${i + 1}`}
                {i < lifecycle.states.length - 1 ? " →" : ""}
              </p>
              <div className="flex items-center gap-3">
                <span className="border border-accent/60 bg-accent-soft px-2.5 py-1 font-mono text-xs text-text">
                  {s.id}
                </span>
                {i < lifecycle.states.length - 1 && (
                  <span
                    className="hidden h-px flex-1 bg-border-strong lg:block"
                    aria-hidden
                  />
                )}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-text-muted">
                {s.note}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-7 border-t border-border pt-5">
          <p className="mono-label mb-3">Terminal states</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {lifecycle.terminal.map((t) => (
              <li key={t.id} className="font-mono text-xs text-text-muted">
                <span className="text-text">{t.id}</span>
                <span className="text-text-faint"> · {t.note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <figcaption className="border-t border-border px-5 py-3 sm:px-7">
        <span className="mono-label">{lifecycle.caption}</span>
      </figcaption>
    </figure>
  );
}

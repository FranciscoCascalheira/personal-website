import { auditCommit, auditLedger, reconciliation } from "@/lib/audit";

/** fig. 3 — the audit ledger, set as a ruled account rather than a chart.
 *
 *  One commit, recounted. The header is the evidence a reader can check with
 *  git; the rows are the categories that came out of the diff; the rule beside
 *  each count is drawn to scale, in ink, using the document's one motion verb.
 *  Pure typography — no JS, no canvas, prints as it stands.
 */
export function AuditLedger() {
  const max = Math.max(...auditLedger.map((c) => c.count));

  return (
    <figure
      className="border-y border-border-strong"
      aria-labelledby="fig3-caption"
    >
      {/* the evidence, stamped like a docket line */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-b border-border py-4">
        <p className="font-mono text-xs text-text">
          <span className="text-accent-text">{auditCommit.hash}</span>
          <span className="text-text-faint"> · {auditCommit.date} · </span>
          {auditCommit.files} files
          <span className="text-text-faint"> · </span>
          <span className="text-positive">+{auditCommit.insertions}</span>
          <span className="text-text-faint"> </span>
          <span>−{auditCommit.deletions}</span>
        </p>
        <p className="mono-label">Recounted from the diff</p>
      </div>

      <dl className="py-2">
        {auditLedger.map((c) => (
          <div
            key={c.label}
            className="grid grid-cols-[1fr_auto] items-baseline gap-x-6 border-b border-border py-4 last:border-b-0 sm:grid-cols-[minmax(0,15rem)_2.5rem_minmax(0,1fr)]"
          >
            <dt className="font-mono text-xs text-text">{c.label}</dt>
            <dd className="text-right font-mono text-sm tabular-nums text-accent-text sm:text-left">
              {c.count}
            </dd>
            <dd className="col-span-2 sm:col-span-1">
              {/* the count, drawn to scale */}
              <div
                aria-hidden
                className="rule-draw mb-2 hidden h-px bg-text-muted sm:block"
                style={{ width: `${(c.count / max) * 100}%` }}
              />
              <p className="text-sm leading-relaxed text-text-muted">
                {c.note}
              </p>
            </dd>
          </div>
        ))}
      </dl>

      {/* the ledger audits its own headline */}
      <div className="border-t border-border-strong py-5">
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
          <p className="mono-label">Reconciliation</p>
          <p className="font-mono text-xs text-text">
            counted {reconciliation.counted}
            <span className="text-text-faint"> · claimed </span>
            {reconciliation.claimed}
          </p>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-muted">
          {reconciliation.body}
        </p>
      </div>

      <figcaption
        id="fig3-caption"
        className="border-t border-border py-3"
      >
        <span className="mono-label">
          fig. 3 — one commit, recounted · the pre-fix states below shipped
          fixed and are history, not advisories
        </span>
      </figcaption>
    </figure>
  );
}

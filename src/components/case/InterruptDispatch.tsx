import { dispatch } from "@/lib/case-study-lcom";

/** fig. 1 — the interrupt dispatch. Four devices subscribe to hardware IRQ
 *  lines; one blocking driver_receive fans every notification out to its
 *  handler. The team's architecture, attributed as such — my one line (RTC) is
 *  the amber one. Ruled, static: four sources on the left, the kernel call in
 *  the middle, the handlers on the right. */
export function InterruptDispatch() {
  return (
    <figure className="border-y border-border-strong" aria-labelledby="fig1-caption">
      <div className="py-7 sm:py-9">
        {/* the blocking call, named once at the top */}
        <p className="mono-label mb-6">
          driver_receive(ANY) — blocks in the kernel until hardware wakes it
        </p>

        <ol className="space-y-3">
          {dispatch.sources.map((s) => (
            <li
              key={s.irq}
              className="grid grid-cols-[64px_minmax(0,1fr)] items-baseline gap-x-4 border-t border-border py-3 sm:grid-cols-[80px_200px_minmax(0,1fr)]"
            >
              <span
                className={`font-mono text-xs ${s.mine ? "text-accent-text" : "text-text-faint"}`}
              >
                {s.irq}
              </span>
              <span className="whitespace-nowrap font-mono text-sm text-text">
                {s.dev}
                <span className="text-text-faint"> → {s.ih}</span>
                {s.mine && <span className="text-accent-text"> · mine</span>}
              </span>
              <span className="col-span-2 text-sm leading-relaxed text-text-muted sm:col-span-1">
                {s.note}
              </span>
            </li>
          ))}
        </ol>
        <p className="mono-label mt-5">
          one message loop · four interrupt lines · a bitmask says which fired
        </p>
      </div>

      <figcaption id="fig1-caption" className="border-t border-border-strong py-3">
        <span className="mono-label">{dispatch.caption}</span>
      </figcaption>
    </figure>
  );
}

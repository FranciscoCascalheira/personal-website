import { rtcPath } from "@/lib/case-study-lcom";

/** fig. 2 — the RTC read path (mine). A five-step pipeline from subscribing to
 *  the update-ended interrupt to stamping a high score with a real date and
 *  time. The fiddly middle — waiting out the update, decoding BCD — is the
 *  "done properly" that a running clock hides. Ruled, numbered, ink + amber. */
export function RtcPath() {
  return (
    <figure className="border-y border-border-strong" aria-labelledby="fig2-caption">
      <div className="py-7 sm:py-9">
        <ol className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-5">
          {rtcPath.steps.map((s, i) => (
            <li key={s.k} className="border-t-2 border-accent pt-3">
              <p className="mono-label">
                {`0${i + 1}`} <span className="text-accent-text">{s.k}</span>
              </p>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">{s.v}</p>
            </li>
          ))}
        </ol>
      </div>

      <figcaption id="fig2-caption" className="border-t border-border-strong py-3">
        <span className="mono-label">{rtcPath.caption}</span>
      </figcaption>
    </figure>
  );
}

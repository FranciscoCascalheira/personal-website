import { Section } from "./Section";
import { Reveal } from "./Reveal";
import { skills } from "@/lib/data";

/** No chip soup: the stack is an inventory, so it is typeset as one —
 *  ruled rows, mono group labels, plain text separated by middots. */
export function Stack() {
  return (
    <Section
      id="stack"
      index="03"
      label="Stack"
      title="The tools I reach for."
      lede="TypeScript on both ends, Postgres underneath, and whatever the problem actually needs."
      minor
    >
      {/* fills the content column so its right edge meets the deck's — the two
          share a boundary and the deck reads as a deck, not a floating lede */}
      <dl>
        {skills.map((group, i) => (
          <Reveal
            key={group.group}
            delay={i * 50}
            className="grid gap-2 border-t border-border py-5 sm:grid-cols-[200px_1fr] sm:gap-6"
          >
            <dt className="mono-label sm:pt-0.5">{group.group}</dt>
            <dd className="text-sm leading-relaxed text-text">
              {group.items.join(" · ")}
            </dd>
          </Reveal>
        ))}
        <div aria-hidden className="h-px w-full bg-border" />
      </dl>
    </Section>
  );
}

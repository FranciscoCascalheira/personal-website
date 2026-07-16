import { Section } from "./Section";
import { Reveal } from "./Reveal";
import { trajectory, type Experience } from "@/lib/data";

// Categories are encoded by ink weight, not hue — the one accent stays the
// law and green stays reserved for "live/OK" elsewhere on the record.
const kindDot: Record<Experience["kind"], string> = {
  work: "bg-accent",
  leadership: "bg-text",
  education: "bg-text-muted",
  cert: "bg-text-faint",
};

/** The record's one horizontal moment: on wide screens the trajectory runs
 *  left-to-right along a single drawn rule, like a timeline plate folded
 *  out of the document. On small screens it stacks against a vertical rule. */
export function Path() {
  return (
    <Section
      id="path"
      index="04"
      label="Path"
      title="How I got here."
      lede="Work, study and the things I do because I want to."
      minor
    >
      <Reveal>
        {/* the horizontal scroller clips the last card at the viewport edge;
            the right-fade mask is the "more this way" affordance so the clip
            reads as scrollable, not broken */}
        <ol
          tabIndex={0}
          aria-label="Trajectory, in reverse chronological order. Scrolls horizontally on wide screens."
          className="flex flex-col gap-10 lg:snap-x lg:flex-row lg:gap-0 lg:overflow-x-auto lg:pb-6 lg:[mask-image:linear-gradient(to_right,#000_92%,transparent)]"
        >
          {trajectory.map((item) => (
            <li
              key={`${item.role}-${item.period}`}
              className="relative border-l border-border pl-6 lg:min-w-[300px] lg:snap-start lg:flex-1 lg:border-l-0 lg:border-t lg:pl-0 lg:pr-10 lg:pt-7"
            >
              <span
                className={`absolute -left-[4.5px] top-1.5 size-2 rounded-full lg:-top-[4.5px] lg:left-0 ${kindDot[item.kind]}`}
                aria-hidden
              />
              <p className="mono-label">{item.period}</p>
              <h3 className="mt-2 text-lg font-medium text-text">
                {item.role}
              </h3>
              <p className="text-sm text-accent-text">{item.org}</p>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-muted">
                {item.note}
              </p>
            </li>
          ))}
        </ol>
      </Reveal>
    </Section>
  );
}

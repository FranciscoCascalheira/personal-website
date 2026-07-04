import { Section } from "./Section";
import { Reveal } from "./Reveal";
import { trajectory, type Experience } from "@/lib/data";

const kindDot: Record<Experience["kind"], string> = {
  work: "bg-accent",
  leadership: "bg-positive",
  education: "bg-text",
  cert: "bg-text-faint",
};

export function Path() {
  return (
    <Section
      id="path"
      index="04"
      label="Path"
      title="How I got here."
      lede="Work, study and the things I do because I want to."
    >

      <ol className="relative">
        <div
          className="absolute bottom-2 left-[7px] top-2 w-px bg-border sm:left-[calc(180px+7px)]"
          aria-hidden
        />
        {trajectory.map((item, i) => (
          <Reveal
            as="li"
            key={`${item.role}-${item.period}`}
            delay={i * 50}
            className="relative grid gap-x-8 gap-y-1 pb-10 pl-8 sm:grid-cols-[180px_1fr] sm:pl-0"
          >
            <p className="mono-label sm:pt-1 sm:text-right">{item.period}</p>
            <span
              className={`absolute left-0 top-1.5 size-3.5 rounded-full border-2 border-bg sm:left-[180px] ${kindDot[item.kind]}`}
              aria-hidden
            />
            <div className="sm:pl-8">
              <h3 className="text-lg font-medium text-text">{item.role}</h3>
              <p className="text-sm text-accent-text">{item.org}</p>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-muted">
                {item.note}
              </p>
            </div>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}

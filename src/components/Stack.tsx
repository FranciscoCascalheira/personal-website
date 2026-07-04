import { Section } from "./Section";
import { Reveal } from "./Reveal";
import { skills } from "@/lib/data";

export function Stack() {
  return (
    <Section
      id="stack"
      index="03"
      label="Stack"
      title="The tools I reach for."
      lede="Comfortable across the full stack — TypeScript on both ends, Postgres underneath, and whatever the problem actually needs."
    >

      <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
        {skills.map((group, i) => (
          <Reveal key={group.group} delay={i * 60} className="bg-bg p-7">
            <p className="mono-label mb-5">{group.group}</p>
            <ul className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="rounded-md border border-border bg-bg-inset px-3 py-1.5 text-sm text-text"
                >
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

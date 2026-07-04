import Image from "next/image";
import { Section, SectionHeading } from "./Section";
import { Reveal } from "./Reveal";
import { interests, languages } from "@/lib/data";

export function About() {
  return (
    <Section id="about">
      <SectionHeading
        index="02"
        label="About"
        title="I build things, and I ship them."
      >
        The short version of who I am when I step away from the editor.
      </SectionHeading>

      <div className="grid gap-10 lg:grid-cols-[300px_1fr] lg:gap-16">
        <Reveal>
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-bg-inset">
            <Image
              src="/portrait.jpg"
              alt="Francisco Cascalheira"
              fill
              sizes="(max-width: 1024px) 100vw, 300px"
              className="object-cover"
              priority={false}
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between px-4 py-3">
              <span className="mono-label rounded bg-bg/70 px-2 py-1 backdrop-blur-sm">
                Porto · PT
              </span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="max-w-2xl space-y-5 text-lg leading-relaxed text-text-muted">
            <p>
              I&apos;m a second-year Computer Engineering student in Porto, but
              most of what I actually know comes from building. I like owning a
              product end to end — sitting in the requirements meeting, designing
              the data model, and being the person who deploys it. Shipping to
              real users teaches faster than anything else.
            </p>
            <p>
              Away from the editor I read a fair amount — philosophy, ancient
              history, the occasional argument about Austrian economics. I follow
              Bitcoin and cybersecurity closely, and I show up at Porto&apos;s
              tech and startup meetups because the people there are building
              things too.
            </p>
          </div>

          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            <div>
              <p className="mono-label mb-4">Into</p>
              <ul className="flex flex-wrap gap-2">
                {interests.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-border px-3 py-1.5 text-sm text-text-muted"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mono-label mb-4">Languages</p>
              <ul className="space-y-2">
                {languages.map((l) => (
                  <li
                    key={l.name}
                    className="flex items-center justify-between border-b border-border pb-2 text-sm"
                  >
                    <span className="text-text">{l.name}</span>
                    <span className="font-mono text-xs text-text-faint">{l.level}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

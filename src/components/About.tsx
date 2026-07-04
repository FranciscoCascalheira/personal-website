import Image from "next/image";
import { Section, SectionHeading } from "./Section";
import { Reveal } from "./Reveal";
import { interests, languages } from "@/lib/data";

export function About() {
  return (
    <Section id="about">
      <SectionHeading
        index="02"
        label="The author"
        title="Proof has a person behind it."
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
          <blockquote className="max-w-2xl border-l-2 border-accent/50 pl-5 font-serif text-2xl italic leading-snug text-text sm:text-3xl">
            A CV is a claim. A system in production is proof.
          </blockquote>

          <div className="mt-8 max-w-2xl space-y-5 text-lg leading-relaxed text-text-muted">
            <p>
              That conviction comes from the Austrian economists I read for
              fun: value isn&apos;t declared, it&apos;s demonstrated in
              exchange. It&apos;s why this site is built like a dossier rather
              than a portfolio — one system, in production, examined honestly —
              and why I care more about who depends on my software than what
              the course syllabus says.
            </p>
            <p>
              I&apos;m a second-year Computer Engineering student in Porto. I
              like owning a product end to end: sitting in the requirements
              meeting, designing the data model, and being the person who
              deploys it and answers for it when it breaks. Away from the
              editor: philosophy, ancient history, cybersecurity, and
              Porto&apos;s tech and startup meetups.
            </p>
          </div>

          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            <div>
              <p className="mono-label mb-4">Into</p>
              <ul className="flex flex-wrap gap-2">
                {interests.map((item) => (
                  <li
                    key={item}
                    className="rounded-md border border-border px-3 py-1.5 text-sm text-text-muted"
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

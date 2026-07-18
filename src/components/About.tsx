import { Section } from "./Section";
import { Reveal } from "./Reveal";
import { AuthorPlate } from "./AuthorPlate";
import { interests, languages } from "@/lib/data";

export function About() {
  return (
    <Section
      id="about"
      index="02"
      label="The author"
      title="Proof has a person behind it."
      lede="The short version of who I am when I step away from the editor."
    >
      <div className="grid gap-12 lg:grid-cols-[300px_1fr] lg:gap-16">
        {/* the plate: the author engraved in the document's own ink; the
            photograph stays one press away */}
        <Reveal>
          <AuthorPlate />
        </Reveal>

        <Reveal delay={100}>
          <blockquote className="max-w-2xl font-serif text-3xl italic leading-[1.15] text-text [hanging-punctuation:first] sm:text-4xl">
            “A CV is a claim. A system in production is proof.”
          </blockquote>

          <div className="measure mt-8 space-y-5 leading-relaxed text-text-muted">
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

          <dl className="mt-10 max-w-2xl">
            <div className="grid gap-2 border-t border-border py-4 sm:grid-cols-[140px_1fr] sm:gap-6">
              <dt className="mono-label">Into</dt>
              <dd className="text-sm leading-relaxed text-text">
                {interests.join(" · ")}
              </dd>
            </div>
            <div className="grid gap-2 border-t border-border py-4 sm:grid-cols-[140px_1fr] sm:gap-6">
              <dt className="mono-label">Languages</dt>
              <dd className="text-sm leading-relaxed text-text">
                {languages.map((l, i) => (
                  <span key={l.name}>
                    {i > 0 ? " · " : ""}
                    {l.name}{" "}
                    <span className="font-mono text-xs text-text-faint">
                      {l.level}
                    </span>
                  </span>
                ))}
              </dd>
            </div>
            <div aria-hidden className="h-px w-full bg-border" />
          </dl>
        </Reveal>
      </div>
    </Section>
  );
}

import { Section, SectionHeading } from "./Section";
import { Reveal } from "./Reveal";
import { site } from "@/lib/site";

function LinkButton({
  href,
  label,
  external,
  disabled,
}: {
  href: string;
  label: string;
  external?: boolean;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <span
        aria-disabled
        title="Coming soon"
        className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-text-faint"
      >
        {label}
        <span className="font-mono text-xs">soon</span>
      </span>
    );
  }
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="group inline-flex items-center gap-2 rounded-full border border-border-strong px-4 py-2 text-sm text-text transition-colors hover:bg-bg-elevated"
    >
      {label}
      <span className="text-text-faint transition-transform group-hover:translate-x-0.5" aria-hidden>
        ↗
      </span>
    </a>
  );
}

export function Contact() {
  return (
    <Section id="contact">
      <SectionHeading index="05" label="Contact" title="Let's build something.">
        Open to internships, collaborations and interesting problems. The inbox
        is the fastest way in.
      </SectionHeading>

      <Reveal>
        <div className="rounded-3xl border border-border bg-bg-elevated/40 p-8 sm:p-12">
          <p className="mono-label mb-6">{`/// Available for work`}</p>
          <a
            href={`mailto:${site.email}`}
            className="group block text-xl font-medium tracking-tight text-text [overflow-wrap:anywhere] sm:text-3xl lg:text-4xl"
          >
            <span className="accent-underline">{site.email}</span>
            <span className="ml-2 inline-block text-text-faint transition-transform group-hover:translate-x-1" aria-hidden>
              →
            </span>
          </a>

          <div className="mt-10 flex flex-wrap gap-3">
            <LinkButton
              href={site.socials.linkedin}
              label="LinkedIn"
              external
              disabled={!site.socials.linkedin}
            />
            <LinkButton href={site.socials.github} label="GitHub" external />
            <LinkButton href={site.cv} label="Download CV" external />
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

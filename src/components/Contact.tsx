import { Section } from "./Section";
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
        className="inline-flex cursor-not-allowed items-center gap-2 border border-border px-4 py-2 text-sm text-text-faint"
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
      className="group inline-flex items-center gap-2 border border-border-strong px-4 py-2 text-sm text-text transition-colors hover:bg-bg-elevated"
    >
      {label}
      <span
        className="text-text-faint transition-transform group-hover:translate-x-0.5"
        aria-hidden
      >
        ↗
      </span>
    </a>
  );
}

/** No card around the ask. The email is set like a closing line of the
 *  document — serif, big, ruled above and below. */
export function Contact() {
  return (
    <Section
      id="contact"
      index="05"
      label="Contact"
      title="Let's build something."
      lede="Open to internships, collaborations and interesting problems. The inbox is the fastest way in."
    >
      <Reveal>
        <p className="mono-label border-t border-border pt-6">
          {"/// Available for work"}
        </p>
        <a
          href={`mailto:${site.email}`}
          className="group mt-6 block text-[clamp(1.35rem,3vw,2.75rem)] font-medium tracking-tight leading-[1.05] text-text [overflow-wrap:anywhere]"
        >
          <span className="accent-underline">{site.email}</span>
          <span
            className="ml-3 inline-block text-text-faint transition-transform group-hover:translate-x-1"
            aria-hidden
          >
            →
          </span>
        </a>

        <div className="mt-10 flex flex-wrap gap-3 border-b border-border pb-10">
          <LinkButton
            href={site.socials.linkedin}
            label="LinkedIn"
            external
            disabled={!site.socials.linkedin}
          />
          <LinkButton href={site.socials.github} label="GitHub" external />
          <LinkButton href={site.cv} label="Download CV" external />
        </div>
      </Reveal>
    </Section>
  );
}

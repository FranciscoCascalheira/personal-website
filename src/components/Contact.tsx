import { Section } from "./Section";
import { Reveal } from "./Reveal";
import { site } from "@/lib/site";

function LinkButton({
  href,
  label,
  external,
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
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
  const stated = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${site.availability.asOf}T00:00:00Z`));

  return (
    <Section
      id="contact"
      index="05"
      label="Contact"
      title="Let's build something."
      lede="Open to internships, collaborations and interesting problems. The inbox is the fastest way in."
    >
      <Reveal>
        {site.availability.open ? (
          /* Dated, because it is the only line here that rots without anyone
             touching it — see the note in site.ts. */
          <p className="mono-label border-t border-border pt-6">
            {`/// Available for work · stated ${stated}`}
          </p>
        ) : (
          <div className="border-t border-border pt-6" />
        )}
        <a
          href={`mailto:${site.email}`}
          className="group mt-6 block font-serif text-[clamp(1.6rem,3.6vw,3.6rem)] leading-[1.05] text-text [overflow-wrap:anywhere]"
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
          <LinkButton href={site.socials.linkedin} label="LinkedIn" external />
          <LinkButton href={site.socials.github} label="GitHub" external />
          <LinkButton href={site.cv} label="Download CV" external />
        </div>
      </Reveal>
    </Section>
  );
}

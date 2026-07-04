import { projects, type Project } from "@/lib/data";
import { Reveal } from "./Reveal";
import { Section, SectionHeading } from "./Section";
import { StatusBadge, StackChips, MetricRow } from "./ui";

/* A stylised product frame for the flagship. It shows the real domain of the
   platform without exposing any production UI or client data — the mono
   caption makes that explicit. A real redacted screenshot can drop in later. */
function FlagshipVisual() {
  const entities = ["Candidates", "Companies", "Vacancies", "Applications"];
  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-border bg-bg-inset">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="flex gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-full bg-border-strong" />
            <span className="size-2.5 rounded-full bg-border-strong" />
            <span className="size-2.5 rounded-full bg-border-strong" />
          </span>
          <span className="ml-2 truncate rounded-md bg-bg px-3 py-1 font-mono text-xs text-text-faint">
            opportunities · cm-porto
          </span>
        </div>
        <div className="px-6 py-8">
          <p className="text-2xl font-medium tracking-tight text-text">
            op<span className="text-accent">PORTO</span>nities
          </p>
          <p className="mono-label mt-2">Talent for the City of Porto</p>

          <div className="mt-7 flex flex-wrap items-center gap-x-2 gap-y-3">
            {entities.map((e, i) => (
              <div key={e} className="flex items-center gap-2">
                <span className="rounded-md border border-border bg-bg px-3 py-1.5 text-sm text-text">
                  {e}
                </span>
                {i < entities.length - 1 ? (
                  <span className="font-mono text-text-faint" aria-hidden>
                    →
                  </span>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border">
            {[
              ["294", "solo commits"],
              ["380+", "vacancies"],
              ["12", "data models"],
              ["Live", "in production"],
            ].map(([v, l]) => (
              <div key={l} className="bg-bg-inset px-4 py-3">
                <p className="text-lg font-medium text-text">{v}</p>
                <p className="mono-label mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-3 font-mono text-xs text-text-faint">
        {"/// Illustrative schematic — production UI withheld (client data)"}
      </p>
    </div>
  );
}

function Flagship({ project }: { project: Project }) {
  return (
    <Reveal className="relative">
      <div className="rounded-3xl border border-border bg-bg-elevated/40 p-6 sm:p-10">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="flex flex-col">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span className="mono-label text-accent-text">{`${project.index} · Flagship`}</span>
              <StatusBadge status={project.status} />
            </div>
            <p className="mono-label mb-3">{project.client}</p>
            <h3 className="text-3xl font-medium tracking-tight text-text sm:text-4xl">
              {project.name}
            </h3>
            <p className="mt-2 text-lg text-text-muted">{project.tagline}</p>
            <p className="mt-6 leading-relaxed text-text-muted">{project.summary}</p>

            <ul className="mt-6 space-y-2.5">
              {project.contributions.map((c) => (
                <li key={c} className="flex gap-3 text-sm leading-relaxed text-text-muted">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" aria-hidden />
                  {c}
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-8">
              <StackChips items={project.stack} />
            </div>
          </div>

          <div className="flex items-center">
            <FlagshipVisual />
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function ProjectCard({ project, delay }: { project: Project; delay: number }) {
  return (
    <Reveal
      delay={delay}
      className="group flex h-full flex-col rounded-2xl border border-border bg-bg-elevated/40 p-7 transition-colors hover:border-border-strong"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <span className="mono-label">{project.index}</span>
        <StatusBadge status={project.status} />
      </div>
      <h3 className="text-xl font-medium text-text">{project.name}</h3>
      <p className="mt-1.5 text-sm text-text-muted">{project.tagline}</p>
      <p className="mono-label mt-4">{project.role}</p>
      <p className="mt-4 text-sm leading-relaxed text-text-muted">{project.summary}</p>
      <div className="mt-6">
        <MetricRow metrics={project.metrics} />
      </div>
      <div className="mt-auto pt-6">
        <StackChips items={project.stack} />
      </div>
    </Reveal>
  );
}

export function Work() {
  const [flagship, ...rest] = projects;
  return (
    <Section id="work">
      <SectionHeading
        index="01"
        label="Selected work"
        title="Products I've taken to production."
      >
        Real systems with real users, from requirements to deployment. The best
        of it runs behind closed doors, so a few pieces are described rather than
        linked.
      </SectionHeading>

      <div className="space-y-6">
        <Flagship project={flagship} />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((project, i) => (
            <ProjectCard key={project.slug} project={project} delay={i * 80} />
          ))}
        </div>
      </div>
    </Section>
  );
}

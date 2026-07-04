import { projects, type Project } from "@/lib/data";
import { Reveal } from "./Reveal";
import { Section, SectionHeading } from "./Section";
import { StatusBadge, StackChips, MetricRow } from "./ui";
import { FlagshipVisual } from "./FlagshipVisual";

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

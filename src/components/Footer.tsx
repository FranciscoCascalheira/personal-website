import { site } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden border-t border-border">
      <div className="mx-auto w-full max-w-[1120px] px-6 pt-20 sm:px-8">
        <div className="flex flex-col gap-6 pb-16 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mono-label mb-3">{`/// ${site.locator}`}</p>
            <p className="max-w-xs text-sm leading-relaxed text-text-muted">
              Built from scratch — Next.js, TypeScript and a lot of care for the
              details.
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a href="#work" className="link-quiet">
              Work
            </a>
            <a href="#contact" className="link-quiet">
              Contact
            </a>
            <a
              href={site.socials.github}
              target="_blank"
              rel="noreferrer"
              className="link-quiet"
            >
              GitHub
            </a>
          </div>
        </div>

        {/* giant faint wordmark — Augusta's closing move */}
        <div aria-hidden className="relative select-none">
          <span className="block whitespace-nowrap bg-gradient-to-b from-text/[0.08] to-text/[0.015] bg-clip-text text-[13.5vw] font-semibold leading-[0.82] tracking-tighter text-transparent">
            Cascalheira
          </span>
        </div>

        <div className="flex flex-col gap-2 border-t border-border py-6 text-xs text-text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}
          </p>
          <p className="font-mono">{site.coordinates}</p>
        </div>
      </div>
    </footer>
  );
}

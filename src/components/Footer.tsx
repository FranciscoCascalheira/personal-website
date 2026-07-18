import { site } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden border-t border-border">
      <div className="mx-auto w-full max-w-[1520px] px-5 pt-20 sm:px-10">
        <div className="flex flex-col gap-10 pb-16 sm:flex-row sm:items-end sm:justify-between">
          {/* the colophon — how the document is made, stated like one */}
          <div className="max-w-md">
            <p className="mono-label mb-4">Colophon</p>
            <ul className="space-y-1.5 border-l border-border pl-4 text-xs leading-relaxed text-text-muted">
              <li>
                Set in Instrument Serif, Geist and Geist Mono on ivory paper
                tokens; one amber ink.
              </li>
              <li>
                fig. 0 is engraved from the official administrative charts
                (CAOP, EPSG:3763) — the Douro drawn as the legal Porto–Gaia
                boundary, bridges at true longitude.
              </li>
              <li>
                fig. A&apos;s marble is museum photogrammetry via
                threedscans.com, cross-hatched in the browser; the portrait
                plates are engraved at build from license-checked archives
                (credits on each plate), by the same line-displacement
                technique.
              </li>
              <li>
                fig. 4 is a real PostgreSQL compiled to WebAssembly, running in
                the page on the real schema sanitised to shapes; the two
                transactions are interleaved with two-phase commit.
              </li>
              <li>
                Next.js, statically rendered; Three.js, the marble and fig.
                4&apos;s database load only on demand.
              </li>
              <li className="font-mono text-[0.68rem] text-text-faint">
                First load ≈ 329 kB compressed · measured at build, 18 Jul 2026
                · the marble, the map and the database arrive on demand
              </li>
            </ul>
          </div>
          <div className="no-print flex items-center gap-6 text-sm">
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

        {/* the colophon signature — the document signs itself in its own
            display voice, faint ink on the paper. Rendered as a ::after
            pseudo-element because it is pure ornament: the name is already in
            the © line, so this conveys no information and is presentation, not
            text. That representation is also why axe/Lighthouse correctly stop
            contrast-flagging it — a 7%-ink ghost watermark is a deliberate
            flourish, not unreadable content (it stays hidden from AT via the
            aria-hidden host). */}
        <div
          aria-hidden
          role="presentation"
          className="relative block select-none whitespace-nowrap font-serif text-[14.5vw] italic leading-[0.9] tracking-[-0.02em] text-text/[0.07] after:content-['Cascalheira']"
        />

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

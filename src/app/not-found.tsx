import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/Section";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "404 — record not found",
};

/** The document's own error page. A default Next 404 (pure black, system
 *  sans) breaks the PUBLIC RECORD identity the instant a stale link is
 *  followed — so a mistyped URL is filed like everything else: a ghost folio
 *  in the margin, the claim in the serif voice, a way back to the index. */
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <Container className="flex h-14 items-center justify-between">
          <Link href="/" className="link-quiet font-mono text-xs">
            ← Francisco Cascalheira
          </Link>
          <div className="flex items-center gap-4">
            <span className="mono-label hidden sm:block">
              {"/// FC-Dossier · 404"}
            </span>
            <ThemeToggle />
          </div>
        </Container>
      </header>

      <div className="flex flex-1 items-center border-t border-border">
        <Container>
          <div className="grid gap-y-8 py-20 sm:py-28 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-y-0">
            <aside className="flex items-baseline gap-4 lg:block lg:self-start lg:pr-10">
              <p className="folio" aria-hidden data-folio="404" />
              <p className="mono-label lg:mt-5">Not on file</p>
            </aside>

            <div className="lg:border-l lg:border-border lg:pl-12 xl:pl-16">
              <p className="mono-label">HTTP 404 · record not found</p>
              <h1 className="display mt-6 text-[clamp(2.3rem,5.6vw,4.5rem)] leading-[0.98]">
                This page isn&apos;t on file.
              </h1>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-text-muted">
                The document you asked for isn&apos;t in the record — it may
                have been moved, or it never existed. Everything that is filed
                starts at the index.
              </p>
              <div className="mt-10 flex flex-wrap gap-x-10 gap-y-3">
                <Link href="/" className="accent-underline text-text">
                  → The index
                </Link>
                <Link
                  href="/work/opportonities"
                  className="accent-underline text-text"
                >
                  → The opPORTOnities case study
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </main>
  );
}

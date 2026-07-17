"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Container } from "@/components/Section";
import { ThemeToggle } from "@/components/ThemeToggle";

/** The document's own error page. Without it a thrown client error drops the
 *  visitor onto Next's default screen — off-brand, and alarming on a site
 *  whose whole claim is that it is careful. Same voice as not-found.tsx: the
 *  failure is filed, and reloading (reset) usually clears it. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // surfaced in the browser console for anyone actually debugging
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <Container className="flex h-14 items-center justify-between">
          <Link href="/" className="link-quiet font-mono text-xs">
            ← Francisco Cascalheira
          </Link>
          <div className="flex items-center gap-4">
            <span className="mono-label hidden sm:block">
              {"/// FC-Dossier · error"}
            </span>
            <ThemeToggle />
          </div>
        </Container>
      </header>

      <div className="flex flex-1 items-center border-t border-border">
        <Container>
          <div className="grid gap-y-8 py-20 sm:py-28 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-y-0">
            <aside className="flex items-baseline gap-4 lg:block lg:self-start lg:pr-10">
              <p className="folio" aria-hidden>
                err
              </p>
              <p className="mono-label lg:mt-5">Interrupted</p>
            </aside>

            <div className="lg:border-l lg:border-border lg:pl-12 xl:pl-16">
              <p className="mono-label">
                Runtime error{error.digest ? ` · ${error.digest}` : ""}
              </p>
              <h1 className="display mt-6 text-[clamp(2.3rem,5.6vw,4.5rem)] leading-[0.98]">
                Something interrupted this page.
              </h1>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-text-muted">
                An error stopped this page from rendering. Reloading usually
                clears it; if it doesn&apos;t, the record still starts at the
                index.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-3">
                <button
                  type="button"
                  onClick={reset}
                  className="accent-underline cursor-pointer text-text"
                >
                  → Reload this page
                </button>
                <Link href="/" className="accent-underline text-text">
                  → The index
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </main>
  );
}

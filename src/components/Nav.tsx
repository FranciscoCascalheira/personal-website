"use client";

import { useEffect, useState } from "react";
import { nav, site } from "@/lib/site";
import { ThemeToggle } from "./ThemeToggle";
import { CommandPalette } from "./CommandPalette";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [isMac, setIsMac] = useState(true);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    const kick = setTimeout(() => {
      onScroll();
      const uaPlatform =
        (navigator as Navigator & { userAgentData?: { platform?: string } })
          .userAgentData?.platform || navigator.platform || navigator.userAgent;
      setIsMac(/mac|iphone|ipad|ipod/i.test(uaPlatform));
    }, 0);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(kick);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const openPalette = () => window.dispatchEvent(new Event("palette:open"));

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "border-b border-border bg-bg/80 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 w-full max-w-[1520px] items-center justify-between px-5 sm:px-10">
        <a href="#top" className="group flex items-center gap-2.5" aria-label={site.name}>
          <span className="size-2 rounded-[2px] bg-accent transition-transform group-hover:scale-125" />
          <span className="text-sm font-medium tracking-tight text-text">
            {site.name}
          </span>
        </a>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <ul className="mr-2 hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="group px-3 py-2 text-sm text-text-muted transition-colors hover:text-text"
                >
                  <span className="accent-underline pb-1">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={openPalette}
            aria-label="Open command palette"
            aria-keyshortcuts="Meta+K Control+K"
            className="group hidden items-center gap-2 border border-border py-1.5 pl-3 pr-1.5 text-text-muted transition-colors hover:border-border-strong hover:text-text sm:inline-flex"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.2-3.2" />
            </svg>
            <kbd className="border border-border bg-bg px-1.5 py-0.5 font-mono text-[10px] tracking-wide text-text-faint">
              {isMac ? "⌘K" : "Ctrl K"}
            </kbd>
          </button>

          <ThemeToggle />
        </div>
      </nav>
      <CommandPalette />
    </header>
  );
}

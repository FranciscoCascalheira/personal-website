"use client";

import { useEffect, useState } from "react";
import { nav, site } from "@/lib/site";
import { ThemeToggle } from "./ThemeToggle";
import { CommandPalette } from "./CommandPalette";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [isMac, setIsMac] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

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

  // The mobile menu closes on Escape (a panel that traps the reader is worse
  // than no panel) and whenever the layout grows to the desktop nav.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    const mq = window.matchMedia("(min-width: 768px)");
    const onWide = () => mq.matches && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onWide);
    return () => {
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onWide);
    };
  }, [menuOpen]);

  const openPalette = () => window.dispatchEvent(new Event("palette:open"));

  return (
    <header
      className={`no-print fixed inset-x-0 top-0 z-50 transition-colors duration-300 ease-[var(--ease-press)] ${
        scrolled || menuOpen
          ? "border-b border-border bg-bg"
          : "border-b border-transparent"
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
            /* The visible label IS the shortcut, so the accessible name has to
               contain it (WCAG 2.5.3): a voice-control user says what they can
               read. It also tells a screen-reader user the shortcut, which
               aria-keyshortcuts alone does not reliably do. */
            aria-label={`Open command palette, ${isMac ? "⌘K" : "Ctrl K"}`}
            aria-keyshortcuts="Meta+K Control+K"
            className="group hidden items-center gap-2 border border-border py-1.5 pl-3 pr-1.5 text-text-muted transition-colors hover:border-border-strong hover:text-text sm:inline-flex"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.2-3.2" />
            </svg>
            <kbd className="border border-border bg-bg px-1.5 py-0.5 font-mono text-[11px] tracking-wide text-text-faint">
              {isMac ? "⌘K" : "Ctrl K"}
            </kbd>
          </button>

          <ThemeToggle />

          {/* Below md the section links and the ⌘K button are both hidden, and
              a phone has no keyboard shortcut — so this is the only way through
              an ~8,000px document on touch. It carries the same nav + a search
              trigger for the palette. */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="flex items-center border border-border p-2 text-text-muted transition-colors hover:border-border-strong hover:text-text md:hidden"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div id="mobile-menu" className="border-t border-border bg-bg md:hidden">
          <ul className="mx-auto w-full max-w-[1520px] px-5 py-2">
            {nav.map((item) => (
              <li key={item.id} className="border-b border-border last:border-b-0">
                <a
                  href={`#${item.id}`}
                  onClick={() => setMenuOpen(false)}
                  className="block py-3 text-sm text-text-muted transition-colors hover:text-text"
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li className="border-t border-border">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  openPalette();
                }}
                className="flex w-full items-center gap-2.5 py-3 text-sm text-text-muted transition-colors hover:text-text"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.2-3.2" />
                </svg>
                Search the dossier
              </button>
            </li>
          </ul>
        </div>
      )}
      <CommandPalette />
    </header>
  );
}

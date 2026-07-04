"use client";

import { useEffect, useState } from "react";
import { nav, site } from "@/lib/site";
import { ThemeToggle } from "./ThemeToggle";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "border-b border-border bg-bg/80 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 w-full max-w-[1120px] items-center justify-between px-6 sm:px-8">
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
                  className="rounded-full px-3 py-2 text-sm text-text-muted transition-colors hover:text-text"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}

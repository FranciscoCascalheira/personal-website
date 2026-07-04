"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("themechange", callback);
  return () => window.removeEventListener("themechange", callback);
}

function getSnapshot() {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

/** Reads the theme straight from the <html> data attribute (set pre-paint by
 *  the inline script) via useSyncExternalStore, so there is no flash and no
 *  setState-in-effect. Writing persists the choice and notifies listeners. */
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => "light");

  const toggle = () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* storage blocked — the choice just won't persist */
    }
    window.dispatchEvent(new Event("themechange"));
  };

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="grid size-9 place-items-center rounded-full border border-border text-text-muted transition-colors hover:border-border-strong hover:text-text"
    >
      {isDark ? (
        // moon
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        // sun
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M12 2v2.4M12 19.6V22M2 12h2.4M19.6 12H22M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
}

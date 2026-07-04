"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { nav, site } from "@/lib/site";

type Command = {
  id: string;
  label: string;
  hint?: string;
  group: "Navigate" | "Links" | "Actions";
  keywords?: string;
  run: () => void;
};

/** Small glyph set drawn as inline SVG — no icon font, no emoji. */
function Glyph({ name }: { name: string }) {
  const common = {
    width: 15,
    height: 15,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );
    case "copy":
      return (
        <svg {...common}>
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M5 15V5a2 2 0 0 1 2-2h10" />
        </svg>
      );
    case "external":
      return (
        <svg {...common}>
          <path d="M7 17 17 7M9 7h8v8" />
        </svg>
      );
    case "mail":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      );
    case "doc":
      return (
        <svg {...common}>
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5" />
        </svg>
      );
    case "theme":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" />
        </svg>
      );
    default:
      return null;
  }
}

const glyphFor: Record<Command["group"], string> = {
  Navigate: "arrow",
  Links: "external",
  Actions: "copy",
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  const close = useCallback(() => setOpen(false), []);

  const openPalette = useCallback(() => {
    restoreRef.current = document.activeElement as HTMLElement;
    setQuery("");
    setActive(0);
    setOpen(true);
  }, []);

  const goto = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [],
  );

  const toggleTheme = useCallback(() => {
    const next =
      document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* storage blocked */
    }
    window.dispatchEvent(new Event("themechange"));
  }, []);

  const commands = useMemo<Command[]>(() => {
    const sections: Command[] = [
      { id: "top", label: "Top", group: "Navigate", keywords: "home hero", run: () => goto("top") },
      ...nav.map((n) => ({
        id: n.id,
        label: n.label,
        hint: n.index,
        group: "Navigate" as const,
        run: () => goto(n.id),
      })),
    ];
    const links: Command[] = [
      { id: "github", label: "GitHub", hint: "@FranciscoCascalheira", group: "Links", keywords: "code repos", run: () => window.open(site.socials.github, "_blank", "noreferrer") },
      { id: "linkedin", label: "LinkedIn", group: "Links", keywords: "profile", run: () => window.open(site.socials.linkedin, "_blank", "noreferrer") },
      { id: "cv", label: "Download CV", hint: "PDF", group: "Links", keywords: "resume curriculum", run: () => window.open(site.cv, "_blank", "noreferrer") },
    ];
    const actions: Command[] = [
      {
        id: "copy-email",
        label: "Copy email address",
        hint: site.email,
        group: "Actions",
        keywords: "contact mail clipboard",
        run: async () => {
          try {
            await navigator.clipboard.writeText(site.email);
            setCopied(true);
            setTimeout(() => setCopied(false), 1400);
          } catch {
            window.location.href = `mailto:${site.email}`;
          }
        },
      },
      { id: "email", label: "Send an email", hint: "mailto", group: "Actions", keywords: "contact reach", run: () => { window.location.href = `mailto:${site.email}`; } },
      { id: "theme", label: "Toggle theme", group: "Actions", keywords: "dark light mode appearance", run: toggleTheme },
    ];
    return [...sections, ...links, ...actions];
  }, [goto, toggleTheme]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) =>
      `${c.label} ${c.hint ?? ""} ${c.keywords ?? ""} ${c.group}`
        .toLowerCase()
        .includes(q),
    );
  }, [commands, query]);

  // Global ⌘K / Ctrl+K listener + "/" quick-open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && k === "k") {
        e.preventDefault();
        if (open) close();
        else openPalette();
      } else if (
        k === "/" &&
        !open &&
        !/^(input|textarea)$/i.test((e.target as HTMLElement)?.tagName ?? "")
      ) {
        e.preventDefault();
        openPalette();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, openPalette, close]);

  // Let a trigger button elsewhere (the nav) open the palette.
  useEffect(() => {
    const onOpen = () => openPalette();
    window.addEventListener("palette:open", onOpen);
    return () => window.removeEventListener("palette:open", onOpen);
  }, [openPalette]);

  // Focus the input on open; restore focus to the trigger on close. Both are
  // DOM sync (no setState), so this stays lint-clean.
  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
    restoreRef.current?.focus();
  }, [open]);

  // Clamp the active index by derivation rather than an effect.
  const activeIndex = filtered.length ? Math.min(active, filtered.length - 1) : 0;

  const run = useCallback(
    (cmd: Command) => {
      const keepOpen = cmd.id === "copy-email" || cmd.id === "theme";
      cmd.run();
      if (!keepOpen) close();
    },
    [close],
  );

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = filtered[activeIndex];
      if (cmd) run(cmd);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  };

  useEffect(() => {
    const row = listRef.current?.querySelector<HTMLElement>(`[data-idx="${activeIndex}"]`);
    row?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!open) return null;

  let lastGroup = "";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <button
        type="button"
        aria-label="Close command palette"
        onClick={close}
        className="absolute inset-0 bg-bg/70 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border-strong bg-bg-elevated shadow-2xl shadow-black/40">
        <div className="flex items-center gap-3 border-b border-border px-4">
          <span className="text-text-faint" aria-hidden>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.2-3.2" />
            </svg>
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onListKey}
            placeholder="Jump to a section, copy my email, open GitHub…"
            className="w-full bg-transparent py-4 text-sm text-text outline-none placeholder:text-text-faint"
            aria-label="Search commands"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="hidden shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-text-faint sm:block">
            ESC
          </kbd>
        </div>

        <ul ref={listRef} className="max-h-[52vh] overflow-y-auto p-2" role="listbox" aria-label="Commands">
          {filtered.length === 0 ? (
            <li className="px-3 py-8 text-center text-sm text-text-faint">
              Nothing matches <span className="text-text-muted">“{query}”</span>
            </li>
          ) : (
            filtered.map((cmd, i) => {
              const showGroup = cmd.group !== lastGroup;
              lastGroup = cmd.group;
              const isActive = i === activeIndex;
              const label =
                cmd.id === "copy-email" && copied ? "Copied to clipboard" : cmd.label;
              return (
                <li key={cmd.id}>
                  {showGroup ? (
                    <p className="mono-label px-3 pb-1 pt-3">{cmd.group}</p>
                  ) : null}
                  <button
                    type="button"
                    data-idx={i}
                    role="option"
                    aria-selected={isActive}
                    onMouseMove={() => setActive(i)}
                    onClick={() => run(cmd)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                      isActive ? "bg-bg-inset text-text" : "text-text-muted"
                    }`}
                  >
                    <span className={isActive ? "text-accent-text" : "text-text-faint"}>
                      <Glyph name={cmd.id === "theme" ? "theme" : cmd.id === "cv" ? "doc" : cmd.id === "email" ? "mail" : cmd.id === "copy-email" ? "copy" : glyphFor[cmd.group]} />
                    </span>
                    <span className="flex-1">{label}</span>
                    {cmd.hint ? (
                      <span className="truncate font-mono text-xs text-text-faint">{cmd.hint}</span>
                    ) : null}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}

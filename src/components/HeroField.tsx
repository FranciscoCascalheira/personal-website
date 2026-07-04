"use client";

import { useEffect, useRef } from "react";

/**
 * The hero's signature moment: a quiet constellation of nodes and edges that
 * reads as a system architecture / data model — the thing Francisco actually
 * builds — rather than a generic particle field. Restraint is the point:
 * a handful of nodes, hairline edges, one accent hue, slow drift, and the
 * occasional "signal" travelling an edge like data moving through a system.
 *
 * Performance + a11y:
 *  - single canvas, DPR-aware, paused when off-screen or tab hidden
 *  - honours prefers-reduced-motion by drawing one static frame
 *  - purely decorative (aria-hidden), never blocks LCP (mounts client-side)
 */

type Node = { x: number; y: number; vx: number; vy: number; r: number };
type Signal = { edge: [number, number]; t: number; speed: number };

const NODE_COUNT = 22;
const LINK_DIST = 0.3; // as a fraction of the min canvas dimension
const MAX_SIGNALS = 4;

export function HeroField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let accent = "224, 167, 62";

    const readAccent = () => {
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue("--accent")
        .trim();
      // convert #rrggbb → "r, g, b" for rgba() with variable alpha
      const m = raw.match(/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
      if (m) {
        accent = `${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(m[3], 16)}`;
      }
    };

    // Deterministic pseudo-random so layout is stable across renders (no
    // Math.random hydration surprises); seeded scatter reads as designed.
    let seed = 20260704;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    let nodes: Node[] = [];
    const signals: Signal[] = [];

    const build = () => {
      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: rnd(),
        y: rnd(),
        vx: (rnd() - 0.5) * 0.00018,
        vy: (rnd() - 0.5) * 0.00018,
        r: 0.9 + rnd() * 1.8,
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // Precompute which node pairs are close enough to be "wired".
    const edgesOf = () => {
      const linkPx = LINK_DIST * Math.min(width, height);
      const edges: [number, number][] = [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = (nodes[i].x - nodes[j].x) * width;
          const dy = (nodes[i].y - nodes[j].y) * height;
          if (Math.hypot(dx, dy) < linkPx) edges.push([i, j]);
        }
      }
      return edges;
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const linkPx = LINK_DIST * Math.min(width, height);
      const edges = edgesOf();

      // edges — opacity falls off with distance
      for (const [i, j] of edges) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = (a.x - b.x) * width;
        const dy = (a.y - b.y) * height;
        const d = Math.hypot(dx, dy);
        const alpha = (1 - d / linkPx) * 0.22;
        ctx.strokeStyle = `rgba(${accent}, ${alpha.toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x * width, a.y * height);
        ctx.lineTo(b.x * width, b.y * height);
        ctx.stroke();
      }

      // signals — a bright dot travelling an edge, like data in flight
      for (const s of signals) {
        const a = nodes[s.edge[0]];
        const b = nodes[s.edge[1]];
        if (!a || !b) continue;
        const x = (a.x + (b.x - a.x) * s.t) * width;
        const y = (a.y + (b.y - a.y) * s.t) * height;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 6);
        g.addColorStop(0, `rgba(${accent}, 0.9)`);
        g.addColorStop(1, `rgba(${accent}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // nodes — a soft core with a faint halo
      for (const n of nodes) {
        const x = n.x * width;
        const y = n.y * height;
        ctx.fillStyle = `rgba(${accent}, 0.62)`;
        ctx.beginPath();
        ctx.arc(x, y, n.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${accent}, 0.14)`;
        ctx.beginPath();
        ctx.arc(x, y, n.r + 3, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = () => {
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        // gentle wrap with margin so nodes drift rather than bounce hard
        if (n.x < -0.05) n.x = 1.05;
        if (n.x > 1.05) n.x = -0.05;
        if (n.y < -0.05) n.y = 1.05;
        if (n.y > 1.05) n.y = -0.05;
      }

      // occasionally launch a signal down an existing edge
      if (signals.length < MAX_SIGNALS && rnd() < 0.012) {
        const edges = edgesOf();
        if (edges.length) {
          signals.push({
            edge: edges[Math.floor(rnd() * edges.length)],
            t: 0,
            speed: 0.004 + rnd() * 0.006,
          });
        }
      }
      for (let k = signals.length - 1; k >= 0; k--) {
        signals[k].t += signals[k].speed;
        if (signals[k].t >= 1) signals.splice(k, 1);
      }
    };

    let raf = 0;
    let running = false;
    const loop = () => {
      step();
      draw();
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || reduced) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    readAccent();
    resize();
    build();
    draw(); // paint an immediate static frame (also the reduced-motion state)

    const onTheme = () => readAccent();
    window.addEventListener("themechange", onTheme);

    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(canvas);

    let onScreen = true;
    const io = new IntersectionObserver(
      ([e]) => {
        onScreen = e.isIntersecting;
        if (onScreen && !document.hidden) start();
        else stop();
      },
      { threshold: 0.01 },
    );
    io.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (onScreen) start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("themechange", onTheme);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* warm base glow — the atmosphere the constellation sits in */}
      <div
        className="absolute right-[-12%] top-[-14%] h-[620px] w-[680px]"
        style={{
          background:
            "radial-gradient(closest-side, var(--glow), transparent 72%)",
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute right-0 top-0 h-[min(78vh,760px)] w-full [mask-image:radial-gradient(ellipse_60%_60%_at_78%_28%,black,transparent_78%)]"
      />
    </div>
  );
}

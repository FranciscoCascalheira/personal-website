import { screen } from "@/lib/case-study-lcom";

/** fig. 0 — the KeyBlitz screen, redrawn as an engraved plate.
 *
 * Not a screenshot: the site draws its figures, so the running game is
 * reconstructed as an SVG in the document's own register — ink on paper (or
 * light on dark), the single amber accent kept for the one line that matters,
 * the danger line at y=420. The game's real palette was already amber on dark
 * blue, so this reads close to native. Ink is `currentColor` (themes with the
 * text), amber is `var(--accent)` (themes on its own). Scales to its container;
 * never overflows. */
export function KeyBlitzPlate() {
  const W = 800;
  const H = 600;
  const dangerY = 430; // the real y=420 danger line, to scale

  // A couple of fixed asteroid outlines, cycled by index — no randomness.
  const rocks = [
    "0,-15 11,-10 15,2 9,14 -6,15 -14,4 -11,-9",
    "-3,-16 12,-11 16,4 6,15 -9,13 -15,0 -12,-12",
  ];

  // On-screen keyboard: rows centred, keys evenly spaced.
  const keyW = 42;
  const gap = 8;
  const rows = screen.keyboardRows.map((r, ri) => {
    const n = r.length;
    const rowW = n * keyW + (n - 1) * gap;
    const x0 = (W - rowW) / 2;
    const y = dangerY + 34 + ri * (keyW + gap) * 0.72;
    return { keys: [...r], x0, y };
  });

  return (
    <figure className="border-y border-border-strong" aria-labelledby="fig0-caption">
      <div className="py-6 sm:py-8">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          role="img"
          aria-label="A redrawn frame of the KeyBlitz game running on MINIX 3"
          fontFamily="var(--font-mono, monospace)"
        >
          {/* the screen bezel */}
          <rect
            x={6}
            y={6}
            width={W - 12}
            height={H - 12}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.35}
            strokeWidth={2}
          />

          {/* HUD — score + lives */}
          <text x={28} y={48} fill="currentColor" fontSize={26} letterSpacing={2}>
            {screen.hud.scoreLabel}
          </text>
          <text x={168} y={48} fill="currentColor" fontSize={26}>
            {screen.hud.score}
          </text>
          {Array.from({ length: screen.hud.lives }).map((_, i) => (
            <text key={i} x={W - 74 + i * 34} y={48} fill="var(--accent)" fontSize={26}>
              ♥
            </text>
          ))}

          {/* falling word-asteroids */}
          {screen.asteroids.map((a, i) => {
            const cx = (W * a.x) / 100;
            const cy = (H * a.y) / 100;
            return (
              <g key={a.word}>
                <text
                  x={cx}
                  y={cy - 20}
                  fill="currentColor"
                  fontSize={22}
                  letterSpacing={1.5}
                  textAnchor="middle"
                >
                  {a.word}
                </text>
                <polygon
                  points={rocks[i % rocks.length]}
                  transform={`translate(${cx} ${cy + 6})`}
                  fill="currentColor"
                  fillOpacity={0.42}
                  stroke="currentColor"
                  strokeOpacity={0.5}
                />
              </g>
            );
          })}

          {/* the danger line — the one amber element (real y=420) */}
          <line x1={6} y1={dangerY} x2={W - 6} y2={dangerY} stroke="var(--accent)" strokeWidth={3} />
          <text x={W - 12} y={dangerY - 10} fill="var(--accent)" fontSize={15} textAnchor="end" letterSpacing={1}>
            y = 420 · Earth
          </text>

          {/* on-screen keyboard */}
          {rows.map((row) =>
            row.keys.map((k, ki) => {
              const x = row.x0 + ki * (keyW + gap);
              return (
                <g key={`${row.y}-${k}`}>
                  <rect
                    x={x}
                    y={row.y}
                    width={keyW}
                    height={keyW * 0.72}
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity={0.4}
                  />
                  <text
                    x={x + keyW / 2}
                    y={row.y + keyW * 0.5}
                    fill="currentColor"
                    fillOpacity={0.85}
                    fontSize={16}
                    textAnchor="middle"
                  >
                    {k}
                  </text>
                </g>
              );
            }),
          )}
        </svg>
      </div>

      <figcaption id="fig0-caption" className="border-t border-border-strong py-3">
        <span className="mono-label">{screen.caption}</span>
      </figcaption>
    </figure>
  );
}

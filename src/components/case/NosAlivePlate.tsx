import {
  PLATE_W,
  PLATE_H,
  nodes,
  stages,
  opsContainer,
} from "@/lib/nosalive-plate";
import { NosAliveDepth } from "./NosAliveDepth";

/** fig. 0 — the NOS Alive site, engraved, with FR Eventos' bars lit.
 *
 *  A static ink-on-paper plate (the Porto plate's language, one figure over).
 *  The whole argument is in one glance: the eighteen lit nodes are the festival
 *  map's green bars AND the eighteen postos in the database; the six ghosts are
 *  the map's red bars, run by other operators and absent from the software. Amber
 *  is the lit accent — a bar the platform ran.
 *
 *  Pure SVG. Strokes carry `.plate-line` and labels `.plate-fade`, so inside the
 *  page's Reveal the plate etches itself in with the house easing; no-JS and
 *  reduced-motion show it settled. On phones it rides the wide-figure rail.
 */
export function NosAlivePlate() {
  return (
    <figure
      className="border-y border-border-strong"
      aria-labelledby="fig0-caption"
    >
      <div className="overflow-x-auto overscroll-x-contain py-7 sm:overflow-visible print:overflow-visible">
        <div className="min-w-[46rem] sm:min-w-0 print:min-w-0">
          <NosAliveDepth>
          <svg
            viewBox={`0 0 ${PLATE_W} ${PLATE_H}`}
            className="block w-full"
            role="img"
            aria-label="A stylised plan of the NOS Alive 2026 site at Algés. Eighteen bars are lit — the twelve numbered bars and six branded stands FR Eventos ran, which are exactly the eighteen in the UniSpot database. Six numbered bars, run by other operators, are drawn as empty ghosts. On a fine-pointer desktop the lit bars stand up off the paper in 3D."
          >
            <defs>
              <pattern
                id="stage-hatch"
                width="7"
                height="7"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="7"
                  className="stroke-border"
                  strokeWidth="1"
                />
              </pattern>
            </defs>

            {/* the ground: perimeter of the recinto */}
            <path
              d="M60 96 L560 78 L980 150 L968 470 L900 560 L150 588 L44 470 Z"
              className="plate-line fill-none stroke-text"
              strokeWidth={1.4}
              pathLength={1}
              style={{ "--plate-delay": "0ms" } as React.CSSProperties}
            />

            {/* the top road */}
            <line
              x1={70}
              y1={112}
              x2={958}
              y2={158}
              className="plate-line stroke-border-strong"
              strokeWidth={1}
              pathLength={1}
              style={{ "--plate-delay": "120ms" } as React.CSSProperties}
            />
            <text
              x={330}
              y={104}
              className="plate-micro plate-fade fill-text-faint font-mono text-[9px] uppercase tracking-[0.14em]"
            >
              av. dr. alfredo magalhães ramalho
            </text>

            {/* the waterfront — a triple line, like the Douro band on the Porto
                plate; the Tejo runs below the promenade */}
            {[0, 4, 8].map((dy, i) => (
              <path
                key={dy}
                d={`M150 ${588 + dy} Q520 ${606 + dy} 900 ${560 + dy}`}
                className={`plate-line fill-none ${
                  i === 1 ? "stroke-border" : "stroke-border-strong"
                }`}
                strokeWidth={i === 1 ? 0.75 : 1}
                pathLength={1}
                style={{ "--plate-delay": "200ms" } as React.CSSProperties}
              />
            ))}
            <text
              x={620}
              y={598}
              className="plate-micro plate-fade fill-text-faint font-mono text-[9px] uppercase tracking-[0.18em]"
            >
              passeio marítimo de algés · rio tejo
            </text>

            {/* the stages */}
            {stages.map((s) => (
              <g
                key={s.label}
                className="plate-fade"
                style={{ "--plate-delay": "300ms" } as React.CSSProperties}
              >
                <rect
                  x={s.x}
                  y={s.y}
                  width={s.w}
                  height={s.h}
                  fill="url(#stage-hatch)"
                  className="stroke-text-muted"
                  strokeWidth={1}
                />
                <text
                  x={s.x + s.w / 2}
                  y={s.y + s.h / 2 + 3}
                  textAnchor="middle"
                  className="plate-micro fill-text font-mono text-[9px] uppercase tracking-[0.1em]"
                >
                  {s.label}
                </text>
              </g>
            ))}

            {/* the ops container behind the main stage */}
            <g
              className="plate-fade"
              style={{ "--plate-delay": "360ms" } as React.CSSProperties}
            >
              <rect
                x={opsContainer.x}
                y={opsContainer.y}
                width={opsContainer.w}
                height={opsContainer.h}
                className="fill-none stroke-accent"
                strokeWidth={1.25}
              />
              <text
                x={opsContainer.x + opsContainer.w / 2}
                y={opsContainer.y - 5}
                textAnchor="middle"
                className="plate-micro fill-accent-text font-mono text-[8px] uppercase tracking-[0.14em]"
              >
                ops
              </text>
            </g>

            {/* the bars run by other operators — flat ghosts, absent from the
                platform. They stay on the paper; the depth layer never lifts
                them, so on desktop they read as flat against the raised lit bars. */}
            <g>
              {nodes
                .filter((n) => !n.lit)
                .map((n) => (
                  <g
                    key={`${n.label}-${n.x}`}
                    className="plate-fade"
                    style={{ "--plate-delay": "440ms" } as React.CSSProperties}
                  >
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={6}
                      className="fill-bg stroke-text-faint"
                      strokeWidth={1}
                      strokeDasharray="2 2"
                    />
                    <text
                      x={n.x}
                      y={n.y - 12}
                      textAnchor="middle"
                      className="plate-micro fill-text-faint font-mono text-[10px]"
                    >
                      {n.label}
                    </text>
                  </g>
                ))}
            </g>

            {/* FR Eventos' bars — the amber marks. This is the .plate-net layer
                the WebGL overlay lifts: it fades under [data-plate-3d] and these
                marks stand up off the paper as 3D pins. Without JS or WebGL it
                stays exactly this engraving. */}
            <g className="plate-net">
              {nodes
                .filter((n) => n.lit)
                .map((n) => (
                  <g
                    key={`mark-${n.label}-${n.x}`}
                    className="plate-fade"
                    style={{ "--plate-delay": "440ms" } as React.CSSProperties}
                  >
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={7}
                      className="fill-bg stroke-accent"
                      strokeWidth={1.5}
                    />
                    <circle cx={n.x} cy={n.y} r={2.6} className="fill-text" />
                  </g>
                ))}
            </g>

            {/* the lit bars' numbers live OUTSIDE .plate-net: the WebGL layer
                redraws the amber marks but not the type, so if the labels faded
                with the marks the FR bars would lose their numbers in 3D. */}
            <g>
              {nodes
                .filter((n) => n.lit)
                .map((n) => (
                  <text
                    key={`lbl-${n.label}-${n.x}`}
                    x={n.x}
                    y={n.y - 12}
                    textAnchor="middle"
                    className={`plate-fade plate-micro font-mono text-[10px] ${
                      n.kind === "stand" ? "fill-accent-text" : "fill-text"
                    }`}
                    style={{ "--plate-delay": "440ms" } as React.CSSProperties}
                  >
                    {n.label}
                  </text>
                ))}
            </g>

            {/* cartouche — over the water, bottom-left, like the Porto plate */}
            <g
              className="plate-fade"
              style={{ "--plate-delay": "560ms" } as React.CSSProperties}
            >
              <text x={54} y={548} className="fill-text font-serif text-[22px] italic">
                NOS Alive 2026
              </text>
              <text
                x={56}
                y={566}
                className="plate-micro fill-text-faint font-mono text-[9px] uppercase tracking-[0.14em]"
              >
                38.70° N · 9.23° W · algés · 9–11 jul
              </text>
              <text
                x={56}
                y={580}
                className="plate-micro fill-text-muted font-mono text-[9px] uppercase tracking-[0.14em]"
              >
                18 bars · 209 staff · FR eventos
              </text>
            </g>

            {/* legend — the key to lit vs ghost */}
            <g
              className="plate-micro plate-fade"
              style={{ "--plate-delay": "620ms" } as React.CSSProperties}
            >
              <circle cx={628} cy={540} r={5} className="fill-bg stroke-accent" strokeWidth={1.5} />
              <text x={640} y={543} className="fill-text-muted font-mono text-[9px]">
                in the platform
              </text>
              <circle
                cx={628}
                cy={558}
                r={5}
                className="fill-bg stroke-text-faint"
                strokeWidth={1}
                strokeDasharray="2 2"
              />
              <text x={640} y={561} className="fill-text-faint font-mono text-[9px]">
                other operators
              </text>
            </g>
          </svg>
          </NosAliveDepth>
        </div>
      </div>

      <figcaption
        id="fig0-caption"
        className="border-t border-border-strong py-3"
      >
        <span className="mono-label">
          fig. 0 — NOS Alive 2026, Algés · 18 bars lit = FR Eventos = the
          database · 6 ghosts = other operators, absent from it
        </span>
      </figcaption>
    </figure>
  );
}

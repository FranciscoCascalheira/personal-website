import {
  PLATE_W,
  PLATE_H,
  freguesias,
  context,
  riverD,
  bridges,
  feup,
} from "@/lib/porto-plate";
import {
  companies,
  candidates,
  edges,
  nodeAt,
  edgePath,
  traceD,
} from "@/lib/plate-network";

/** fig. 0 — the survey plate. Porto engraved from the official administrative
 *  charts, with the TERA-LINKR matching network etched over the freguesias the
 *  system actually geolocates by. Water is hatched, land is bare paper, the
 *  Douro is the legal Porto–Gaia boundary stroked as a band. One amber edge is
 *  an accepted application; one dashed line is the author's own route into the
 *  city. Pure SVG on paper: it renders complete without JS and inherits both
 *  themes through the ink/paper variables.
 */

const KM = 74.45; // plate scale: pixels per kilometre

const inkFaint = "var(--text-faint)";

export function Fig0Plate() {
  return (
    <svg
      viewBox={`0 0 ${PLATE_W} ${PLATE_H}`}
      className="block w-full"
      role="img"
      aria-label="Engraved survey plate of Porto: the seven freguesias with the TERA-LINKR matching network etched over them — candidate and company nodes joined by application lines, one accepted match in amber, and a dashed line tracing the author's route from Proença-a-Nova to FEUP."
    >
      <defs>
        <pattern
          id="plate-water"
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
        >
          <line
            x1="0"
            y1="3"
            x2="6"
            y2="3"
            stroke="var(--text)"
            strokeWidth="0.4"
            opacity="0.32"
          />
        </pattern>
        <clipPath id="plate-neat">
          <rect x="12" y="12" width={PLATE_W - 24} height={PLATE_H - 24} />
        </clipPath>
      </defs>

      {/* paper margin, then everything inside the neat line */}
      <rect width={PLATE_W} height={PLATE_H} fill="var(--bg)" />

      <g clipPath="url(#plate-neat)">
        {/* the sea: hatched water under everything */}
        <rect
          className="plate-fade"
          width={PLATE_W}
          height={PLATE_H}
          fill="url(#plate-water)"
        />

        {/* neighbouring municipalities — faint context land */}
        <g className="plate-fade">
          {context.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="var(--bg)"
              stroke="var(--text)"
              strokeWidth="0.35"
              strokeOpacity="0.28"
            />
          ))}
        </g>

        {/* the seven freguesias */}
        <g>
          {freguesias.map((f) => (
            <path
              key={f.name}
              className="plate-line"
              style={{ "--plate-delay": "100ms" } as React.CSSProperties}
              d={f.d}
              fill="var(--bg)"
              stroke="var(--text)"
              strokeWidth="0.9"
              strokeOpacity="0.75"
              pathLength={1}
            >
              <title>{f.name}</title>
            </path>
          ))}
        </g>

        {/* the Douro — banks, cleared bed, hatched water */}
        <g strokeLinejoin="round" strokeLinecap="round" fill="none">
          <path
            className="plate-line"
            style={{ "--plate-delay": "250ms" } as React.CSSProperties}
            id="plate-river"
            d={riverD}
            stroke="var(--text)"
            strokeWidth="17.4"
            strokeOpacity="0.8"
            pathLength={1}
          />
          <path d={riverD} stroke="var(--bg)" strokeWidth="16" />
          <path
            className="plate-fade"
            style={{ "--plate-delay": "350ms" } as React.CSSProperties}
            d={riverD}
            stroke="url(#plate-water)"
            strokeWidth="16"
          />
        </g>

        {/* bridges at true position — two hairlines across the band */}
        <g
          className="plate-fade"
          style={{ "--plate-delay": "450ms" } as React.CSSProperties}
          stroke="var(--text)"
          strokeWidth="0.8"
          strokeOpacity="0.85"
        >
          {bridges.map((b) => (
            <g key={b.name} transform={`translate(${b.x} ${b.y}) rotate(${b.angle})`}>
              <title>{`Ponte ${b.name}`}</title>
              <line x1="-1.4" y1="-12" x2="-1.4" y2="12" />
              <line x1="1.4" y1="-12" x2="1.4" y2="12" />
            </g>
          ))}
        </g>

        {/* water + neighbour lettering */}
        <g
          className="plate-fade plate-micro"
          style={{ "--plate-delay": "450ms" } as React.CSSProperties}
        >
          <text
            fontSize="12"
            letterSpacing="0.3em"
            fill={inkFaint}
            fontStyle="italic"
            className="font-serif"
            transform="rotate(-77 58 300)"
            x="58"
            y="300"
            textAnchor="middle"
          >
            OCEANO ATLÂNTICO
          </text>
          <text dy="-6" fontSize="11" letterSpacing="0.28em" fill={inkFaint} fontStyle="italic" className="font-serif">
            <textPath href="#plate-river" startOffset="31%">
              RIO DOURO
            </textPath>
          </text>
          <text x="128" y="46" fontSize="7.5" letterSpacing="0.22em" fill={inkFaint} opacity="0.75" className="font-mono">
            MATOSINHOS
          </text>
          <text x="912" y="120" fontSize="7.5" letterSpacing="0.22em" fill={inkFaint} opacity="0.75" className="font-mono" textAnchor="end">
            GONDOMAR
          </text>
          <text x="620" y="520" fontSize="7.5" letterSpacing="0.22em" fill={inkFaint} opacity="0.75" className="font-mono">
            VILA NOVA DE GAIA
          </text>
        </g>

        {/* freguesia lettering */}
        <g
          className="plate-fade plate-micro"
          style={{ "--plate-delay": "450ms" } as React.CSSProperties}
          fontSize="8.5"
          letterSpacing="0.16em"
          fill={inkFaint}
        >
          {freguesias.map((f) => (
            <text
              key={f.name}
              x={f.cx}
              y={f.label === "CEDOFEITA · SÉ" ? f.cy + 26 : f.cy - 10}
              textAnchor="middle"
              className="font-mono"
            >
              {f.label}
            </text>
          ))}
        </g>

        {/* the matching network — the real schema shape over real geography.
            plate-net layers are superseded by the WebGL depth layer when it
            mounts (the [data-plate-3d] rules in globals.css). */}
        <g fill="none" className="plate-net">
          {edges.map((e) => (
            <path
              key={`${e.from}-${e.to}`}
              className="plate-line"
              style={{ "--plate-delay": "550ms" } as React.CSSProperties}
              d={edgePath(e.from, e.to, e.bend)}
              stroke={e.amber ? "var(--accent)" : "var(--text)"}
              strokeWidth={e.amber ? 1.2 : 0.7}
              strokeOpacity={e.amber ? 1 : 0.45}
              pathLength={1}
            />
          ))}
        </g>
        <g
          className="plate-fade plate-net"
          style={{ "--plate-delay": "650ms" } as React.CSSProperties}
        >
          {candidates.map((n) => (
            <circle key={n.id} cx={n.x} cy={n.y} r="2.3" fill="var(--text)" />
          ))}
          {companies.map((n) => (
            <rect
              key={n.id}
              x={n.x - 2.6}
              y={n.y - 2.6}
              width="5.2"
              height="5.2"
              fill="var(--bg)"
              stroke="var(--text)"
              strokeWidth="0.9"
            />
          ))}
          {/* amber endpoints on the accepted match */}
          <circle cx={nodeAt("y-campanha").x} cy={nodeAt("y-campanha").y} r="3.4" fill="none" stroke="var(--accent)" strokeWidth="0.9" />
          <circle cx={nodeAt("c-cedofeita").x} cy={nodeAt("c-cedofeita").y} r="4.2" fill="none" stroke="var(--accent)" strokeWidth="0.9" />
        </g>

        {/* the author's route — dashed, ends at FEUP */}
        <g
          className="plate-fade"
          style={{ "--plate-delay": "800ms" } as React.CSSProperties}
          fill="none"
        >
          {/* opacity-only hide: the textPath label keeps using this geometry */}
          <path
            className="plate-net"
            id="plate-trace"
            d={traceD}
            stroke="var(--text)"
            strokeWidth="0.9"
            strokeOpacity="0.5"
            strokeDasharray="3 4"
          />
          <circle cx={feup.x} cy={feup.y} r="2.8" fill="none" stroke="var(--text)" strokeWidth="0.9" />
          <text x={feup.x + 8} y={feup.y + 3} fontSize="7" letterSpacing="0.18em" fill={inkFaint} className="font-mono plate-micro">
            FEUP
          </text>
          <text dy="-4.5" fontSize="6.8" letterSpacing="0.2em" fill={inkFaint} className="plate-micro font-mono">
            <textPath href="#plate-trace" startOffset="16%">
              PROENÇA-A-NOVA → PORTO · 2024
            </textPath>
          </text>
        </g>

        {/* title cartouche, set in the ocean like a proper survey */}
        <g
          className="plate-fade"
          style={{ "--plate-delay": "650ms" } as React.CSSProperties}
        >
          <rect x="26" y="402" width="238" height="128" fill="var(--bg)" stroke="var(--border-strong)" strokeWidth="1" />
          <rect x="30" y="406" width="230" height="120" fill="none" stroke="var(--border)" strokeWidth="0.5" />
          <text x="41" y="454" fontSize="24" fill="var(--text)" className="font-serif">
            op<tspan fontStyle="italic" fill="var(--accent-text)">PORTO</tspan>nidades
          </text>
          <g className="plate-micro">
            <text x="42" y="426" fontSize="7" letterSpacing="0.2em" fill={inkFaint} className="font-mono">
              PUBLIC RECORD — FIG. 0
            </text>
            <text x="42" y="472" fontSize="7" letterSpacing="0.18em" fill={inkFaint} className="font-mono">
              THE SYSTEM OVER THE CITY IT SERVES
            </text>
            <line x1="42" y1="482" x2="248" y2="482" stroke="var(--border-strong)" strokeWidth="0.6" />
            <text x="42" y="496" fontSize="6.6" letterSpacing="0.14em" fill={inkFaint} className="font-mono">
              CÂMARA MUNICIPAL DO PORTO · 5.ª EDIÇÃO
            </text>
            <text x="42" y="507" fontSize="6.6" letterSpacing="0.14em" fill={inkFaint} className="font-mono">
              12 MODELS · 294 COMMITS · AGES 18–21
            </text>
            {/* scale bar — true to the projection */}
            <g stroke="var(--text)" strokeWidth="0.8" strokeOpacity="0.8">
              <line x1="42" y1="518" x2={42 + 2 * KM} y2="518" />
              <line x1="42" y1="514.5" x2="42" y2="521.5" />
              <line x1={42 + KM} y1="515.5" x2={42 + KM} y2="520.5" />
              <line x1={42 + 2 * KM} y1="514.5" x2={42 + 2 * KM} y2="521.5" />
            </g>
            <text x={44 + 2 * KM} y="521" fontSize="6.4" letterSpacing="0.12em" fill={inkFaint} className="font-mono">
              0 — 1 — 2 KM
            </text>
          </g>
        </g>

        {/* north arrow */}
        <g
          className="plate-fade"
          style={{ "--plate-delay": "450ms" } as React.CSSProperties}
          stroke="var(--text)"
          strokeOpacity="0.8"
        >
          <line x1="36" y1="66" x2="36" y2="40" strokeWidth="0.8" />
          <path d="M36 36l-3.2 7 3.2-2.2 3.2 2.2z" fill="var(--text)" stroke="none" />
          <text x="43" y="45" fontSize="7.5" letterSpacing="0.1em" fill={inkFaint} className="font-mono plate-micro" stroke="none">
            N
          </text>
        </g>
      </g>

      {/* corner marginalia — knocked out of the hatch on a paper halo */}
      <g
        className="plate-fade font-mono plate-micro"
        style={
          {
            "--plate-delay": "450ms",
            paintOrder: "stroke",
          } as React.CSSProperties
        }
        fontSize="6.8"
        letterSpacing="0.18em"
        fill={inkFaint}
        stroke="var(--bg)"
        strokeWidth="2.5"
      >
        <text x={PLATE_W - 22} y="28" textAnchor="end">
          41°09′ N · 8°37′ W
        </text>
        <text x={PLATE_W - 22} y={PLATE_H - 21} textAnchor="end">
          CARTA ADMINISTRATIVA OFICIAL · EPSG:3763
        </text>
      </g>

      {/* the neat lines */}
      <g fill="none">
        <rect x="6" y="6" width={PLATE_W - 12} height={PLATE_H - 12} stroke="var(--border-strong)" strokeWidth="1.2" />
        <rect x="12" y="12" width={PLATE_W - 24} height={PLATE_H - 24} stroke="var(--border)" strokeWidth="0.5" />
      </g>
    </svg>
  );
}

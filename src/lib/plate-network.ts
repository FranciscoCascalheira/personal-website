import { feup } from "./porto-plate";

/** The matching network drawn over the fig. 0 plate — shared by the flat SVG
 *  engraving and the WebGL depth layer so both render the same geometry.
 *  Two mark types over real parish geography; positions are hand-set relative
 *  to freguesia centroids; edges follow the real schema shape
 *  (candidate → application → vacancy → company).
 */

export type PlateNode = { id: string; x: number; y: number };
export type PlateEdge = {
  from: string;
  to: string;
  bend: number;
  amber?: boolean;
};

export const companies: PlateNode[] = [
  { id: "c-cedofeita", x: 543, y: 305 },
  { id: "c-ramalde", x: 397, y: 194 },
  { id: "c-lordelo", x: 366, y: 302 },
  { id: "c-bonfim", x: 668, y: 316 },
];

export const candidates: PlateNode[] = [
  { id: "y-campanha", x: 778, y: 296 },
  { id: "y-campanha-ne", x: 813, y: 246 },
  { id: "y-paranhos", x: 601, y: 168 },
  { id: "y-foz", x: 196, y: 262 },
  { id: "y-bonfim", x: 690, y: 354 },
  { id: "y-ramalde", x: 330, y: 148 },
];

export const edges: PlateEdge[] = [
  // the amber one: Campanhã → downtown. The door the platform exists to open.
  { from: "y-campanha", to: "c-cedofeita", bend: -26, amber: true },
  { from: "y-campanha-ne", to: "c-bonfim", bend: 14 },
  { from: "y-paranhos", to: "c-ramalde", bend: -12 },
  { from: "y-foz", to: "c-lordelo", bend: 16 },
  { from: "y-bonfim", to: "c-cedofeita", bend: 18 },
  { from: "y-ramalde", to: "c-ramalde", bend: 10 },
];

export const nodeAt = (id: string): PlateNode =>
  [...companies, ...candidates].find((n) => n.id === id)!;

/** Control point of an edge's quadratic curve, offset perpendicular to the chord. */
function edgeControl(from: string, to: string, bend: number) {
  const a = nodeAt(from);
  const b = nodeAt(to);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  return {
    x: (a.x + b.x) / 2 + (-dy / len) * bend,
    y: (a.y + b.y) / 2 + (dx / len) * bend,
  };
}

export function edgePath(from: string, to: string, bend: number): string {
  const a = nodeAt(from);
  const b = nodeAt(to);
  const c = edgeControl(from, to, bend);
  return `M${a.x} ${a.y}Q${c.x.toFixed(1)} ${c.y.toFixed(1)} ${b.x} ${b.y}`;
}

export function sampleEdge(
  from: string,
  to: string,
  bend: number,
  n: number,
): { x: number; y: number }[] {
  const a = nodeAt(from);
  const b = nodeAt(to);
  const c = edgeControl(from, to, bend);
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    pts.push({
      x: u * u * a.x + 2 * u * t * c.x + t * t * b.x,
      y: u * u * a.y + 2 * u * t * c.y + t * t * b.y,
    });
  }
  return pts;
}

/** The author's route: enters the frame from the southeast (Proença-a-Nova is
 *  ~130 km inland on that bearing) and ends at FEUP. A cubic sweep across the
 *  neighbouring land, then a short quadratic settle into the campus. */
const traceCubic = {
  p0: { x: 986, y: 470 },
  c1: { x: 880, y: 452 },
  c2: { x: 760, y: 330 },
  p1: { x: feup.x + 40, y: feup.y + 52 },
};
const traceQuad = {
  c: { x: feup.x + 16, y: feup.y + 18 },
  p: { x: feup.x, y: feup.y },
};

export const traceD = `M${traceCubic.p0.x} ${traceCubic.p0.y}C${traceCubic.c1.x} ${traceCubic.c1.y} ${traceCubic.c2.x} ${traceCubic.c2.y} ${traceCubic.p1.x} ${traceCubic.p1.y}Q${traceQuad.c.x} ${traceQuad.c.y} ${traceQuad.p.x} ${traceQuad.p.y}`;

export function sampleTrace(n: number): { x: number; y: number }[] {
  const { p0, c1, c2, p1 } = traceCubic;
  const pts = [];
  const nCubic = Math.round(n * 0.78);
  for (let i = 0; i <= nCubic; i++) {
    const t = i / nCubic;
    const u = 1 - t;
    pts.push({
      x: u ** 3 * p0.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t ** 3 * p1.x,
      y: u ** 3 * p0.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t ** 3 * p1.y,
    });
  }
  const nQuad = n - nCubic;
  for (let i = 1; i <= nQuad; i++) {
    const t = i / nQuad;
    const u = 1 - t;
    pts.push({
      x: u * u * p1.x + 2 * u * t * traceQuad.c.x + t * t * traceQuad.p.x,
      y: u * u * p1.y + 2 * u * t * traceQuad.c.y + t * t * traceQuad.p.y,
    });
  }
  return pts;
}

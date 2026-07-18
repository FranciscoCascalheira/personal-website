// fig. 0 — the NOS Alive 2026 site, engraved. A stylised plan, not a survey:
// the promenade at Algés, the main stages, and the bars laid where the festival's
// own site map puts them. The point of the figure is the lit/ghost split —
//
//   lit   = a green node on the official map = a Posto in the UniSpot database.
//           Eighteen of them: twelve numbered bars + six branded stands.
//   ghost = a red node on the map = a bar run by another operator, absent from
//           the database. Six of them: 4, 11, 13, 15, 16, 17.
//
// So the plate IS the corroboration: the software's eighteen bars are exactly
// the festival's eighteen green ones. Node positions echo the map's arrangement
// (an arc along the top and right, the waterfront below); they are illustrative,
// and the caption + aria-label carry the meaning, as with the Porto plate.

export const PLATE_W = 1000;
export const PLATE_H = 620;

export type PlateNode = {
  /** number for a numbered bar, letters for a branded stand */
  label: string;
  x: number;
  y: number;
  /** lit = FR Eventos, in the database; ghost = another operator */
  lit: boolean;
  kind: "bar" | "stand";
};

export const nodes: PlateNode[] = [
  // twelve numbered bars — lit (the green numbered nodes on the map)
  { label: "1", x: 150, y: 360, lit: true, kind: "bar" },
  { label: "2", x: 332, y: 348, lit: true, kind: "bar" },
  { label: "3", x: 176, y: 205, lit: true, kind: "bar" },
  { label: "5", x: 470, y: 205, lit: true, kind: "bar" },
  { label: "6", x: 560, y: 200, lit: true, kind: "bar" },
  { label: "7", x: 548, y: 300, lit: true, kind: "bar" },
  { label: "8", x: 866, y: 300, lit: true, kind: "bar" },
  { label: "9", x: 950, y: 214, lit: true, kind: "bar" },
  { label: "10", x: 914, y: 286, lit: true, kind: "bar" },
  { label: "12", x: 906, y: 476, lit: true, kind: "bar" },
  { label: "14", x: 576, y: 436, lit: true, kind: "bar" },
  { label: "18", x: 202, y: 506, lit: true, kind: "bar" },
  // six branded stands — lit (the green lettered nodes on the map)
  { label: "CG", x: 296, y: 236, lit: true, kind: "stand" },
  { label: "CG", x: 662, y: 476, lit: true, kind: "stand" },
  { label: "CG", x: 882, y: 176, lit: true, kind: "stand" },
  { label: "CC", x: 626, y: 226, lit: true, kind: "stand" },
  { label: "D", x: 352, y: 306, lit: true, kind: "stand" },
  { label: "RB", x: 820, y: 470, lit: true, kind: "stand" },
  // six numbered bars run by other operators — ghost (the red nodes on the map)
  { label: "4", x: 250, y: 130, lit: false, kind: "bar" },
  { label: "11", x: 946, y: 380, lit: false, kind: "bar" },
  { label: "13", x: 746, y: 456, lit: false, kind: "bar" },
  { label: "15", x: 430, y: 410, lit: false, kind: "bar" },
  { label: "16", x: 350, y: 430, lit: false, kind: "bar" },
  { label: "17", x: 300, y: 520, lit: false, kind: "bar" },
];

export type PlateStage = {
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export const stages: PlateStage[] = [
  { label: "PALCO CLUBBING", x: 400, y: 245, w: 120, h: 100 },
  { label: "PALCO NOS", x: 620, y: 240, w: 200, h: 120 },
  { label: "PALCO COMÉDIA", x: 430, y: 470, w: 130, h: 90 },
];

/** The container behind the main stage where support ran — an amber mark. */
export const opsContainer = { x: 706, y: 188, w: 40, h: 22 };

import type { PackagingSpec } from "./domain";

/**
 * Forenklet utbrettet stansemønster for FEFCO 0201 og 0427. Alle mål er i mm,
 * med origo øverst til venstre og y nedover.
 *
 * Brukes av forhåndsvisningen i konfiguratoren og av prisreglene i mocken
 * (arkstørrelsen gir papp-forbruket). Filen har ingen avhengigheter, så den
 * kan kjøres direkte med Node.
 */

export type Point = [number, number];

export type Dieline = {
  /** Arkets bredde og høyde. */
  width: number;
  height: number;
  /** Kuttlinjer (ytterkant og slisser). */
  cuts: Point[][];
  /** Rillelinjer der pappen brettes. */
  creases: Point[][];
  /** Paneler med navn, til fyll og etiketter. */
  panels: { x: number; y: number; width: number; height: number; label: string }[];
};

const GLUE_FLAP = 35;

/** FEFCO 0201: fire sider i rekke med limflik, og klaffer oppe og nede. */
function rsc(l: number, w: number, h: number): Dieline {
  const flap = w / 2;
  const right = GLUE_FLAP + 2 * l + 2 * w;
  const bottom = 2 * flap + h;
  const xs = [GLUE_FLAP, GLUE_FLAP + l, GLUE_FLAP + l + w, GLUE_FLAP + 2 * l + w, right];
  const inset = Math.min(10, h / 10);

  const cuts: Point[][] = [
    [
      [GLUE_FLAP, flap],
      [GLUE_FLAP, 0],
      [right, 0],
      [right, bottom],
      [GLUE_FLAP, bottom],
      [GLUE_FLAP, flap + h],
    ],
    [
      [GLUE_FLAP, flap],
      [0, flap + inset],
      [0, flap + h - inset],
      [GLUE_FLAP, flap + h],
    ],
    // Slisser mellom klaffene
    ...xs.slice(1, 4).flatMap((x): Point[][] => [
      [
        [x, 0],
        [x, flap],
      ],
      [
        [x, flap + h],
        [x, bottom],
      ],
    ]),
  ];

  const creases: Point[][] = [
    [
      [GLUE_FLAP, flap],
      [right, flap],
    ],
    [
      [GLUE_FLAP, flap + h],
      [right, flap + h],
    ],
    ...xs.slice(0, 4).map((x): Point[] => [
      [x, flap],
      [x, flap + h],
    ]),
  ];

  const names = ["Langside", "Kortside", "Langside", "Kortside"];
  const panels = names.flatMap((label, i) => {
    const x = xs[i];
    const width = xs[i + 1] - x;
    return [
      { x, y: 0, width, height: flap, label: "Klaff" },
      { x, y: flap, width, height: h, label },
      { x, y: flap + h, width, height: flap, label: "Klaff" },
    ];
  });
  panels.push({ x: 0, y: flap, width: GLUE_FLAP, height: h, label: "" });

  return { width: right, height: bottom, cuts, creases, panels };
}

/**
 * FEFCO 0427, forenklet: bunn i midten, doble sidevegger, bakvegg, lokk med
 * sideklaffer og innstikk foran, og dobbel forkant.
 */
function rett(l: number, w: number, h: number): Dieline {
  const tuck = Math.max(15, Math.round(h * 0.8));
  const sideFlap = h * 0.9;
  const left = 2 * h;
  const right = left + l;
  const width = l + 4 * h;
  const y = [0, tuck, tuck + h, tuck + h + w, tuck + 2 * h + w, tuck + 2 * h + 2 * w, tuck + 3 * h + 2 * w];
  const height = tuck + 4 * h + 2 * w;
  const chamfer = Math.min(tuck, l / 6);
  const inset = Math.min(10, w / 10);

  const cuts: Point[][] = [
    [
      [left, y[1]],
      [left + chamfer, 0],
      [right - chamfer, 0],
      [right, y[1]],
      [right, y[2]],
      [right + sideFlap, y[2] + inset],
      [right + sideFlap, y[3] - inset],
      [right, y[3]],
      [right, y[4]],
      [width, y[4]],
      [width, y[5]],
      [right, y[5]],
      [right, height],
      [left, height],
      [left, y[5]],
      [0, y[5]],
      [0, y[4]],
      [left, y[4]],
      [left, y[3]],
      [left - sideFlap, y[3] - inset],
      [left - sideFlap, y[2] + inset],
      [left, y[2]],
      [left, y[1]],
    ],
  ];

  const creases: Point[][] = [
    ...y.slice(1).map((yy): Point[] => [
      [left, yy],
      [right, yy],
    ]),
    [
      [left, y[2]],
      [left, y[3]],
    ],
    [
      [right, y[2]],
      [right, y[3]],
    ],
    ...[h, left, right, right + h].map((x): Point[] => [
      [x, y[4]],
      [x, y[5]],
    ]),
  ];

  const panels = [
    { x: left, y: 0, width: l, height: tuck, label: "Innstikk" },
    { x: left, y: y[1], width: l, height: h, label: "Lokkant" },
    { x: left, y: y[2], width: l, height: w, label: "Lokk" },
    { x: left, y: y[3], width: l, height: h, label: "Bakvegg" },
    { x: left, y: y[4], width: l, height: w, label: "Bunn" },
    { x: left, y: y[5], width: l, height: h, label: "Forkant" },
    { x: left, y: y[6], width: l, height: h, label: "" },
    { x: 0, y: y[4], width: h, height: w, label: "" },
    { x: h, y: y[4], width: h, height: w, label: "Side" },
    { x: right, y: y[4], width: h, height: w, label: "Side" },
    { x: right + h, y: y[4], width: h, height: w, label: "" },
  ];

  return { width, height, cuts, creases, panels };
}

export function dieline(spec: Pick<PackagingSpec, "style" | "innerDimensionsMm">): Dieline {
  const { length, width, height } = spec.innerDimensionsMm;
  return spec.style === "0427" ? rett(length, width, height) : rsc(length, width, height);
}

/** Arkets areal i m², som er papp-forbruket per eske. */
export function sheetAreaM2(spec: Pick<PackagingSpec, "style" | "innerDimensionsMm">): number {
  const { width, height } = dieline(spec);
  return (width * height) / 1_000_000;
}

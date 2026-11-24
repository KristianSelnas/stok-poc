import { t } from "./dictionary";
import type { PackagingSpec, SpecChange } from "./domain";

/**
 * Hjelpefunksjoner for spesifikasjoner på skreddersydd emballasje. Brukes av
 * variantskjemaet på Min side (fase B), konfiguratoren (fase C) og AI-en (fase D),
 * så alle viser endringer på samme måte.
 */

export const styleLabels: Record<string, string> = {
  "0201": "Amerikanereske (FEFCO 0201)",
  "0427": "Postboks med lokk (FEFCO 0427)",
};

export const boardOptions = ["E-bølge", "B-bølge", "C-bølge", "BC dobbelbølge"];
export const colorOptions = ["Brun", "Hvit", "Sort"];

const nb = new Intl.NumberFormat("nb-NO");

export function formatDimensions(spec: PackagingSpec): string {
  const { length, width, height } = spec.innerDimensionsMm;
  return `${nb.format(length)} x ${nb.format(width)} x ${nb.format(height)} mm`;
}

export function formatPrint(print: PackagingSpec["print"]): string {
  if (!print || print.colors === 0) return "Uten trykk";
  return `${print.colors} ${print.colors === 1 ? "farge" : "farger"}: ${print.description}`;
}

/**
 * Navn på en variant: originalnavnet med nye mål, f.eks.
 * «Brødeske med logo, 400 x 300 x 150 mm» blir «Brødeske med logo, 400 x 300 x 200 mm».
 */
export function specName(baseName: string, spec: PackagingSpec): string {
  const base = baseName.replace(/,\s*[\d\s]+x[\d\s]+x[\d\s]+mm\s*$/i, "").trim();
  return `${base}, ${formatDimensions(spec)}`;
}

type Comparable = { spec: PackagingSpec; quantity: number };

/** Endringene fra originalen til varianten, i fast rekkefølge. */
export function diffSpec(original: Comparable, next: Comparable): SpecChange[] {
  const a = original.spec;
  const b = next.spec;
  const fields: [string, string, string, string][] = [
    ["style", "Type", styleLabels[a.style] ?? a.style, styleLabels[b.style] ?? b.style],
    [
      "length",
      "Lengde",
      `${nb.format(a.innerDimensionsMm.length)} mm`,
      `${nb.format(b.innerDimensionsMm.length)} mm`,
    ],
    [
      "width",
      "Bredde",
      `${nb.format(a.innerDimensionsMm.width)} mm`,
      `${nb.format(b.innerDimensionsMm.width)} mm`,
    ],
    [
      "height",
      "Høyde",
      `${nb.format(a.innerDimensionsMm.height)} mm`,
      `${nb.format(b.innerDimensionsMm.height)} mm`,
    ],
    ["board", "Kvalitet", a.board, b.board],
    ["color", "Farge", a.color, b.color],
    ["print", "Trykk", formatPrint(a.print), formatPrint(b.print)],
    ["notes", "Merknad", a.notes ?? "–", b.notes ?? "–"],
    ["quantity", "Antall", `${nb.format(original.quantity)} stk.`, `${nb.format(next.quantity)} stk.`],
  ];
  return fields
    .filter(([, , from, to]) => from !== to)
    .map(([field, label, from, to]) => ({ field, label, from, to }));
}

// ---------------------------------------------------------------------------
// Konfiguratoren (fase C)
// ---------------------------------------------------------------------------

export const styleOptions = ["0201", "0427"] as const;

export const styleShortLabels: Record<string, string> = {
  "0201": "Amerikanereske",
  "0427": "Postboks med lokk",
};

export const boardDescriptions: Record<string, string> = {
  "E-bølge": "1,5 mm. Små esker og fint trykk",
  "B-bølge": "3 mm. Det vanlige valget til forsendelse",
  "C-bølge": "4 mm. Bedre stablestyrke",
  "BC dobbelbølge": "7 mm. Tunge eller skjøre varer",
};

type Range = [min: number, max: number];

/** Innvendige mål (mm) som maskinene kan lage, per kassetype. */
export const customLimits: Record<string, { length: Range; width: Range; height: Range }> = {
  "0201": { length: [100, 1200], width: [80, 800], height: [50, 1000] },
  "0427": { length: [100, 600], width: [80, 450], height: [20, 200] },
};

export const customQuantity = { min: 250, max: 100_000 };

/**
 * Produkter i katalogen som kan tilpasses i konfiguratoren, med kassetype.
 * Katalogen fra bewifood.com har ingen esker i bølgepapp, så listen er tom.
 * Konfiguratoren lager esker etter mål uten utgangspunkt i en katalogvare.
 */
export const configurableProducts: Record<string, string> = {};

/** Startverdier i konfiguratoren per kassetype. */
export const defaultCustomBox: Record<string, { spec: PackagingSpec; quantity: number }> = {
  "0201": {
    spec: {
      style: "0201",
      innerDimensionsMm: { length: 300, width: 200, height: 150 },
      board: "B-bølge",
      color: "Brun",
      print: null,
      notes: null,
    },
    quantity: 1000,
  },
  "0427": {
    spec: {
      style: "0427",
      innerDimensionsMm: { length: 310, width: 220, height: 80 },
      board: "E-bølge",
      color: "Hvit",
      print: null,
      notes: null,
    },
    quantity: 1000,
  },
};

/**
 * Feltene i konfiguratoren. Samme navn brukes i adressen
 * (`/no/butikk/konfigurator?type=0201&l=400&…`), i skjemaet og i server action.
 */
export type CustomBoxValues = {
  type: string;
  l: string;
  b: string;
  h: string;
  kvalitet: string;
  farge: string;
  trykk: string;
  trykktekst: string;
  merknad: string;
  antall: string;
  navn: string;
};

export const customBoxKeys = [
  "type",
  "l",
  "b",
  "h",
  "kvalitet",
  "farge",
  "trykk",
  "trykktekst",
  "merknad",
  "antall",
  "navn",
] as const satisfies readonly (keyof CustomBoxValues)[];

/** Feltverdiene for en spesifikasjon, f.eks. fra en katalogvare eller fra AI-en i fase D. */
export function customBoxValues(spec: PackagingSpec, quantity: number, name = ""): CustomBoxValues {
  return {
    type: spec.style,
    l: String(spec.innerDimensionsMm.length),
    b: String(spec.innerDimensionsMm.width),
    h: String(spec.innerDimensionsMm.height),
    kvalitet: spec.board,
    farge: spec.color,
    trykk: String(spec.print?.colors ?? 0),
    trykktekst: spec.print?.description ?? "",
    merknad: spec.notes ?? "",
    antall: String(quantity),
    navn: name,
  };
}

/**
 * Leser feltene fra adressen, skjemaet eller nettleseren. Ukjente valg får
 * startverdien. Tall tas med som de er, også ugyldige, så `validateCustomBox` kan melde fra.
 */
export function parseCustomBox(get: (key: keyof CustomBoxValues) => string | null | undefined): {
  values: CustomBoxValues;
  spec: PackagingSpec;
  quantity: number;
  name: string;
} {
  const raw = (key: keyof CustomBoxValues) => (get(key) ?? "").toString().trim();
  const style = (styleOptions as readonly string[]).includes(raw("type")) ? raw("type") : "0201";
  const defaults = defaultCustomBox[style];
  const d = defaults.spec;
  const pick = (value: string, options: string[], fallback: string) =>
    options.includes(value) ? value : fallback;
  const numberOr = (value: string, fallback: number) => (value === "" ? fallback : Math.round(Number(value)));

  const values: CustomBoxValues = {
    type: style,
    l: raw("l") || String(d.innerDimensionsMm.length),
    b: raw("b") || String(d.innerDimensionsMm.width),
    h: raw("h") || String(d.innerDimensionsMm.height),
    kvalitet: pick(raw("kvalitet"), boardOptions, d.board),
    farge: pick(raw("farge"), colorOptions, d.color),
    trykk: pick(raw("trykk"), ["0", "1", "2", "3", "4"], "0"),
    trykktekst: raw("trykktekst").slice(0, 200),
    merknad: raw("merknad").slice(0, 300),
    antall: raw("antall") || String(defaults.quantity),
    navn: raw("navn").slice(0, 80),
  };
  const colors = Number(values.trykk);
  const spec: PackagingSpec = {
    style,
    innerDimensionsMm: {
      length: numberOr(values.l, d.innerDimensionsMm.length),
      width: numberOr(values.b, d.innerDimensionsMm.width),
      height: numberOr(values.h, d.innerDimensionsMm.height),
    },
    board: values.kvalitet,
    color: values.farge,
    print: colors > 0 ? { colors, description: values.trykktekst || "Trykk" } : null,
    notes: values.merknad || null,
  };
  const quantity = numberOr(values.antall, defaults.quantity);
  const name = values.navn || styleShortLabels[style];
  return { values, spec, quantity, name };
}

/** Feil per felt (`l`, `b`, `h`, `antall`). Tomt objekt betyr at alt er gyldig. */
export function validateCustomBox(
  spec: PackagingSpec,
  quantity: number,
): Partial<Record<"l" | "b" | "h" | "antall", string>> {
  const errors: Partial<Record<"l" | "b" | "h" | "antall", string>> = {};
  const limits = customLimits[spec.style] ?? customLimits["0201"];
  const check = (key: "l" | "b" | "h", value: number, [min, max]: Range) => {
    if (!Number.isFinite(value) || value < min || value > max) {
      errors[key] = t.errorMmRange(nb.format(min), nb.format(max));
    }
  };
  check("l", spec.innerDimensionsMm.length, limits.length);
  check("b", spec.innerDimensionsMm.width, limits.width);
  check("h", spec.innerDimensionsMm.height, limits.height);
  if (!Number.isFinite(quantity) || quantity < customQuantity.min || quantity > customQuantity.max) {
    errors.antall = t.errorQuantityRange(nb.format(customQuantity.min), nb.format(customQuantity.max));
  }
  return errors;
}

// ---------------------------------------------------------------------------
// Variant med naturlig språk (fase D4)
// ---------------------------------------------------------------------------

/** Feltene i variantskjemaet på Min side. */
export type VariantFormValues = {
  length: string;
  width: string;
  height: string;
  board: string;
  color: string;
  printColors: string;
  printDescription: string;
  notes: string;
  quantity: string;
};

/**
 * Endringer til variantskjemaet fra adressen, f.eks. fra emballasjeveilederen
 * (`/no/min-side/variant?ordre=10329&linje=l3&h=200&antall=500`). Feltene har
 * samme navn som i konfiguratoren. Ukjente valg og tall som ikke er positive
 * heltall, hoppes over. Serveren sjekker alt på nytt når forespørselen sendes.
 */
export function parseVariantSuggestion(
  get: (key: keyof CustomBoxValues) => string | null | undefined,
): Partial<VariantFormValues> {
  const raw = (key: keyof CustomBoxValues) => (get(key) ?? "").toString().trim();
  const whole = (value: string) => (/^\d{1,6}$/.test(value) && Number(value) > 0 ? value : undefined);
  const suggestion: Partial<VariantFormValues> = {
    length: whole(raw("l")),
    width: whole(raw("b")),
    height: whole(raw("h")),
    board: boardOptions.includes(raw("kvalitet")) ? raw("kvalitet") : undefined,
    color: colorOptions.includes(raw("farge")) ? raw("farge") : undefined,
    printColors: ["0", "1", "2", "3", "4"].includes(raw("trykk")) ? raw("trykk") : undefined,
    printDescription: raw("trykktekst").slice(0, 200) || undefined,
    notes: raw("merknad").slice(0, 300) || undefined,
    quantity: whole(raw("antall")),
  };
  return Object.fromEntries(
    Object.entries(suggestion).filter(([, value]) => value !== undefined),
  ) as Partial<VariantFormValues>;
}

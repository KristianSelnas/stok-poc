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

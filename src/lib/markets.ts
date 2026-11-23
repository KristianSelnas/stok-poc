/**
 * Markedene løsningen dekker. URL-segmentet (`/no`, `/is`) styrer hvilket
 * språk og hvilket innhold som vises. `language` brukes i Sanity og i
 * `<html lang>`.
 */
export const markets = {
  no: { id: "no", language: "nb", label: "Norge", languageLabel: "Norsk" },
  is: { id: "is", language: "is", label: "Ísland", languageLabel: "Íslenska" },
} as const;

export type MarketId = keyof typeof markets;
export type Language = (typeof markets)[MarketId]["language"];

export const defaultMarket: MarketId = "no";
export const marketIds = Object.keys(markets) as MarketId[];

export function isMarket(value: string): value is MarketId {
  return value in markets;
}

/** Lager en full sti med markedsprefiks, f.eks. `/no/kontakt`. */
export function marketPath(market: MarketId, path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return clean === "/" ? `/${market}` : `/${market}${clean}`;
}

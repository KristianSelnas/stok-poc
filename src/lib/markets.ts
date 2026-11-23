/**
 * Markedene løsningen dekker. URL-segmentet (`/no`, `/is`) styrer hvilket
 * språk og hvilket innhold som vises. `language` brukes i Sanity og i
 * `<html lang>`, `locale` i Open Graph.
 */
export const markets = {
  no: { id: "no", language: "nb", locale: "nb_NO", label: "Norge", languageLabel: "Norsk" },
  is: { id: "is", language: "is", locale: "is_IS", label: "Ísland", languageLabel: "Íslenska" },
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

/** Finner markedet for et Sanity-språk, f.eks. `nb` gir `no`. */
export function marketForLanguage(language: string | null | undefined): MarketId | undefined {
  return marketIds.find((id) => markets[id].language === language);
}

import { marketPath } from "@/lib/markets";

/** Nettbutikken finnes bare i det norske markedet (beslutning N5). */
export const SHOP_MARKET = "no" as const;

/** Sti i nettbutikken, f.eks. `shopPath("/handlekurv")` gir `/no/butikk/handlekurv`. */
export function shopPath(path = ""): string {
  return marketPath(SHOP_MARKET, `/butikk${path}`);
}

export const productPath = (slug: string) => shopPath(`/produkter/${slug}`);

/** Filtrene i katalogen på butikkens forside, slik de står i adressen. */
export type CatalogParams = { q?: string; gruppe?: string; bransje?: string; vis?: "alle" };

/** Adresse til katalogen med filtre, med hopp ned til produktlisten. */
export function catalogPath(params: CatalogParams = {}): string {
  const search = new URLSearchParams();
  for (const key of ["q", "gruppe", "bransje", "vis"] as const) {
    const value = params[key];
    if (value) search.set(key, value);
  }
  const query = search.toString();
  return `${shopPath()}${query ? `?${query}` : ""}#produkter`;
}

/** Sti på Min side, f.eks. `minSidePath("/ordre")` gir `/no/min-side/ordre`. */
export function minSidePath(path = ""): string {
  return marketPath(SHOP_MARKET, `/min-side${path}`);
}

export const orderPath = (orderNumber: string) =>
  `${minSidePath("/ordre")}?ordre=${encodeURIComponent(orderNumber)}`;

export const variantPath = (orderNumber: string, lineId: string) =>
  `${minSidePath("/variant")}?ordre=${encodeURIComponent(orderNumber)}&linje=${encodeURIComponent(lineId)}`;

export const loginPath = (next?: string) =>
  next ? `${shopPath("/logg-inn")}?neste=${encodeURIComponent(next)}` : shopPath("/logg-inn");

/** Konfiguratoren, eventuelt ferdig utfylt. Tomme felt utelates fra adressen. */
export function configuratorPath(values?: Partial<Record<string, string>>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(values ?? {})) if (value) search.set(key, value);
  const query = search.toString();
  return `${shopPath("/konfigurator")}${query ? `?${query}` : ""}`;
}

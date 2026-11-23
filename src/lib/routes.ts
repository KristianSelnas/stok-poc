import type { MarketId } from "./markets";

/**
 * Adresseprefiks per dokumenttype og marked. Generelle sider (`page`) har
 * ikke prefiks, og adressen er slugen, f.eks. `/no/om-oss`.
 *
 * Alle adresser går gjennom catch-all-ruten `[market]/[...slug]`, som bruker
 * `resolveRoute` for å finne riktig dokumenttype.
 */
export const routePrefixes = {
  industry: { no: "bransjer", is: "atvinnugreinar" },
  product: { no: "produkter", is: "vorur" },
  newsArticle: { no: "nyheter", is: "frettir" },
} as const satisfies Record<string, Record<MarketId, string>>;

export type PrefixedType = keyof typeof routePrefixes;
export type RoutableType = PrefixedType | "page";

/** Sti uten markedsprefiks for et dokument, f.eks. `/bransjer/fisk-og-sjomat`. */
export function documentPath(
  type: string,
  slug: string | null | undefined,
  market: MarketId,
): string | undefined {
  if (!slug) return undefined;
  if (type === "page") return `/${slug}`;
  const prefix = routePrefixes[type as PrefixedType]?.[market];
  return prefix ? `/${prefix}/${slug}` : undefined;
}

export type ResolvedRoute = { type: RoutableType; slug: string };

/**
 * Finner dokumenttype og slug ut fra adressen.
 * `["bransjer", "fisk-og-sjomat"]` gir `{ type: "industry", slug: "fisk-og-sjomat" }`.
 * Alt annet tolkes som en side, også `["nyheter"]`, som er oversiktssiden.
 */
export function resolveRoute(market: MarketId, segments: string[]): ResolvedRoute {
  if (segments.length === 2) {
    for (const [type, prefixes] of Object.entries(routePrefixes)) {
      if (prefixes[market] === segments[0]) return { type: type as PrefixedType, slug: segments[1] };
    }
  }
  return { type: "page", slug: segments.join("/") };
}

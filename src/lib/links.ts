import type { Link } from "@/sanity/types";

import { marketPath, type MarketId } from "./markets";
import { documentPath } from "./routes";

/** Felles form for lenker fra moduler, menyer og rik tekst. */
type LinkTarget = Pick<Link, "linkType" | "path" | "url" | "internal">;

/** Full href (med markedsprefiks) til et dokument, ut fra type og slug. */
export function documentHref(type: string, slug: string | null | undefined, market: MarketId) {
  const path = documentPath(type, slug, market);
  return path ? marketPath(market, path) : undefined;
}

/** Gjør en lenke fra Sanity om til en href med riktig markedsprefiks. */
export function resolveHref(link: LinkTarget | null | undefined, market: MarketId): string | undefined {
  if (!link) return undefined;
  switch (link.linkType ?? "internal") {
    case "external":
      return link.url ?? undefined;
    case "path":
      return link.path ? marketPath(market, link.path) : undefined;
    default:
      return link.internal ? documentHref(link.internal._type, link.internal.slug, market) : undefined;
  }
}

export function isExternal(link: LinkTarget | null | undefined): boolean {
  return link?.linkType === "external";
}

import type { Link } from "@/sanity/types";

import { marketPath, type MarketId } from "./markets";

/** Gjør en lenke fra Sanity om til en href med riktig markedsprefiks. */
export function resolveHref(link: Link | undefined, market: MarketId): string | undefined {
  if (!link) return undefined;
  if (link.linkType === "external") return link.url;
  return link.path ? marketPath(market, link.path) : undefined;
}

export function isExternal(link: Link | undefined): boolean {
  return link?.linkType === "external";
}

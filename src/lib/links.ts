import type { Link } from "@/sanity/types";

import { marketPath, type MarketId } from "./markets";

/** Felles form for lenker fra moduler, menyer og rik tekst. */
type LinkTarget = Pick<Link, "linkType" | "path" | "url" | "internal">;

/** Sti (uten markedsprefiks) til et dokument, ut fra type og slug. */
function documentPath(doc: NonNullable<Link["internal"]>): string | undefined {
  switch (doc._type) {
    case "page":
      return doc.slug ? `/${doc.slug}` : undefined;
  }
}

/** Gjør en lenke fra Sanity om til en href med riktig markedsprefiks. */
export function resolveHref(link: LinkTarget | null | undefined, market: MarketId): string | undefined {
  if (!link) return undefined;
  switch (link.linkType ?? "internal") {
    case "external":
      return link.url ?? undefined;
    case "path":
      return link.path ? marketPath(market, link.path) : undefined;
    default: {
      const path = link.internal ? documentPath(link.internal) : undefined;
      return path ? marketPath(market, path) : undefined;
    }
  }
}

export function isExternal(link: LinkTarget | null | undefined): boolean {
  return link?.linkType === "external";
}

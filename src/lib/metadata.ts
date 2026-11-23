import type { Metadata } from "next";

import type { Seo } from "@/sanity/types";

import { marketPath, type MarketId } from "./markets";

/** Lager metadata for en side ut fra SEO-feltene i Sanity. */
export function buildMetadata({
  seo,
  title,
  market,
  path,
}: {
  seo: Seo | null | undefined;
  title?: string | null;
  market: MarketId;
  path: string;
}): Metadata {
  const metaTitle = seo?.title || title || undefined;
  return {
    // Uten egen tittel arver siden standardtittelen fra layouten.
    ...(metaTitle ? { title: metaTitle } : {}),
    ...(seo?.description ? { description: seo.description } : {}),
    alternates: { canonical: marketPath(market, path) },
    openGraph: {
      title: metaTitle,
      description: seo?.description ?? undefined,
      images: seo?.image ? [{ url: `${seo.image}?w=1200&h=630&fit=crop` }] : undefined,
    },
    // Hele PoC-en har noindex fra layouten. Feltet styrer enkeltsider etter lansering.
    ...(seo?.noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

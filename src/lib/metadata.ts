import type { Metadata } from "next";
import { stegaClean } from "next-sanity";

import type { Seo } from "@/sanity/types";

import { marketPath, markets, type MarketId } from "./markets";
import { allowIndexing } from "./site";

type MetadataInput = {
  seo: Seo | null | undefined;
  title?: string | null;
  /** Brukes når SEO-beskrivelsen mangler, f.eks. ingressen. */
  fallbackDescription?: string | null;
  /** Bilde til deling når SEO-bildet mangler, f.eks. produktbildet. */
  fallbackImage?: string | null;
  market: MarketId;
  path: string;
  /** Adresser til oversettelsene med språk som nøkkel, se `translationPaths`. */
  alternates?: Record<string, string>;
};

/**
 * Lager metadata for en side ut fra SEO-feltene i Sanity. Stega-tegn fra
 * forhåndsvisningen fjernes, de hører ikke hjemme i `<title>` og metatagger.
 * Relative adresser gjøres fullstendige med `metadataBase` fra layouten.
 */
export function buildMetadata(input: MetadataInput): Metadata {
  return build(stegaClean(input));
}

function build({
  seo,
  title,
  fallbackDescription,
  fallbackImage,
  market,
  path,
  alternates,
}: MetadataInput): Metadata {
  const metaTitle = seo?.title || title || undefined;
  const description = seo?.description || fallbackDescription || undefined;
  const url = marketPath(market, path);
  const image = seo?.image ?? fallbackImage;
  // `hreflang` gir bare mening når siden finnes på flere språk.
  const languages = alternates && Object.keys(alternates).length > 1 ? alternates : undefined;

  return {
    // Uten egen tittel arver siden standardtittelen fra layouten.
    ...(metaTitle ? { title: metaTitle } : {}),
    ...(description ? { description } : {}),
    alternates: { canonical: url, languages },
    openGraph: {
      type: "website",
      url,
      locale: markets[market].locale,
      title: metaTitle,
      description,
      images: image ? [{ url: `${image}?w=1200&h=630&fit=crop`, width: 1200, height: 630 }] : undefined,
    },
    // Hele PoC-en har noindex fra layouten. Feltet styrer enkeltsider etter lansering.
    ...(allowIndexing && seo?.noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

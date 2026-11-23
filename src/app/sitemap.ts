import type { MetadataRoute } from "next";

import { getSitemap } from "@/lib/content";
import { marketForLanguage, marketIds, marketPath, markets } from "@/lib/markets";
import { documentPath, translationPaths } from "@/lib/routes";
import { absoluteUrl } from "@/lib/site";

/**
 * sitemap.xml med forsider, sider, bransjer, produkter og nyheter i begge
 * markeder. Oversettelser legges inn som `hreflang`-alternativer.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { frontPages, documents } = await getSitemap();

  const frontPageAlternates = Object.fromEntries(
    marketIds.map((id) => [markets[id].language, absoluteUrl(marketPath(id))]),
  );

  const frontPageEntries = frontPages.flatMap((frontPage) => {
    const market = marketForLanguage(frontPage.language);
    if (!market) return [];
    return [
      {
        url: absoluteUrl(marketPath(market)),
        lastModified: frontPage._updatedAt,
        alternates: { languages: frontPageAlternates },
      },
    ];
  });

  const documentEntries = documents.flatMap((doc) => {
    const market = marketForLanguage(doc.language);
    const path = market && documentPath(doc._type, doc.slug, market);
    if (!market || !path) return [];
    const translations = translationPaths(doc.translations);
    const languages =
      Object.keys(translations).length > 1
        ? Object.fromEntries(Object.entries(translations).map(([lang, href]) => [lang, absoluteUrl(href)]))
        : undefined;
    return [
      {
        url: absoluteUrl(marketPath(market, path)),
        lastModified: doc._updatedAt,
        ...(languages ? { alternates: { languages } } : {}),
      },
    ];
  });

  return [...frontPageEntries, ...documentEntries];
}

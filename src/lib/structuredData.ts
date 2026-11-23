import type { NewsArticle, Product, SiteSettings } from "@/sanity/types";

import { getDictionary } from "./dictionaries";
import { marketPath, markets, type MarketId } from "./markets";
import { documentPath, routePrefixes } from "./routes";
import { absoluteUrl } from "./site";

/*
 * JSON-LD etter schema.org. Rendres med `<JsonLd>`.
 * Test med https://validator.schema.org/ eller Googles Rich Results Test.
 */

const logoUrl = absoluteUrl("/brand/stok-emballage-logo.png");
const organizationId = (market: MarketId) => `${absoluteUrl(marketPath(market))}#organisasjon`;

function compact<T extends Record<string, unknown>>(data: T): T {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  ) as T;
}

/** Firmaet og nettstedet. Vises på forsiden. */
export function organizationJsonLd(settings: SiteSettings, market: MarketId) {
  const url = absoluteUrl(marketPath(market));
  const name = settings.companyName || settings.title || "STOK Emballage";
  const sameAs = (settings.socialLinks ?? []).map((link) => link.url).filter(Boolean);

  return [
    compact({
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": organizationId(market),
      name,
      url,
      logo: logoUrl,
      email: settings.email,
      telephone: settings.phone,
      address: settings.address?.replace(/\s*\n\s*/g, ", "),
      taxID: settings.orgNumber,
      sameAs: sameAs.length ? sameAs : undefined,
    }),
    compact({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: settings.title || name,
      url,
      inLanguage: markets[market].language,
      publisher: { "@id": organizationId(market) },
    }),
  ];
}

function publisher(settings: SiteSettings, market: MarketId) {
  return {
    "@type": "Organization",
    "@id": organizationId(market),
    name: settings.companyName || settings.title || "STOK Emballage",
    logo: { "@type": "ImageObject", url: logoUrl },
  };
}

/** Produkt med brødsmulesti (Produkter → gruppe → produkt). */
export function productJsonLd(product: Product, settings: SiteSettings, market: MarketId) {
  const url = absoluteUrl(marketPath(market, documentPath("product", product.slug, market)));
  const catalogUrl = absoluteUrl(marketPath(market, `/${routePrefixes.product[market]}`));
  const images = (product.images ?? []).map((image) => image.url).filter(Boolean);

  const crumbs = [
    { name: getDictionary(market).products, item: catalogUrl },
    ...(product.group?.title && product.group.slug
      ? [{ name: product.group.title, item: `${catalogUrl}?gruppe=${product.group.slug}` }]
      : []),
    { name: product.title, item: url },
  ];

  return [
    compact({
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.title,
      description: product.shortDescription,
      url,
      image: images.length ? images : undefined,
      category: product.group?.title,
      material: product.materials?.map((material) => material.title).join(", ") || undefined,
      brand: { "@type": "Brand", name: settings.companyName || settings.title || "STOK Emballage" },
    }),
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        ...crumb,
      })),
    },
  ];
}

/** Nyhetsartikkel. */
export function newsArticleJsonLd(article: NewsArticle, settings: SiteSettings, market: MarketId) {
  const url = absoluteUrl(marketPath(market, documentPath("newsArticle", article.slug, market)));
  return compact({
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    image: article.image?.url ? [article.image.url] : undefined,
    datePublished: article.publishedAt,
    inLanguage: markets[market].language,
    mainEntityOfPage: url,
    url,
    publisher: publisher(settings, market),
  });
}

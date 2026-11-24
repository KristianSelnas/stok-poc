import type { NewsArticle, SiteSettings } from "@/sanity/types";

import { getDictionary } from "./dictionaries";
import { marketPath, markets, type MarketId } from "./markets";
import type { SiteProduct } from "./products";
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

/** Produkt fra produktkatalogen med brødsmulesti (Produkter → type → produkt). */
export function productJsonLd(
  { product, type, materials }: SiteProduct,
  settings: SiteSettings,
  market: MarketId,
) {
  const url = absoluteUrl(marketPath(market, documentPath("product", product.slug, market)));
  const catalogUrl = absoluteUrl(marketPath(market, `/${routePrefixes.product[market]}`));
  const images = product.images.map((image) => absoluteUrl(image.url));

  const crumbs = [
    { name: getDictionary(market).products, item: catalogUrl },
    ...(type ? [{ name: type.title, item: `${catalogUrl}?type=${type.slug}` }] : []),
    { name: product.name, item: url },
  ];

  return [
    compact({
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.shortDescription,
      url,
      image: images.length ? images : undefined,
      sku: product.variants.length === 1 ? product.variants[0].sku : undefined,
      category: type?.title,
      material: materials.map((material) => material.title).join(", ") || undefined,
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

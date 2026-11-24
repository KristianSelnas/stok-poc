import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import type { Product, ProductGroup, ProductSummary, ProductType, Taxon } from "@/shop/domain";
import { catalogFor } from "@/shop/index";

import type { MarketId } from "./markets";

/*
 * Nettsidens produkter (fase N). Produktene, produktgruppene, typene og
 * materialene kommer fra produktkatalogen, ikke fra Sanity. Sanity har
 * bransjene, og hver produktgruppe peker på bransjesiden sin
 * (`ProductGroup.industry`).
 *
 * Katalogdata endres sjelden og caches i timer, som innholdet fra Sanity.
 */

const CATALOG_TAG = "site-catalog";

export type SiteCatalog = {
  groups: ProductGroup[];
  types: ProductType[];
  materials: Taxon[];
  products: ProductSummary[];
};

/** Alle produkter og filtervalg i et marked. Filtreringen skjer i `lib/catalog.ts`. */
export async function getSiteCatalog(market: MarketId): Promise<SiteCatalog> {
  "use cache";
  cacheTag(CATALOG_TAG, `${CATALOG_TAG}:${market}`);
  cacheLife("hours");

  const catalog = catalogFor(market);
  const [groups, types, materials, products] = await Promise.all([
    catalog.listGroups(),
    catalog.listTypes(),
    catalog.listMaterials(),
    catalog.listProducts(),
  ]);
  return { groups, types, materials, products: products.sort((a, b) => a.name.localeCompare(b.name)) };
}

export type SiteProduct = {
  product: Product;
  type: ProductType | null;
  groups: ProductGroup[];
  materials: Taxon[];
  /** Andre produkter av samme type. */
  related: ProductSummary[];
};

export async function getSiteProduct(market: MarketId, slug: string): Promise<SiteProduct | null> {
  "use cache";
  cacheTag(CATALOG_TAG, `${CATALOG_TAG}:${market}:${slug}`);
  cacheLife("hours");

  const [product, catalog] = await Promise.all([catalogFor(market).getProduct(slug), getSiteCatalog(market)]);
  if (!product) return null;
  return {
    product,
    type: catalog.types.find((t) => t.slug === product.type) ?? null,
    groups: catalog.groups.filter((g) => product.groups.includes(g.slug)),
    materials: catalog.materials.filter((m) => product.materials.includes(m.slug)),
    related: catalog.products.filter((p) => p.type === product.type && p.slug !== slug).slice(0, 4),
  };
}

/** Produktene i produktgruppene som peker på en bransjeside. */
export function productsForIndustry(catalog: SiteCatalog, industrySlug: string): ProductSummary[] {
  const groups = new Set(catalog.groups.filter((g) => g.industry === industrySlug).map((g) => g.slug));
  return catalog.products.filter((p) => p.groups.some((g) => groups.has(g)));
}

/** Kortdata for produktkortene på nettsiden. */
export type ProductCardData = {
  slug: string;
  name: string;
  shortDescription: string | null;
  image: ProductSummary["image"];
  /** Navnet på typen, vises over produktnavnet. */
  label: string | null;
};

export function toCards(catalog: SiteCatalog, products: ProductSummary[]): ProductCardData[] {
  const typeTitle = new Map(catalog.types.map((t) => [t.slug, t.title]));
  return products.map((p) => ({
    slug: p.slug,
    name: p.name,
    shortDescription: p.shortDescription,
    image: p.image,
    label: typeTitle.get(p.type) ?? null,
  }));
}

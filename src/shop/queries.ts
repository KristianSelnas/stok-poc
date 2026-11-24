import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import type { ProductFilter } from "./domain";
import { shop } from "./index";

/**
 * Katalogdata med `use cache`. Produktinformasjon endres sjelden og kan
 * caches. Pris, lager og ordre hentes ferskt per forespørsel, fordi de
 * avhenger av kunden og endres ofte.
 */
const CATALOG_TAG = "shop-catalog";

export async function getShopProduct(slug: string) {
  "use cache";
  cacheTag(CATALOG_TAG, `shop-product:${slug}`);
  cacheLife("hours");
  return shop().catalog.getProduct(slug);
}

export async function listShopProducts(filter: ProductFilter = {}) {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("hours");
  return shop().catalog.listProducts(filter);
}

export async function getShopTaxonomy() {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("hours");
  const { catalog } = shop();
  const [groups, types, materials] = await Promise.all([
    catalog.listGroups(),
    catalog.listTypes(),
    catalog.listMaterials(),
  ]);
  return { groups, types, materials };
}

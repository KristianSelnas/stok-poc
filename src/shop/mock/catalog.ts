import "server-only";

import type { Product, ProductFilter, ProductSummary, SalesMode } from "../domain";
import type { CatalogService } from "../services";
import { catalogData, latency } from "./data";

const normalize = (value: string) => value.toLocaleLowerCase("nb").normalize("NFC");

function searchText(product: Product): string {
  return normalize(
    [
      product.name,
      product.shortDescription,
      ...product.variants.flatMap((v) => [v.sku, v.name]),
      ...product.materials,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

const index = new Map(catalogData.products.map((p) => [p.slug, { product: p, text: searchText(p) }]));
const bySku = new Map(
  catalogData.products.flatMap((product) =>
    product.variants.map((variant) => [variant.sku, { product, variant }]),
  ),
);

function summarize(product: Product): ProductSummary {
  const modes = new Set<SalesMode>(product.variants.map((v) => v.salesMode));
  const salesMode: SalesMode = modes.has("stock")
    ? "stock"
    : modes.has("madeToOrder")
      ? "madeToOrder"
      : "quote";
  return {
    slug: product.slug,
    name: product.name,
    shortDescription: product.shortDescription,
    group: product.group,
    industries: product.industries,
    image: product.images[0] ?? product.variants.find((v) => v.image)?.image ?? null,
    variantCount: product.variants.length,
    skus: product.variants.map((v) => v.sku),
    salesMode,
  };
}

/** Katalog fra JSON-filen som er laget fra bewifood.com. */
export const mockCatalog: CatalogService = {
  async listProducts(filter: ProductFilter = {}) {
    await latency();
    const words = filter.query ? normalize(filter.query).split(/\s+/).filter(Boolean) : [];
    return [...index.values()]
      .filter(({ product, text }) => {
        if (filter.group && product.group !== filter.group) return false;
        if (filter.industry && !product.industries.includes(filter.industry)) return false;
        return words.every((word) => text.includes(word));
      })
      .map(({ product }) => summarize(product));
  },
  async getProduct(slug) {
    await latency();
    return index.get(slug)?.product ?? null;
  },
  async getVariant(sku) {
    await latency();
    return bySku.get(sku) ?? null;
  },
  async listGroups() {
    return catalogData.groups;
  },
  async listIndustries() {
    return catalogData.industries;
  },
  async listMaterials() {
    return catalogData.materials;
  },
};

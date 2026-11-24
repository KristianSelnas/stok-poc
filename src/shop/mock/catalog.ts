import "server-only";

import type { Product, ProductFilter, ProductSummary, SalesMode } from "../domain";
import type { CatalogService } from "../services";
import { type CatalogData, catalogData, catalogDataIs, latency } from "./data";

const normalize = (value: string) => value.toLocaleLowerCase("nb").normalize("NFC");

function searchText(product: Product, data: CatalogData): string {
  const materialTitles = data.materials.filter((m) => product.materials.includes(m.slug)).map((m) => m.title);
  return normalize(
    [
      product.name,
      product.shortDescription,
      data.types.find((t) => t.slug === product.type)?.title,
      ...materialTitles,
      ...product.variants.flatMap((v) => [v.sku, v.name, v.material]),
    ]
      .filter(Boolean)
      .join(" "),
  );
}

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
    type: product.type,
    groups: product.groups,
    materials: product.materials,
    image: product.images[0] ?? product.variants.find((v) => v.image)?.image ?? null,
    variantCount: product.variants.length,
    skus: product.variants.map((v) => v.sku),
    salesMode,
  };
}

/** Katalog fra en JSON-fil som er laget fra bewifood.com. */
function createMockCatalog(data: CatalogData): CatalogService {
  const index = new Map(data.products.map((p) => [p.slug, { product: p, text: searchText(p, data) }]));
  const bySku = new Map(
    data.products.flatMap((product) =>
      product.variants.map((variant) => [variant.sku, { product, variant }]),
    ),
  );

  return {
    async listProducts(filter: ProductFilter = {}) {
      await latency();
      const words = filter.query ? normalize(filter.query).split(/\s+/).filter(Boolean) : [];
      return [...index.values()]
        .filter(({ product, text }) => {
          if (filter.group && !product.groups.includes(filter.group)) return false;
          if (filter.type && product.type !== filter.type) return false;
          if (filter.material && !product.materials.includes(filter.material)) return false;
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
      return data.groups;
    },
    async listTypes() {
      return data.types;
    },
    async listMaterials() {
      return data.materials;
    },
  };
}

/** Den norske katalogen, som også er nettbutikkens. */
export const mockCatalog = createMockCatalog(catalogData);

/** Den islandske katalogen. Brukes bare av nettsiden. */
export const mockCatalogIs = createMockCatalog(catalogDataIs);

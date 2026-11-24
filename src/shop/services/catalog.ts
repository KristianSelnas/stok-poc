import type { Product, ProductFilter, ProductGroup, ProductSummary, Taxon, Variant } from "../domain";

/**
 * Produktkatalogen (PIM). Gir produktinformasjon uten pris og lager.
 * Ekte implementasjon: adapter mot STOKs produktkatalog.
 */
export interface CatalogService {
  listProducts(filter?: ProductFilter): Promise<ProductSummary[]>;
  getProduct(slug: string): Promise<Product | null>;
  getVariant(sku: string): Promise<{ product: Product; variant: Variant } | null>;
  listGroups(): Promise<ProductGroup[]>;
  listIndustries(): Promise<Taxon[]>;
  listMaterials(): Promise<Taxon[]>;
}

import type {
  Product,
  ProductFilter,
  ProductGroup,
  ProductSummary,
  ProductType,
  Taxon,
  Variant,
} from "../domain";

/**
 * Produktkatalogen (PIM). Gir produktinformasjon uten pris og lager.
 * Inndelingen i produktgruppe, type og materiale følger bewifood.com.
 * Ekte implementasjon: adapter mot STOKs produktkatalog.
 */
export interface CatalogService {
  listProducts(filter?: ProductFilter): Promise<ProductSummary[]>;
  getProduct(slug: string): Promise<Product | null>;
  getVariant(sku: string): Promise<{ product: Product; variant: Variant } | null>;
  listGroups(): Promise<ProductGroup[]>;
  listTypes(): Promise<ProductType[]>;
  listMaterials(): Promise<Taxon[]>;
}

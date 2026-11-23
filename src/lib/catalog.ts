import type { Catalog, CatalogProduct } from "@/sanity/types";

/** Filtrene i produktkatalogen og navnet på URL-parameteren for hvert av dem. */
export const catalogFilters = [
  { key: "gruppe", option: "groups", product: (p: CatalogProduct) => (p.groupSlug ? [p.groupSlug] : []) },
  { key: "bransje", option: "industries", product: (p: CatalogProduct) => p.industrySlugs ?? [] },
  { key: "materiale", option: "materials", product: (p: CatalogProduct) => p.materialSlugs ?? [] },
] as const;

export type CatalogFilterKey = (typeof catalogFilters)[number]["key"];
export type CatalogSelection = Partial<Record<CatalogFilterKey, string>>;

/** Leser gyldige filtervalg fra URL-parametere. Ukjente verdier ignoreres. */
export function parseSelection(
  catalog: Catalog,
  searchParams: Record<string, string | string[] | undefined>,
): CatalogSelection {
  const selection: CatalogSelection = {};
  for (const filter of catalogFilters) {
    const raw = searchParams[filter.key];
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (value && catalog[filter.option].some((option) => option.slug === value)) {
      selection[filter.key] = value;
    }
  }
  return selection;
}

export function filterProducts(catalog: Catalog, selection: CatalogSelection): CatalogProduct[] {
  return catalog.products.filter((product) =>
    catalogFilters.every((filter) => {
      const selected = selection[filter.key];
      return !selected || (filter.product(product) as string[]).includes(selected);
    }),
  );
}

/** Lager en URL der ett filter er endret og de andre beholdes. */
export function selectionHref(
  basePath: string,
  selection: CatalogSelection,
  key: CatalogFilterKey,
  value: string | undefined,
): string {
  const next = { ...selection, [key]: value };
  const params = new URLSearchParams();
  for (const filter of catalogFilters) {
    const v = next[filter.key];
    if (v) params.set(filter.key, v);
  }
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

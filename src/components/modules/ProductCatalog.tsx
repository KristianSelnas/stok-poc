import Link from "next/link";
import { Suspense } from "react";

import {
  type CatalogSelection,
  catalogFilters,
  filterProducts,
  parseSelection,
  selectionHref,
} from "@/lib/catalog";
import { getDictionary, type Dictionary } from "@/lib/dictionaries";
import type { MarketId } from "@/lib/markets";
import { getSiteCatalog, type SiteCatalog, toCards } from "@/lib/products";
import type { ModuleOf } from "@/sanity/types";

import { Container } from "../ui/Container";
import { ProductCardGrid } from "../ui/ProductCard";
import { SectionHeader } from "./SectionHeader";

export type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type ProductCatalogProps = {
  module: ModuleOf<"productCatalog">;
  market: MarketId;
  /** Adressen til siden katalogen ligger på, brukt i filterlenkene. */
  basePath: string;
  searchParams?: SearchParams;
};

/**
 * Produktkatalog med filtre for produktgruppe, type og materiale, som på
 * bewifood.com. Produktene kommer fra produktkatalogen (fase N). Filtrene er
 * lenker med URL-parametere, så de virker uten JavaScript og kan deles.
 *
 * Filtrene leses fra URL-en ved forespørsel. Den statiske versjonen av siden
 * viser alle produkter, og den filtrerte versjonen strømmes inn.
 */
export async function ProductCatalog({ module, market, basePath, searchParams }: ProductCatalogProps) {
  const catalog = await getSiteCatalog(market);
  const t = getDictionary(market);

  return (
    <section className="py-14 md:py-20">
      <Container>
        <SectionHeader title={module.title} intro={module.intro} />
        <Suspense
          fallback={
            <CatalogView catalog={catalog} selection={{}} basePath={basePath} market={market} t={t} />
          }
        >
          <FilteredCatalog
            catalog={catalog}
            searchParams={searchParams}
            basePath={basePath}
            market={market}
            t={t}
          />
        </Suspense>
      </Container>
    </section>
  );
}

async function FilteredCatalog({
  catalog,
  searchParams,
  ...props
}: {
  catalog: SiteCatalog;
  searchParams?: SearchParams;
  basePath: string;
  market: MarketId;
  t: Dictionary;
}) {
  const selection = parseSelection(catalog, (await searchParams) ?? {});
  return <CatalogView catalog={catalog} selection={selection} {...props} />;
}

function CatalogView({
  catalog,
  selection,
  basePath,
  market,
  t,
}: {
  catalog: SiteCatalog;
  selection: CatalogSelection;
  basePath: string;
  market: MarketId;
  t: Dictionary;
}) {
  const products = filterProducts(catalog, selection);
  const labels = { gruppe: t.productGroup, type: t.productType, materiale: t.material };
  const hasSelection = Object.values(selection).some(Boolean);

  return (
    <div className="grid gap-10 lg:grid-cols-[16rem_1fr]">
      <nav aria-label={t.filterProducts} className="space-y-6">
        {catalogFilters.map((filter) => {
          const options = catalog[filter.option];
          if (!options.length) return null;
          const selected = selection[filter.key];
          return (
            <div key={filter.key}>
              <h2 className="mb-2 font-meta text-sm font-medium tracking-wide text-stok-green-dark uppercase">
                {labels[filter.key]}
              </h2>
              <ul className="flex flex-wrap gap-2 lg:flex-col lg:items-start">
                {[{ title: t.all, slug: undefined as string | undefined }, ...options].map((option) => {
                  const active = option.slug === selected;
                  return (
                    <li key={option.slug ?? "alle"}>
                      <Link
                        href={selectionHref(basePath, selection, filter.key, option.slug ?? undefined)}
                        aria-current={active ? "true" : undefined}
                        scroll={false}
                        className={`inline-block rounded-full px-3 py-1 text-sm transition-colors ${
                          active
                            ? "bg-stok-blue text-white"
                            : "bg-stok-light text-stok-blue hover:bg-stok-blue/10"
                        }`}
                      >
                        {option.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
        {hasSelection && (
          <Link
            href={basePath}
            scroll={false}
            className="text-sm text-stok-blue underline underline-offset-4"
          >
            {t.resetFilters}
          </Link>
        )}
      </nav>

      <div>
        <p className="mb-4 font-meta text-sm" aria-live="polite">
          {products.length} {products.length === 1 ? t.productFound : t.productsFound}
        </p>
        {products.length ? (
          <ProductCardGrid products={toCards(catalog, products)} market={market} columns={3} />
        ) : (
          <p className="rounded-3xl bg-stok-light p-8">{t.noProducts}</p>
        )}
      </div>
    </div>
  );
}

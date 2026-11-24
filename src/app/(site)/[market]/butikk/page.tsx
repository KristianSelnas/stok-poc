import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";

import { ProductImageBox } from "@/components/shop/ProductImageBox";
import { ShopProductCard } from "@/components/shop/ShopProductCard";
import { buttonClasses } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { quickAddToCart } from "@/shop/actions";
import { t } from "@/shop/dictionary";
import { formatNok, formatNumber, formatShopDate } from "@/shop/format";
import { shop } from "@/shop/index";
import { catalogPath, productPath, shopPath, type CatalogParams } from "@/shop/paths";
import { getShopTaxonomy, listShopProducts } from "@/shop/queries";
import { getFrequentItems } from "@/shop/recommendations";
import { getSession } from "@/shop/session";

export const metadata: Metadata = { title: { absolute: "Nettbutikk | STOK Emballage" } };

type Props = PageProps<"/[market]/butikk">;
type SearchParams = Props["searchParams"];

/** Produktene som vises når ingen kunde er logget inn. */
const popularSlugs = ["fiskekasse", "stablebar-transportkasse", "bolgepappeske", "pakketape"];

const fieldClass =
  "rounded-full border-2 border-stok-blue/20 bg-white px-4 py-2.5 focus:border-stok-blue focus:outline-none";

/** Leser og sjekker filtrene i adressen. Ukjente verdier ignoreres. */
async function readParams(searchParams: SearchParams): Promise<CatalogParams> {
  const raw = await searchParams;
  const one = (key: string) => {
    const value = raw[key];
    return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
  };
  const { groups, industries } = await getShopTaxonomy();
  const gruppe = one("gruppe");
  const bransje = one("bransje");
  return {
    q: one("q").slice(0, 80) || undefined,
    gruppe: groups.some((g) => g.slug === gruppe) ? gruppe : undefined,
    bransje: industries.some((i) => i.slug === bransje) ? bransje : undefined,
    vis: one("vis") === "alle" ? "alle" : undefined,
  };
}

// ---------------------------------------------------------------------------
// Toppen: søk og kundeboks
// ---------------------------------------------------------------------------

async function SearchForm({ searchParams }: { searchParams: SearchParams }) {
  const params = await readParams(searchParams);
  return <SearchFields params={params} />;
}

/** Søket gjelder alle grupper, men beholder bransje og visning. */
function SearchFields({ params = {} }: { params?: CatalogParams }) {
  return (
    <form action={`${shopPath()}#produkter`} role="search" className="mt-8 flex max-w-xl gap-2">
      <label htmlFor="shop-search" className="sr-only">
        {t.searchLabel}
      </label>
      <input
        id="shop-search"
        name="q"
        type="search"
        defaultValue={params.q}
        placeholder={t.searchPlaceholder}
        className={`min-w-0 flex-1 ${fieldClass} px-5 py-3`}
      />
      {params.bransje && <input type="hidden" name="bransje" value={params.bransje} />}
      {params.vis && <input type="hidden" name="vis" value={params.vis} />}
      <button type="submit" className={buttonClasses("secondary")}>
        {t.search}
      </button>
    </form>
  );
}

async function Welcome() {
  const session = await getSession();
  if (!session) {
    return (
      <div className="rounded-3xl bg-white p-6 ring-1 ring-stok-blue/10">
        <p className="font-semibold text-stok-blue">{t.loginForPrices}</p>
        <Link href={shopPath("/logg-inn")} className={buttonClasses("primary", "mt-4")}>
          {t.login}
        </Link>
      </div>
    );
  }
  return (
    <div className="rounded-3xl bg-white p-6 ring-1 ring-stok-blue/10">
      <p className="text-sm">{t.loggedInAs}</p>
      <p className="font-heading text-xl font-bold text-stok-blue">{session.customer.name}</p>
      <p className="mt-1 text-sm">
        {t.priceAgreement}: {session.customer.priceAgreement.name}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Kjøp igjen (innlogget) eller populære produkter
// ---------------------------------------------------------------------------

async function Highlights() {
  const session = await getSession();
  if (session) {
    const items = await getFrequentItems(session.customer.id);
    if (items.length) {
      const prices = await shop().pricing.getPrices(
        items.map((i) => i.variant.sku),
        session.customer.id,
      );
      return (
        <section aria-labelledby="kjop-igjen" className="py-10 md:py-14">
          <Container>
            <h2 id="kjop-igjen" className="text-3xl">
              {t.buyAgain}
            </h2>
            <p className="mt-2 mb-6">{t.buyAgainLead}</p>
            <ul className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
              {items.map(({ product, variant, lastQuantity, lastOrderedAt }) => {
                const quantity = formatNumber(lastQuantity);
                return (
                  <li
                    key={variant.sku}
                    className="flex w-[80%] shrink-0 snap-start flex-col rounded-3xl bg-white p-4 ring-1 ring-stok-blue/10 sm:w-auto"
                  >
                    <div className="flex gap-3">
                      <ProductImageBox
                        image={variant.image ?? product.images[0] ?? null}
                        sizes="64px"
                        className="h-16 w-16 shrink-0 rounded-2xl"
                      />
                      <div className="min-w-0">
                        <Link
                          href={productPath(product.slug)}
                          className="font-semibold text-stok-blue hover:underline"
                        >
                          {variant.name}
                        </Link>
                        <p className="text-sm">
                          {t.sku} {variant.sku}
                          {prices[variant.sku] && <> · {formatNok(prices[variant.sku].unitPrice)}</>}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm">{t.lastOrdered(quantity, formatShopDate(lastOrderedAt))}</p>
                    <form action={quickAddToCart} className="mt-auto pt-3">
                      <input type="hidden" name="sku" value={variant.sku} />
                      <input type="hidden" name="quantity" value={lastQuantity} />
                      <button
                        type="submit"
                        aria-label={t.addQuantityFor(quantity, variant.name)}
                        className={buttonClasses("primary", "w-full px-4 py-2 text-sm")}
                      >
                        {t.addQuantity(quantity)}
                      </button>
                    </form>
                  </li>
                );
              })}
            </ul>
          </Container>
        </section>
      );
    }
  }

  const [products, { groups }] = await Promise.all([listShopProducts(), getShopTaxonomy()]);
  const groupTitle = new Map(groups.map((g) => [g.slug, g.title]));
  const popular = popularSlugs.flatMap((slug) => products.find((p) => p.slug === slug) ?? []);
  return (
    <section aria-labelledby="populaere" className="py-10 md:py-14">
      <Container>
        <h2 id="populaere" className="mb-6 text-3xl">
          {t.popularProducts}
        </h2>
        <ul className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {popular.map((product) => (
            <li key={product.slug} className="w-[75%] shrink-0 snap-start sm:w-auto">
              <ShopProductCard product={product} groupTitle={groupTitle.get(product.group)} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Katalogen: filterknapper og produktrutenett
// ---------------------------------------------------------------------------

function Chip({ href, current, children }: { href: string; current: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={current ? "true" : undefined}
      className={`inline-flex items-center gap-1.5 rounded-full border-2 px-4 py-1.5 font-semibold whitespace-nowrap ${
        current
          ? "border-stok-blue bg-stok-blue text-white"
          : "border-stok-blue/15 bg-white text-stok-blue hover:border-stok-blue"
      }`}
    >
      {children}
    </Link>
  );
}

async function Catalog({ searchParams }: { searchParams: SearchParams }) {
  const params = await readParams(searchParams);
  const [{ groups, industries }, products, session] = await Promise.all([
    getShopTaxonomy(),
    listShopProducts({ query: params.q, industry: params.bransje }),
    getSession(),
  ]);

  const orderableOnly = params.vis !== "alle";
  const inGroup = (p: (typeof products)[number]) => !params.gruppe || p.group === params.gruppe;
  const orderable = products.filter((p) => p.salesMode !== "quote");
  const base = orderableOnly ? orderable : products;
  const shown = base.filter(inGroup);
  const groupCount = (slug: string) => base.filter((p) => p.group === slug).length;
  const groupTitle = new Map(groups.map((g) => [g.slug, g.title]));
  const hasFilters = !!(params.q || params.gruppe || params.bransje || params.vis);

  const prices = await shop().pricing.getPrices(
    shown.flatMap((p) => p.skus),
    session?.customer.id,
  );
  const fromPrice = (skus: string[]) => {
    const values = skus.flatMap((sku) => (prices[sku] ? [prices[sku].tiers.at(-1)!.unitPrice] : []));
    return values.length ? Math.min(...values) : null;
  };

  return (
    <>
      <div className="space-y-5">
        <nav aria-label={t.productGroups}>
          <ul className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            <li>
              <Chip href={catalogPath({ ...params, gruppe: undefined })} current={!params.gruppe}>
                {t.allInGroup} <span className="font-normal">{base.length}</span>
              </Chip>
            </li>
            {groups.map((group) => {
              const count = groupCount(group.slug);
              if (!count && params.gruppe !== group.slug) return null;
              return (
                <li
                  key={group.slug}
                  className={params.gruppe === group.slug ? "order-first sm:order-none" : ""}
                >
                  <Chip
                    href={catalogPath({ ...params, gruppe: group.slug })}
                    current={params.gruppe === group.slug}
                  >
                    {group.title} <span className="font-normal">{count}</span>
                  </Chip>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
          <div>
            <p id="visning" className="mb-1 font-meta text-sm font-medium text-stok-blue">
              {t.availability}
            </p>
            <ul aria-labelledby="visning" className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap">
              <li>
                <Chip href={catalogPath({ ...params, vis: undefined })} current={orderableOnly}>
                  {t.orderableNow} <span className="font-normal">{orderable.filter(inGroup).length}</span>
                </Chip>
              </li>
              <li>
                <Chip href={catalogPath({ ...params, vis: "alle" })} current={!orderableOnly}>
                  {t.showAllIncludingQuote}{" "}
                  <span className="font-normal">{products.filter(inGroup).length}</span>
                </Chip>
              </li>
            </ul>
          </div>

          <form action={`${shopPath()}#produkter`} className="flex items-end gap-2">
            {params.q && <input type="hidden" name="q" value={params.q} />}
            {params.gruppe && <input type="hidden" name="gruppe" value={params.gruppe} />}
            {params.vis && <input type="hidden" name="vis" value={params.vis} />}
            <div>
              <label htmlFor="bransje" className="mb-1 block font-meta text-sm font-medium text-stok-blue">
                {t.industry}
              </label>
              <select id="bransje" name="bransje" defaultValue={params.bransje ?? ""} className={fieldClass}>
                <option value="">{t.allIndustries}</option>
                {industries.map((i) => (
                  <option key={i.slug} value={i.slug}>
                    {i.title}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className={buttonClasses("outline", "px-5 py-2")}>
              {t.showResults}
            </button>
          </form>

          {hasFilters && (
            <Link href={catalogPath()} scroll={false} className="pb-2 font-semibold text-stok-blue underline">
              {t.resetFilters}
            </Link>
          )}
        </div>
      </div>

      <p role="status" className="mt-8 mb-4 font-meta text-sm font-medium text-stok-blue">
        {t.resultCount(shown.length)}
        {params.q && t.matching(params.q)}
        {orderableOnly && (
          <span className="font-body font-normal text-stok-text"> · {t.orderableNowHelp}</span>
        )}
      </p>
      {shown.length ? (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((product) => (
            <li key={product.slug}>
              <ShopProductCard
                product={product}
                groupTitle={groupTitle.get(product.group)}
                fromPrice={fromPrice(product.skus)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-3xl bg-white p-8 text-lg">{t.noResults}</p>
      )}
    </>
  );
}

/** Plassholder med omtrent samme høyde som raden, så hopp til #produkter treffer. */
function HighlightsSkeleton() {
  return (
    <div aria-busy="true" className="py-10 md:py-14">
      <Container>
        <div className="mb-6 h-9 w-56 rounded-2xl bg-stok-light" />
        <div className="h-72 rounded-3xl bg-stok-light sm:h-64" />
      </Container>
    </div>
  );
}

function CatalogSkeleton() {
  return (
    <div aria-busy="true" className="animate-pulse motion-reduce:animate-none">
      <div className="h-24 rounded-3xl bg-white" />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="h-80 rounded-3xl bg-white" />
        ))}
      </div>
    </div>
  );
}

/**
 * Butikkens forside er også katalogen: søk, «Kjøp igjen» og alle produkter
 * med filterknapper. Filtrene ligger i adressen (`?gruppe=eske&vis=alle`).
 */
export default function ShopHome({ searchParams }: Props) {
  return (
    <>
      <section className="bg-stok-light">
        <Container className="grid items-center gap-8 py-10 md:py-12 lg:grid-cols-[3fr_2fr]">
          <div>
            <p className="font-meta text-sm font-medium tracking-wide text-stok-green-dark uppercase">
              {t.shop}
            </p>
            <h1 className="mt-2 text-4xl md:text-5xl">Emballasje til din bedrift</h1>
            <p className="mt-4 max-w-2xl text-xl">{t.shopIntro}</p>
            <Suspense fallback={<SearchFields />}>
              <SearchForm searchParams={searchParams} />
            </Suspense>
          </div>
          <Suspense fallback={<div className="h-32 animate-pulse rounded-3xl bg-white/60" />}>
            <Welcome />
          </Suspense>
        </Container>
      </section>

      <Suspense fallback={<HighlightsSkeleton />}>
        <Highlights />
      </Suspense>

      <section
        id="produkter"
        aria-labelledby="produkter-tittel"
        className="scroll-mt-4 bg-stok-light py-10 md:py-14"
      >
        <Container>
          <h2 id="produkter-tittel" className="mb-6 text-3xl">
            {t.allProducts}
          </h2>
          <Suspense fallback={<CatalogSkeleton />}>
            <Catalog searchParams={searchParams} />
          </Suspense>
        </Container>
      </section>
    </>
  );
}

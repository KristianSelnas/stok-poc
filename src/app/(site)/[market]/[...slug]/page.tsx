import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Modules } from "@/components/modules/Modules";
import { IndustryPage } from "@/components/templates/IndustryPage";
import { NewsArticlePage } from "@/components/templates/NewsArticlePage";
import { ProductPage } from "@/components/templates/ProductPage";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { JsonLd } from "@/components/seo/JsonLd";
import { getIndustry, getNewsArticle, getPage, getRoutes, getSiteSettings } from "@/lib/content";
import { isMarket, marketIds, marketPath, type MarketId } from "@/lib/markets";
import { buildMetadata } from "@/lib/metadata";
import { getSiteCatalog, getSiteProduct, type SiteProduct, toCards } from "@/lib/products";
import { documentPath, resolveRoute, translationPaths } from "@/lib/routes";
import { newsArticleJsonLd, productJsonLd } from "@/lib/structuredData";
import type { Industry, NewsArticle, Page as PageDocument } from "@/sanity/types";
import { productPath, SHOP_MARKET } from "@/shop/paths";

/**
 * Alle undersider går gjennom denne ruten. `resolveRoute` finner
 * dokumenttypen ut fra adressen, f.eks. `/no/bransjer/fisk-og-sjomat`.
 * Produktsidene (`/no/produkter/<slug>`) henter fra produktkatalogen, resten
 * fra Sanity.
 */

/** Bygger alle kjente adresser ved deploy. Nye dokumenter rendres ved første besøk. */
export async function generateStaticParams() {
  const params = await Promise.all(
    marketIds.map(async (market) => {
      const [routes, catalog] = await Promise.all([getRoutes(market), getSiteCatalog(market)]);
      return [
        ...routes.map((route) => ({ type: route._type as string, slug: route.slug })),
        ...catalog.products.map((product) => ({ type: "product", slug: product.slug })),
      ].flatMap((route) => {
        const path = documentPath(route.type, route.slug, market);
        return path ? [{ market, slug: path.slice(1).split("/") }] : [];
      });
    }),
  );
  return params.flat();
}

type Loaded =
  | { type: "industry"; slug: string; doc: Industry | null }
  | { type: "product"; slug: string; doc: SiteProduct | null }
  | { type: "newsArticle"; slug: string; doc: NewsArticle | null }
  | { type: "page"; slug: string; doc: PageDocument | null };

async function loadDocument(market: MarketId, segments: string[]): Promise<Loaded> {
  const { type, slug } = resolveRoute(market, segments.map(decodeURIComponent));
  switch (type) {
    case "industry":
      return { type, slug, doc: await getIndustry(market, slug) };
    case "product":
      return { type, slug, doc: await getSiteProduct(market, slug) };
    case "newsArticle":
      return { type, slug, doc: await getNewsArticle(market, slug) };
    default:
      return { type: "page", slug, doc: await getPage(market, slug) };
  }
}

export async function generateMetadata({ params }: PageProps<"/[market]/[...slug]">): Promise<Metadata> {
  const { market, slug } = await params;
  if (!isMarket(market)) return {};
  const loaded = await loadDocument(market, slug);
  if (!loaded.doc) return {};
  const path = documentPath(loaded.type, loaded.slug, market) ?? `/${loaded.slug}`;
  if (loaded.type === "product") {
    const { product } = loaded.doc;
    return buildMetadata({
      seo: null,
      title: product.name,
      fallbackDescription: product.shortDescription ?? undefined,
      fallbackImage: product.images[0]?.url,
      market,
      path,
      alternates: {},
    });
  }
  const doc = loaded.doc;
  return buildMetadata({
    seo: doc.seo,
    title: doc.title,
    // Bruk ingress eller kort beskrivelse når SEO-beskrivelsen mangler.
    fallbackDescription: ("lead" in doc && doc.lead) || ("excerpt" in doc && doc.excerpt) || undefined,
    fallbackImage: ("image" in doc && doc.image?.url) || undefined,
    market,
    path,
    alternates: translationPaths(doc.translations),
  });
}

/**
 * Adressen (`params`) er URL-data. Den leses inne i en Suspense-grense, så
 * Next kan vise et felles skall (header, bunntekst, plassholder) med en gang
 * ved navigasjon. Sider som er kjent ved bygg, får innholdet ferdig i HTML-en.
 */
export default function Page({ params, searchParams }: PageProps<"/[market]/[...slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <DocumentPage params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function DocumentPage({ params, searchParams }: PageProps<"/[market]/[...slug]">) {
  const { market, slug } = await params;
  if (!isMarket(market)) notFound();
  const loaded = await loadDocument(market, slug);
  if (!loaded.doc) notFound();

  switch (loaded.type) {
    case "industry":
      return <IndustryPage industry={loaded.doc} market={market} />;
    case "product": {
      const { product, related } = loaded.doc;
      const catalog = await getSiteCatalog(market);
      return (
        <>
          <JsonLd data={productJsonLd(loaded.doc, await getSiteSettings(market), market)} />
          <ProductPage
            data={loaded.doc}
            related={toCards(catalog, related)}
            market={market}
            // Nettbutikken bruker den norske katalogen, så alle norske produkter finnes der.
            shopHref={market === SHOP_MARKET ? productPath(product.slug) : undefined}
          />
        </>
      );
    }
    case "newsArticle":
      return (
        <>
          <JsonLd data={newsArticleJsonLd(loaded.doc, await getSiteSettings(market), market)} />
          <NewsArticlePage article={loaded.doc} market={market} />
        </>
      );
    case "page":
      return (
        <Modules
          modules={loaded.doc.modules}
          market={market}
          path={marketPath(market, `/${loaded.slug}`)}
          searchParams={searchParams}
        />
      );
  }
}

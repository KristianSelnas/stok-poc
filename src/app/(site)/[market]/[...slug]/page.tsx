import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Modules } from "@/components/modules/Modules";
import { IndustryPage } from "@/components/templates/IndustryPage";
import { NewsArticlePage } from "@/components/templates/NewsArticlePage";
import { ProductPage } from "@/components/templates/ProductPage";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { JsonLd } from "@/components/seo/JsonLd";
import { getIndustry, getNewsArticle, getPage, getProduct, getRoutes, getSiteSettings } from "@/lib/content";
import { isMarket, marketIds, marketPath, type MarketId } from "@/lib/markets";
import { buildMetadata } from "@/lib/metadata";
import { documentPath, resolveRoute, translationPaths } from "@/lib/routes";
import { newsArticleJsonLd, productJsonLd } from "@/lib/structuredData";
import type { Industry, NewsArticle, Page as PageDocument, Product } from "@/sanity/types";
import { productPath, SHOP_MARKET } from "@/shop/paths";
import { getShopSlugs } from "@/shop/queries";

/**
 * Alle undersider går gjennom denne ruten. `resolveRoute` finner
 * dokumenttypen ut fra adressen, f.eks. `/no/bransjer/fisk-og-sjomat`.
 */

/** Bygger alle kjente adresser ved deploy. Nye dokumenter rendres ved første besøk. */
export async function generateStaticParams() {
  const params = await Promise.all(
    marketIds.map(async (market) =>
      (await getRoutes(market)).flatMap((route) => {
        const path = documentPath(route._type, route.slug, market);
        return path ? [{ market, slug: path.slice(1).split("/") }] : [];
      }),
    ),
  );
  return params.flat();
}

type Loaded =
  | { type: "industry"; slug: string; doc: Industry | null }
  | { type: "product"; slug: string; doc: Product | null }
  | { type: "newsArticle"; slug: string; doc: NewsArticle | null }
  | { type: "page"; slug: string; doc: PageDocument | null };

async function loadDocument(market: MarketId, segments: string[]): Promise<Loaded> {
  const { type, slug } = resolveRoute(market, segments.map(decodeURIComponent));
  switch (type) {
    case "industry":
      return { type, slug, doc: await getIndustry(market, slug) };
    case "product":
      return { type, slug, doc: await getProduct(market, slug) };
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
  const doc = loaded.doc;
  if (!doc) return {};
  const path = documentPath(loaded.type, loaded.slug, market) ?? `/${loaded.slug}`;
  return buildMetadata({
    seo: doc.seo,
    title: doc.title,
    // Bruk ingress eller kort beskrivelse når SEO-beskrivelsen mangler.
    fallbackDescription:
      ("lead" in doc && doc.lead) ||
      ("shortDescription" in doc && doc.shortDescription) ||
      ("excerpt" in doc && doc.excerpt) ||
      undefined,
    fallbackImage:
      ("image" in doc && doc.image?.url) || ("images" in doc && doc.images?.[0]?.url) || undefined,
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
      const inShop =
        market === SHOP_MARKET && !!loaded.doc.slug && (await getShopSlugs()).includes(loaded.doc.slug);
      return (
        <>
          <JsonLd data={productJsonLd(loaded.doc, await getSiteSettings(market), market)} />
          <ProductPage
            product={loaded.doc}
            market={market}
            shopHref={inShop && loaded.doc.slug ? productPath(loaded.doc.slug) : undefined}
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

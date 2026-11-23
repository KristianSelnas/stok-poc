import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Modules } from "@/components/modules/Modules";
import { IndustryPage } from "@/components/templates/IndustryPage";
import { NewsArticlePage } from "@/components/templates/NewsArticlePage";
import { ProductPage } from "@/components/templates/ProductPage";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { getIndustry, getNewsArticle, getPage, getProduct, getRoutes } from "@/lib/content";
import { isMarket, marketIds, marketPath, type MarketId } from "@/lib/markets";
import { buildMetadata } from "@/lib/metadata";
import { documentPath, resolveRoute } from "@/lib/routes";
import type { Industry, NewsArticle, Page as PageDocument, Product } from "@/sanity/types";

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
  const metadata = buildMetadata({ seo: doc.seo, title: doc.title, market, path });
  // Bruk ingress eller kort beskrivelse når SEO-beskrivelsen mangler.
  if (!metadata.description) {
    const description =
      ("lead" in doc && doc.lead) ||
      ("shortDescription" in doc && doc.shortDescription) ||
      ("excerpt" in doc && doc.excerpt) ||
      undefined;
    if (description) metadata.description = description;
  }
  return metadata;
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
    case "product":
      return <ProductPage product={loaded.doc} market={market} />;
    case "newsArticle":
      return <NewsArticlePage article={loaded.doc} market={market} />;
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

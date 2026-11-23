import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { draftMode } from "next/headers";
import type { ClientReturn, QueryParams } from "next-sanity";

import { isSanityConfigured } from "@/sanity/env";
import { sanityFetch } from "@/sanity/lib/live";
import { singletonId } from "@/sanity/lib/singletons";
import { SANITY_TAG } from "@/sanity/lib/tags";
import { readToken } from "@/sanity/lib/token";
import {
  catalogQuery,
  frontPageQuery,
  industryQuery,
  navigationQuery,
  newsArticleQuery,
  pageQuery,
  productQuery,
  routesQuery,
  siteSettingsQuery,
  sitemapQuery,
} from "@/sanity/queries";
import type {
  Catalog,
  FrontPage,
  Industry,
  Navigation,
  NewsArticle,
  Page,
  Product,
  Routes,
  SiteSettings,
  Sitemap,
} from "@/sanity/types";

import { markets, type MarketId } from "./markets";

/*
 * Datahenting fra Sanity. Nettsiden har ikke noe reserveinnhold, så bygget
 * stopper hvis Sanity ikke er konfigurert.
 */
if (!isSanityConfigured) {
  throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID mangler. Sett den i .env.local, se README.md.");
}

/** Innstillinger og navigasjon må finnes for at header og bunntekst skal virke. */
function required<T>(data: T | null | undefined, document: string, market: MarketId): T {
  if (!data) throw new Error(`Fant ikke ${document} for markedet «${market}» i Sanity. Kjør \`pnpm seed\`.`);
  return data;
}

const language = (market: MarketId) => markets[market].language;

/**
 * Henter fra Sanity. Kalles bare inne i funksjoner med `use cache`.
 *
 * I Draft Mode hentes kladder med usynlige stega-tegn, så Presentation-
 * verktøyet kan koble tekst til felt. Next lar oss lese `draftMode()` inne i
 * `use cache`, og i Draft Mode kjøres funksjonen på nytt ved hvert besøk uten
 * å lagre resultatet. Publisert innhold caches som vanlig.
 *
 * Cachen merkes med Sanitys synk-tagger (Sanity Live revaliderer dem) og med
 * `SANITY_TAG` (webhooken revaliderer den).
 */
async function fetchSanity<const Query extends string>(
  query: Query,
  params: QueryParams,
): Promise<ClientReturn<Query, unknown>> {
  const { isEnabled: preview } = await draftMode();
  const { data, tags } = await sanityFetch({
    query,
    params,
    // Uten lesetoken finnes bare publisert innhold.
    perspective: preview && readToken ? "drafts" : "published",
    stega: preview,
    tags: [SANITY_TAG],
  });
  cacheTag(...tags);
  // Stega-tegnene er usynlige og endrer ikke formen på dataene.
  return data as unknown as ClientReturn<Query, unknown>;
}

/**
 * Innhold fra Sanity caches lenge og revalideres av webhooken i
 * `app/api/revalidate` når noe publiseres. Levetiden er et sikkerhetsnett hvis
 * en webhook skulle feile. Brukes også av komponenter med `use cache` som
 * viser Sanity-innhold, så levetiden blir lik.
 */
export function applyCacheLife() {
  cacheLife("hours");
}

export async function getSiteSettings(market: MarketId): Promise<SiteSettings> {
  "use cache";
  cacheTag(SANITY_TAG, "siteSettings", `siteSettings:${market}`);
  applyCacheLife();

  const data = await fetchSanity(siteSettingsQuery, {
    id: singletonId("siteSettings", language(market)),
  });
  return required(data && "title" in data ? data : null, "siteSettings", market);
}

export async function getNavigation(market: MarketId): Promise<Navigation> {
  "use cache";
  cacheTag(SANITY_TAG, "navigation", `navigation:${market}`);
  applyCacheLife();

  const data = await fetchSanity(navigationQuery, {
    id: singletonId("navigation", language(market)),
  });
  return required(data?.mainMenu ? data : null, "navigation", market);
}

export async function getFrontPage(market: MarketId): Promise<FrontPage | null> {
  "use cache";
  cacheTag(SANITY_TAG, "frontPage", `frontPage:${market}`);
  applyCacheLife();

  return fetchSanity(frontPageQuery, {
    id: singletonId("frontPage", language(market)),
    language: language(market),
  });
}

export async function getPage(market: MarketId, slug: string): Promise<Page | null> {
  "use cache";
  cacheTag(SANITY_TAG, "page", `page:${market}:${slug}`);
  applyCacheLife();

  return fetchSanity(pageQuery, { language: language(market), slug });
}

export async function getIndustry(market: MarketId, slug: string): Promise<Industry | null> {
  "use cache";
  cacheTag(SANITY_TAG, "industry", `industry:${market}:${slug}`);
  applyCacheLife();

  return fetchSanity(industryQuery, { language: language(market), slug });
}

export async function getProduct(market: MarketId, slug: string): Promise<Product | null> {
  "use cache";
  cacheTag(SANITY_TAG, "product", `product:${market}:${slug}`);
  applyCacheLife();

  return fetchSanity(productQuery, { language: language(market), slug });
}

export async function getNewsArticle(market: MarketId, slug: string): Promise<NewsArticle | null> {
  "use cache";
  cacheTag(SANITY_TAG, "newsArticle", `newsArticle:${market}:${slug}`);
  applyCacheLife();

  return fetchSanity(newsArticleQuery, { language: language(market), slug });
}

/** Produkter og filtervalg til produktkatalogen. Filtreringen skjer i `lib/catalog.ts`. */
export async function getCatalog(market: MarketId): Promise<Catalog> {
  "use cache";
  cacheTag(SANITY_TAG, "product");
  applyCacheLife();

  return fetchSanity(catalogQuery, { language: language(market) });
}

/** Alle adresser i et marked (sider, bransjer, produkter, nyheter), til `generateStaticParams`. */
export async function getRoutes(market: MarketId): Promise<Routes> {
  "use cache";
  cacheTag(SANITY_TAG);
  applyCacheLife();

  return fetchSanity(routesQuery, { language: language(market) });
}

/** Alle indekserbare adresser i begge markeder, til sitemap.xml. */
export async function getSitemap(): Promise<Sitemap> {
  "use cache";
  cacheTag(SANITY_TAG);
  applyCacheLife();

  return fetchSanity(sitemapQuery, {});
}

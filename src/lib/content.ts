import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { isSanityConfigured } from "@/sanity/env";
import { client } from "@/sanity/lib/client";
import { singletonId } from "@/sanity/lib/singletons";
import { SANITY_TAG } from "@/sanity/lib/tags";
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
 * `use cache` styrer cachingen. Next sin fetch-cache slås av for Sanity-kall,
 * ellers lever svarene i opptil 15 minutter, også på tvers av bygg.
 */
const noFetchCache = { cache: "no-store" } as const;

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

  const data = await client.fetch(
    siteSettingsQuery,
    {
      id: singletonId("siteSettings", language(market)),
    },
    noFetchCache,
  );
  return required(data && "title" in data ? data : null, "siteSettings", market);
}

export async function getNavigation(market: MarketId): Promise<Navigation> {
  "use cache";
  cacheTag(SANITY_TAG, "navigation", `navigation:${market}`);
  applyCacheLife();

  const data = await client.fetch(
    navigationQuery,
    {
      id: singletonId("navigation", language(market)),
    },
    noFetchCache,
  );
  return required(data?.mainMenu ? data : null, "navigation", market);
}

export async function getFrontPage(market: MarketId): Promise<FrontPage | null> {
  "use cache";
  cacheTag(SANITY_TAG, "frontPage", `frontPage:${market}`);
  applyCacheLife();

  return client.fetch(
    frontPageQuery,
    { id: singletonId("frontPage", language(market)), language: language(market) },
    noFetchCache,
  );
}

export async function getPage(market: MarketId, slug: string): Promise<Page | null> {
  "use cache";
  cacheTag(SANITY_TAG, "page", `page:${market}:${slug}`);
  applyCacheLife();

  return client.fetch(pageQuery, { language: language(market), slug }, noFetchCache);
}

export async function getIndustry(market: MarketId, slug: string): Promise<Industry | null> {
  "use cache";
  cacheTag(SANITY_TAG, "industry", `industry:${market}:${slug}`);
  applyCacheLife();

  return client.fetch(industryQuery, { language: language(market), slug }, noFetchCache);
}

export async function getProduct(market: MarketId, slug: string): Promise<Product | null> {
  "use cache";
  cacheTag(SANITY_TAG, "product", `product:${market}:${slug}`);
  applyCacheLife();

  return client.fetch(productQuery, { language: language(market), slug }, noFetchCache);
}

export async function getNewsArticle(market: MarketId, slug: string): Promise<NewsArticle | null> {
  "use cache";
  cacheTag(SANITY_TAG, "newsArticle", `newsArticle:${market}:${slug}`);
  applyCacheLife();

  return client.fetch(newsArticleQuery, { language: language(market), slug }, noFetchCache);
}

/** Produkter og filtervalg til produktkatalogen. Filtreringen skjer i `lib/catalog.ts`. */
export async function getCatalog(market: MarketId): Promise<Catalog> {
  "use cache";
  cacheTag(SANITY_TAG, "product");
  applyCacheLife();

  return client.fetch(catalogQuery, { language: language(market) }, noFetchCache);
}

/** Alle adresser i et marked (sider, bransjer, produkter, nyheter), til `generateStaticParams`. */
export async function getRoutes(market: MarketId): Promise<Routes> {
  "use cache";
  cacheTag(SANITY_TAG);
  applyCacheLife();

  return client.fetch(routesQuery, { language: language(market) }, noFetchCache);
}

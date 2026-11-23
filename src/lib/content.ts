import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import {
  fallbackFrontPages,
  fallbackNavigation,
  fallbackPages,
  fallbackSiteSettings,
} from "@/content/fallback";
import { isSanityConfigured } from "@/sanity/env";
import { client } from "@/sanity/lib/client";
import { singletonId } from "@/sanity/lib/singletons";
import { SANITY_TAG } from "@/sanity/lib/tags";
import {
  frontPageQuery,
  navigationQuery,
  pageQuery,
  pageSlugsQuery,
  siteSettingsQuery,
} from "@/sanity/queries";
import type { FrontPage, Navigation, Page, SiteSettings } from "@/sanity/types";

import { markets, type MarketId } from "./markets";

/*
 * Datahenting. Alle funksjoner faller tilbake på reserveinnhold når Sanity
 * ikke er konfigurert eller dokumentet ikke finnes der ennå.
 */

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

  if (!isSanityConfigured) return fallbackSiteSettings[market];
  const data = await client.fetch(
    siteSettingsQuery,
    {
      id: singletonId("siteSettings", language(market)),
    },
    noFetchCache,
  );
  return data && "title" in data ? data : fallbackSiteSettings[market];
}

export async function getNavigation(market: MarketId): Promise<Navigation> {
  "use cache";
  cacheTag(SANITY_TAG, "navigation", `navigation:${market}`);
  applyCacheLife();

  if (!isSanityConfigured) return fallbackNavigation[market];
  const data = await client.fetch(
    navigationQuery,
    {
      id: singletonId("navigation", language(market)),
    },
    noFetchCache,
  );
  return data?.mainMenu ? data : fallbackNavigation[market];
}

export async function getFrontPage(market: MarketId): Promise<FrontPage> {
  "use cache";
  cacheTag(SANITY_TAG, "frontPage", `frontPage:${market}`);
  applyCacheLife();

  if (!isSanityConfigured) return fallbackFrontPages[market];
  const data = await client.fetch(
    frontPageQuery,
    {
      id: singletonId("frontPage", language(market)),
    },
    noFetchCache,
  );
  return data?.modules?.length ? data : fallbackFrontPages[market];
}

export async function getPage(market: MarketId, slug: string): Promise<Page | null> {
  "use cache";
  cacheTag(SANITY_TAG, "page", `page:${market}:${slug}`);
  applyCacheLife();

  const fallback = fallbackPages[market].find((page) => page.slug === slug) ?? null;
  if (!isSanityConfigured) return fallback;
  const data = await client.fetch(pageQuery, { language: language(market), slug }, noFetchCache);
  return data ?? fallback;
}

/** Alle sideadresser i et marked, til `generateStaticParams`. */
export async function getPageSlugs(market: MarketId): Promise<string[]> {
  "use cache";
  cacheTag(SANITY_TAG, "page");
  applyCacheLife();

  const fallback = fallbackPages[market].flatMap((page) => page.slug ?? []);
  if (!isSanityConfigured) return fallback;
  const slugs = await client.fetch(pageSlugsQuery, { language: language(market) }, noFetchCache);
  return [...new Set([...slugs, ...fallback])];
}

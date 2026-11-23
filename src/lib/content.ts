import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { fallbackNavigation, fallbackSiteSettings } from "@/content/fallback";
import { isSanityConfigured } from "@/sanity/env";
import { client } from "@/sanity/lib/client";
import { navigationQuery, siteSettingsQuery } from "@/sanity/queries";
import { singletonId } from "@/sanity/lib/singletons";
import type { Navigation, SiteSettings } from "@/sanity/types";

import { markets, type MarketId } from "./markets";

/**
 * Henter innstillinger for et marked. Faller tilbake på lokalt innhold når
 * Sanity ikke er konfigurert eller dokumentet ikke finnes ennå.
 */
export async function getSiteSettings(market: MarketId): Promise<SiteSettings> {
  "use cache";
  cacheTag("siteSettings", `siteSettings:${market}`);
  cacheLife("hours");

  if (!isSanityConfigured) return fallbackSiteSettings[market];

  const data = await client.fetch<SiteSettings | null>(siteSettingsQuery, {
    id: singletonId("siteSettings", markets[market].language),
  });
  return data ?? fallbackSiteSettings[market];
}

export async function getNavigation(market: MarketId): Promise<Navigation> {
  "use cache";
  cacheTag("navigation", `navigation:${market}`);
  cacheLife("hours");

  if (!isSanityConfigured) return fallbackNavigation[market];

  const data = await client.fetch<Navigation | null>(navigationQuery, {
    id: singletonId("navigation", markets[market].language),
  });
  return data?.mainMenu ? data : fallbackNavigation[market];
}

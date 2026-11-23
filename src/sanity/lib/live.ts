import "server-only";

import { defineLive } from "next-sanity/live";

import { client } from "./client";
import { readToken } from "./token";

/**
 * Sanity Live. `sanityFetch` merker cachen med Sanitys synk-tagger, og
 * `<SanityLive />` i layouten lytter etter endringer og revaliderer taggene.
 *
 * `strict` krever at perspektiv og stega oppgis ved hvert kall. Det passer med
 * Cache Components, der Draft Mode må leses eksplisitt (se `lib/content.ts`).
 *
 * Nettleseren får ikke token. I Presentation-verktøyet gir Studio tilgang til
 * kladdene, så live-oppdatering av kladder virker der.
 */
export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: readToken ?? false,
  browserToken: false,
  strict: true,
});

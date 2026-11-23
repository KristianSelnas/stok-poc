export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-11-01";

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "development";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";

/**
 * Sanity-prosjektet er ikke opprettet ennå. Uten prosjekt-ID bruker nettsiden
 * reserveinnhold fra `src/content/fallback.ts`, så den kan kjøres lokalt.
 */
export const isSanityConfigured = projectId.length > 0;

export const studioBasePath = "/studio";

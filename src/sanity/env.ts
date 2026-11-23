export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-11-01";

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";

/**
 * Uten prosjekt-ID bruker nettsiden reserveinnhold fra `src/content/fallback/`,
 * så den kan kjøres lokalt uten Sanity.
 */
export const isSanityConfigured = projectId.length > 0;

export const studioBasePath = "/studio";

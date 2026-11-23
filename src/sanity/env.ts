export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-11-01";

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";

/** Uten prosjekt-ID stopper bygget, og Studio viser en melding om oppsettet. */
export const isSanityConfigured = projectId.length > 0;

export const studioBasePath = "/studio";

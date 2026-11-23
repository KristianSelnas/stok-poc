import "server-only";

/**
 * Lesetoken (Viewer) for kladder i Draft Mode. Det sendes aldri til nettleseren.
 * Uten token viser forhåndsvisningen bare publisert innhold.
 */
export const readToken = process.env.SANITY_API_READ_TOKEN || undefined;

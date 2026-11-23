/**
 * Adressen og indekseringen til nettstedet.
 *
 * `NEXT_PUBLIC_SITE_URL` settes når siden får et eget domene. Uten den brukes
 * produksjonsdomenet fra Vercel, og lokalt `http://localhost:3000`.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");

/**
 * PoC-en skal ikke indekseres (se docs/06-teknisk-arkitektur.md). Sett
 * `SITE_ALLOW_INDEXING=true` når siden lanseres. Da forsvinner `noindex` fra
 * alle sider og `X-Robots-Tag` fra alle svar.
 */
export const allowIndexing = process.env.SITE_ALLOW_INDEXING === "true";

/** Lager en full adresse, f.eks. `https://stok-poc.vercel.app/no/kontakt`. */
export function absoluteUrl(path: string): string {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

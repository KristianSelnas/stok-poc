import type { NextConfig } from "next";

/** Samme bryter som `allowIndexing` i `src/lib/site.ts`. */
const allowIndexing = process.env.SITE_ALLOW_INDEXING === "true";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Produktlisten i nettbutikken er slått sammen med butikkens forside. Query-parametere følger med.
  async redirects() {
    return [{ source: "/no/butikk/produkter", destination: "/no/butikk", permanent: false }];
  },
  // PoC-en skal ikke indekseres. Headeren gjelder alle svar, også bilder, filer og Studio.
  async headers() {
    if (allowIndexing) return [];
    return [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
};

export default nextConfig;

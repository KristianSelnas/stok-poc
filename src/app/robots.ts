import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

/**
 * robots.txt. Søkemotorer får lese sidene, så de ser `noindex` så lenge
 * PoC-en ikke skal indekseres (se `allowIndexing` i lib/site.ts). Blokkerer vi
 * dem her i stedet, kan adressene havne i søkeresultatene uten innhold.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/studio", "/api"] },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}

import type { MarketId } from "@/lib/markets";
import type { FrontPage, Page } from "@/sanity/types";

import { frontPageIs, pagesIs } from "./pages-is";
import { frontPageNo, pagesNo } from "./pages-no";

/**
 * Reserveinnhold som brukes når Sanity ikke er koblet til, eller når et
 * dokument ikke finnes der ennå. Formen er lik GROQ-resultatene, så det kan
 * importeres som startinnhold senere.
 */
export { fallbackNavigation, fallbackSiteSettings } from "./settings";

export const fallbackFrontPages: Record<MarketId, FrontPage> = {
  no: frontPageNo,
  is: frontPageIs,
};

export const fallbackPages: Record<MarketId, Page[]> = {
  no: pagesNo,
  is: pagesIs,
};

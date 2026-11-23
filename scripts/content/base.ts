import type { MarketId } from "@/lib/markets";
import type { FrontPage, Page } from "@/sanity/types";

import { frontPageIs, pagesIs } from "./pages-is";
import { frontPageNo, pagesNo } from "./pages-no";

/**
 * Startinnhold for forside, sider, navigasjon og innstillinger. `pnpm seed`
 * legger det inn i Sanity. Formen er lik GROQ-resultatene.
 */
export { baseNavigation, baseSiteSettings } from "./settings";

export const baseFrontPages: Record<MarketId, FrontPage> = {
  no: frontPageNo,
  is: frontPageIs,
};

export const basePages: Record<MarketId, Omit<Page, "translations">[]> = {
  no: pagesNo,
  is: pagesIs,
};

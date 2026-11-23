import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { market as getMarketParam } from "next/root-params";

import { Modules } from "@/components/modules/Modules";
import { getFrontPage } from "@/lib/content";
import { isMarket, marketPath } from "@/lib/markets";
import { buildMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const market = await getMarketParam();
  if (!isMarket(market)) return {};
  const frontPage = await getFrontPage(market);
  return buildMetadata({ seo: frontPage?.seo, market, path: "/" });
}

/** Forsiden, bygget av moduler fra dokumentet `frontPage` i Sanity. */
export default async function FrontPage() {
  const market = await getMarketParam();
  if (!isMarket(market)) notFound();
  const frontPage = await getFrontPage(market);
  if (!frontPage) notFound();

  return <Modules modules={frontPage.modules} market={market} path={marketPath(market)} />;
}

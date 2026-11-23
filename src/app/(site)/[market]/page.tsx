import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { market as getMarketParam } from "next/root-params";

import { Modules } from "@/components/modules/Modules";
import { JsonLd } from "@/components/seo/JsonLd";
import { getFrontPage, getSiteSettings } from "@/lib/content";
import { isMarket, marketIds, marketPath, markets } from "@/lib/markets";
import { buildMetadata } from "@/lib/metadata";
import { organizationJsonLd } from "@/lib/structuredData";

export async function generateMetadata(): Promise<Metadata> {
  const market = await getMarketParam();
  if (!isMarket(market)) return {};
  const frontPage = await getFrontPage(market);
  // Forsiden finnes i alle markeder, så alle forsidene er oversettelser av hverandre.
  const alternates = Object.fromEntries(marketIds.map((id) => [markets[id].language, marketPath(id)]));
  return buildMetadata({ seo: frontPage?.seo, market, path: "/", alternates });
}

/** Forsiden, bygget av moduler fra dokumentet `frontPage` i Sanity. */
export default async function FrontPage() {
  const market = await getMarketParam();
  if (!isMarket(market)) notFound();
  const frontPage = await getFrontPage(market);
  if (!frontPage) notFound();

  const settings = await getSiteSettings(market);

  return (
    <>
      <JsonLd data={organizationJsonLd(settings, market)} />
      <Modules modules={frontPage.modules} market={market} path={marketPath(market)} />
    </>
  );
}

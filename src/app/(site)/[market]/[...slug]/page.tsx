import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Modules } from "@/components/modules/Modules";
import { getPage, getPageSlugs } from "@/lib/content";
import { isMarket, marketIds } from "@/lib/markets";
import { buildMetadata } from "@/lib/metadata";

/** Bygger alle kjente sider ved deploy. Nye sider fra Sanity rendres ved første besøk. */
export async function generateStaticParams() {
  const params = await Promise.all(
    marketIds.map(async (market) =>
      (await getPageSlugs(market)).map((slug) => ({ market, slug: slug.split("/") })),
    ),
  );
  return params.flat();
}

export async function generateMetadata({ params }: PageProps<"/[market]/[...slug]">): Promise<Metadata> {
  const { market, slug } = await params;
  if (!isMarket(market)) return {};
  const path = slug.join("/");
  const page = await getPage(market, path);
  if (!page) return {};
  return buildMetadata({ seo: page.seo, title: page.title, market, path: `/${path}` });
}

/** Generelle sider bygget av moduler (dokumenttypen `page`). */
export default async function Page({ params }: PageProps<"/[market]/[...slug]">) {
  const { market, slug } = await params;
  if (!isMarket(market)) notFound();
  const page = await getPage(market, slug.map(decodeURIComponent).join("/"));
  if (!page) notFound();

  return <Modules modules={page.modules} market={market} />;
}

import { defineDocuments, defineLocations, type PresentationPluginOptions } from "sanity/presentation";

import { marketPath, markets, type MarketId } from "../lib/markets";
import { documentPath, routePrefixes, type PrefixedType } from "../lib/routes";
import { singletonId } from "./lib/singletons";

/**
 * Kobler adresser og dokumenter i Presentation-verktøyet:
 *
 * - `mainDocuments`: hvilket dokument som åpnes for redigering når
 *   redaktøren navigerer til en adresse i forhåndsvisningen.
 * - `locations`: hvor et dokument vises på nettsiden. Listen vises øverst i
 *   dokumentet, med lenke til forhåndsvisningen.
 */

const marketList = Object.values(markets);

function marketForLanguage(language: unknown): MarketId | undefined {
  return marketList.find((market) => market.language === language)?.id;
}

const slugParam = ({ params }: { params: Record<string, string> }) => ({ slug: params.slug });

const mainDocuments = defineDocuments(
  marketList.flatMap((market) => [
    {
      route: `/${market.id}`,
      filter: `_id == "${singletonId("frontPage", market.language)}"`,
    },
    // Typer med prefiks før generelle sider, så `/no/bransjer/x` ikke tolkes som en side.
    ...(Object.keys(routePrefixes) as PrefixedType[]).map((type) => ({
      route: `/${market.id}/${routePrefixes[type][market.id]}/:slug`,
      filter: `_type == "${type}" && language == "${market.language}" && slug.current == $slug`,
      params: slugParam,
    })),
    {
      route: `/${market.id}/:slug+`,
      filter: `_type == "page" && language == "${market.language}" && slug.current == $slug`,
      params: slugParam,
    },
  ]),
);

/** Adressen til et dokument som har egen side. */
function routableLocation(type: string) {
  return defineLocations({
    select: { title: "title", slug: "slug.current", language: "language" },
    resolve: (doc) => {
      const market = marketForLanguage(doc?.language);
      const path = market && documentPath(type, doc?.slug, market);
      if (!market || !path) return { message: "Dokumentet trenger en adresse før det kan forhåndsvises." };
      return { locations: [{ title: doc?.title || "Uten tittel", href: marketPath(market, path) }] };
    },
  });
}

/** Innhold som vises på alle sider, f.eks. meny og bunntekst. Forsiden brukes som eksempel. */
const everywhere = defineLocations({
  select: { language: "language" },
  resolve: (doc) => {
    const market = marketForLanguage(doc?.language);
    if (!market) return null;
    return {
      message: "Vises på alle sider",
      tone: "positive",
      locations: [{ title: "Forside", href: marketPath(market) }],
    };
  },
});

export const presentationResolve: PresentationPluginOptions["resolve"] = {
  mainDocuments,
  locations: {
    frontPage: defineLocations({
      select: { language: "language" },
      resolve: (doc) => {
        const market = marketForLanguage(doc?.language);
        return market ? { locations: [{ title: "Forside", href: marketPath(market) }] } : null;
      },
    }),
    page: routableLocation("page"),
    industry: routableLocation("industry"),
    product: routableLocation("product"),
    newsArticle: routableLocation("newsArticle"),
    navigation: everywhere,
    siteSettings: everywhere,
  },
};

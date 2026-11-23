import { CogIcon } from "@sanity/icons/Cog";
import { DocumentsIcon } from "@sanity/icons/Documents";
import { EarthGlobeIcon } from "@sanity/icons/EarthGlobe";
import { HomeIcon } from "@sanity/icons/Home";
import { MenuIcon } from "@sanity/icons/Menu";
import type { StructureBuilder, StructureResolver } from "sanity/structure";

import { markets } from "../lib/markets";
import { singletonId } from "./lib/singletons";

type Market = (typeof markets)[keyof typeof markets];

function singletonItem(
  S: StructureBuilder,
  market: Market,
  type: string,
  title: string,
  icon: typeof CogIcon,
) {
  const id = singletonId(type, market.language);
  return S.listItem()
    .id(id)
    .title(title)
    .icon(icon)
    .child(
      S.document()
        .schemaType(type)
        .documentId(id)
        .initialValueTemplate(id)
        .title(`${title} – ${market.label}`),
    );
}

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Innhold")
    .items(
      Object.values(markets).map((market) =>
        S.listItem()
          .id(`market-${market.id}`)
          .title(market.label)
          .icon(EarthGlobeIcon)
          .child(
            S.list()
              .id(`market-${market.id}-list`)
              .title(market.label)
              .items([
                singletonItem(S, market, "frontPage", "Forside", HomeIcon),
                S.listItem()
                  .id(`pages-${market.language}`)
                  .title("Sider")
                  .icon(DocumentsIcon)
                  .child(
                    S.documentTypeList("page")
                      .id(`pages-${market.language}-list`)
                      .title(`Sider – ${market.label}`)
                      .filter('_type == "page" && language == $language')
                      .params({ language: market.language })
                      .defaultOrdering([{ field: "slug.current", direction: "asc" }])
                      // Malen kommer fra språkpluginen og fyller ut `language`.
                      .initialValueTemplates([S.initialValueTemplateItem(`page-${market.language}`)]),
                  ),
                S.divider(),
                singletonItem(S, market, "navigation", "Navigasjon", MenuIcon),
                singletonItem(S, market, "siteSettings", "Innstillinger", CogIcon),
              ]),
          ),
      ),
    );

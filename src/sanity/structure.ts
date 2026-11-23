import { CogIcon } from "@sanity/icons/Cog";
import { EarthGlobeIcon } from "@sanity/icons/EarthGlobe";
import { MenuIcon } from "@sanity/icons/Menu";
import type { StructureResolver } from "sanity/structure";

import { markets } from "@/lib/markets";

import { singletonId } from "./lib/singletons";

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
              .title(market.label)
              .items([
                S.listItem()
                  .title("Innstillinger")
                  .icon(CogIcon)
                  .child(
                    S.document()
                      .schemaType("siteSettings")
                      .documentId(singletonId("siteSettings", market.language))
                      .initialValueTemplate(singletonId("siteSettings", market.language))
                      .title(`Innstillinger – ${market.label}`),
                  ),
                S.listItem()
                  .title("Navigasjon")
                  .icon(MenuIcon)
                  .child(
                    S.document()
                      .schemaType("navigation")
                      .documentId(singletonId("navigation", market.language))
                      .initialValueTemplate(singletonId("navigation", market.language))
                      .title(`Navigasjon – ${market.label}`),
                  ),
              ]),
          ),
      ),
    );

import { BulbOutlineIcon } from "@sanity/icons/BulbOutline";
import { CaseIcon } from "@sanity/icons/Case";
import { CogIcon } from "@sanity/icons/Cog";
import { CommentIcon } from "@sanity/icons/Comment";
import { DocumentsIcon } from "@sanity/icons/Documents";
import { EarthGlobeIcon } from "@sanity/icons/EarthGlobe";
import { HomeIcon } from "@sanity/icons/Home";
import { MenuIcon } from "@sanity/icons/Menu";
import { PackageIcon } from "@sanity/icons/Package";
import { PinIcon } from "@sanity/icons/Pin";
import { StarFilledIcon } from "@sanity/icons/StarFilled";
import { TagIcon } from "@sanity/icons/Tag";
import { TagsIcon } from "@sanity/icons/Tags";
import { UserIcon } from "@sanity/icons/User";
import { UsersIcon } from "@sanity/icons/Users";
import type { ListItemBuilder, StructureBuilder, StructureResolver } from "sanity/structure";

import { markets } from "../lib/markets";
import { apiVersion } from "./env";
import { singletonId } from "./lib/singletons";

type Market = (typeof markets)[keyof typeof markets];
type Icon = typeof CogIcon;

function singletonItem(S: StructureBuilder, market: Market, type: string, title: string, icon: Icon) {
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

/** Liste med dokumenter av én type i ett språk. Nye dokumenter får språket automatisk. */
function languageList(
  S: StructureBuilder,
  market: Market,
  type: string,
  title: string,
  icon: Icon,
  ordering: { field: string; direction: "asc" | "desc" }[] = [{ field: "title", direction: "asc" }],
): ListItemBuilder {
  return S.listItem()
    .id(`${type}-${market.language}`)
    .title(title)
    .icon(icon)
    .child(
      S.documentTypeList(type)
        .id(`${type}-${market.language}-list`)
        .title(`${title} – ${market.label}`)
        .apiVersion(apiVersion)
        .filter("_type == $type && language == $language")
        .params({ type, language: market.language })
        .defaultOrdering(ordering)
        // Malen kommer fra språkpluginen og fyller ut `language`.
        .initialValueTemplates([S.initialValueTemplateItem(`${type}-${market.language}`)]),
    );
}

/** Undermeny med flere dokumentlister, f.eks. «Produktkatalog». */
function group(
  S: StructureBuilder,
  market: Market,
  id: string,
  title: string,
  icon: Icon,
  items: ListItemBuilder[],
) {
  return S.listItem()
    .id(`${id}-${market.language}`)
    .title(title)
    .icon(icon)
    .child(S.list().id(`${id}-${market.language}-group`).title(`${title} – ${market.label}`).items(items));
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
                languageList(S, market, "page", "Sider", DocumentsIcon, [
                  { field: "slug.current", direction: "asc" },
                ]),
                languageList(S, market, "industry", "Bransjer", CaseIcon),
                group(S, market, "catalog", "Produktkatalog", PackageIcon, [
                  languageList(S, market, "product", "Produkter", PackageIcon),
                  languageList(S, market, "productGroup", "Produktgrupper", TagsIcon, [
                    { field: "order", direction: "asc" },
                  ]),
                  languageList(S, market, "material", "Materialer", TagIcon),
                ]),
                group(S, market, "news", "Nyheter", BulbOutlineIcon, [
                  languageList(S, market, "newsArticle", "Artikler", BulbOutlineIcon, [
                    { field: "publishedAt", direction: "desc" },
                  ]),
                  languageList(S, market, "newsCategory", "Kategorier", TagIcon),
                ]),
                group(S, market, "organization", "Kontakt og organisasjon", UsersIcon, [
                  languageList(S, market, "person", "Kontaktpersoner", UserIcon, [
                    { field: "name", direction: "asc" },
                  ]),
                  languageList(S, market, "department", "Avdelinger", UsersIcon, [
                    { field: "order", direction: "asc" },
                  ]),
                  languageList(S, market, "location", "Lokasjoner", PinIcon),
                ]),
                group(S, market, "trust", "Sitater og sertifikater", StarFilledIcon, [
                  languageList(S, market, "testimonial", "Kundesitater", CommentIcon, [
                    { field: "company", direction: "asc" },
                  ]),
                  languageList(S, market, "certificate", "Sertifikater", StarFilledIcon),
                ]),
                S.divider(),
                singletonItem(S, market, "navigation", "Navigasjon", MenuIcon),
                singletonItem(S, market, "siteSettings", "Innstillinger", CogIcon),
              ]),
          ),
      ),
    );

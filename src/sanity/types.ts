/**
 * Typer avledet fra resultatene av GROQ-spørringene. Grunnlaget genereres av
 * Sanity TypeGen i `sanity.types.ts` (kjør `pnpm typegen` etter endringer i
 * skjema eller spørringer).
 */
import type {
  CatalogQueryResult,
  FrontPageQueryResult,
  IndustryQueryResult,
  NavigationQueryResult,
  NewsArticleQueryResult,
  PageQueryResult,
  ProductQueryResult,
  RoutesQueryResult,
  SiteSettingsQueryResult,
} from "./sanity.types";

export type SiteSettings = NonNullable<SiteSettingsQueryResult>;
export type Navigation = NonNullable<NavigationQueryResult>;
export type FrontPage = NonNullable<FrontPageQueryResult>;
export type Page = NonNullable<PageQueryResult>;

export type Module = NonNullable<Page["modules"]>[number];
export type ModuleType = Module["_type"];
export type ModuleOf<T extends ModuleType> = Extract<Module, { _type: T }>;

export type Link = NonNullable<ModuleOf<"textWithImage">["cta"]>;
export type Image = NonNullable<ModuleOf<"textWithImage">["image"]>;
export type Seo = NonNullable<Page["seo"]>;

export type RichTextContent = NonNullable<ModuleOf<"richText">["content"]>;
export type SimpleTextContent = NonNullable<ModuleOf<"textWithImage">["body"]>;

export type MenuItem = NonNullable<Navigation["mainMenu"]>[number];
export type LinkGroup = NonNullable<MenuItem["groups"]>[number];
export type SocialLink = NonNullable<SiteSettings["socialLinks"]>[number];

// Fase 3: bransjer, produkter, nyheter og kontakt

export type Industry = NonNullable<IndustryQueryResult>;
export type Product = NonNullable<ProductQueryResult>;
export type NewsArticle = NonNullable<NewsArticleQueryResult>;
export type Catalog = CatalogQueryResult;
export type CatalogProduct = Catalog["products"][number];
export type Routes = RoutesQueryResult;

export type ProductCard = NonNullable<ModuleOf<"productGrid">["products"]>[number];
export type NewsCard = NonNullable<ModuleOf<"newsList">["articles"]>[number];
export type Person = NonNullable<ModuleOf<"contactPeople">["people"]>[number];
export type Location = NonNullable<ModuleOf<"locations">["items"]>[number];

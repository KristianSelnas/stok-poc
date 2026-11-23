/**
 * Typer avledet fra resultatene av GROQ-spørringene. Grunnlaget genereres av
 * Sanity TypeGen i `sanity.types.ts` (kjør `pnpm typegen` etter endringer i
 * skjema eller spørringer).
 */
import type {
  FrontPageQueryResult,
  NavigationQueryResult,
  PageQueryResult,
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

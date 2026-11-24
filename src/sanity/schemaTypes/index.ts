import type { SchemaTypeDefinition } from "sanity";

import { industry } from "./documents/industry";
import { newsArticle, newsCategory } from "./documents/news";
import { certificate, department, location, person, testimonial } from "./documents/organization";
import { page } from "./documents/page";
import { card, featureItem, moduleTypes } from "./modules";
import { blockContent, simpleBlockContent } from "./objects/blockContent";
import { imageWithAlt } from "./objects/imageWithAlt";
import { link, linkAnnotation } from "./objects/link";
import { linkGroup, menuItem, socialLink } from "./objects/navigation";
import { seo } from "./objects/seo";
import { frontPage } from "./singletons/frontPage";
import { navigation } from "./singletons/navigation";
import { siteSettings } from "./singletons/siteSettings";

/** Dokumenttyper som finnes i nøyaktig ett eksemplar per marked. */
export const singletonTypes = ["siteSettings", "navigation", "frontPage"] as const;

/**
 * Dokumenttyper som er knyttet til ett språk via språkpluginen. Pluginen
 * fyller ut `language` og kobler sammen oversettelser av samme dokument.
 */
export const translatableTypes = [
  "page",
  "industry",
  "newsArticle",
  "newsCategory",
  "person",
  "department",
  "location",
  "testimonial",
  "certificate",
] as const;

export const schemaTypes: SchemaTypeDefinition[] = [
  // Singletons
  siteSettings,
  navigation,
  frontPage,
  // Dokumenter
  page,
  industry,
  newsArticle,
  newsCategory,
  person,
  department,
  location,
  testimonial,
  certificate,
  // Moduler
  ...moduleTypes,
  card,
  featureItem,
  // Objekter
  link,
  linkAnnotation,
  linkGroup,
  menuItem,
  socialLink,
  seo,
  imageWithAlt,
  blockContent,
  simpleBlockContent,
];

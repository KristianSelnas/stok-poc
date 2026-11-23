import type { SchemaTypeDefinition } from "sanity";

import { link } from "./objects/link";
import { linkGroup, menuItem, socialLink } from "./objects/navigation";
import { navigation } from "./singletons/navigation";
import { siteSettings } from "./singletons/siteSettings";

/** Dokumenttyper som finnes i nøyaktig ett eksemplar per marked. */
export const singletonTypes = ["siteSettings", "navigation"] as const;

export const schemaTypes: SchemaTypeDefinition[] = [
  // Singletons
  siteSettings,
  navigation,
  // Objekter
  link,
  linkGroup,
  menuItem,
  socialLink,
];

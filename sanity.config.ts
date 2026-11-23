"use client";

import { documentInternationalization } from "@sanity/document-internationalization";
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";

import { markets } from "./src/lib/markets";
import { apiVersion, dataset, projectId, studioBasePath } from "./src/sanity/env";
import { singletonId } from "./src/sanity/lib/singletons";
import { presentationResolve } from "./src/sanity/presentation";
import { schemaTypes, singletonTypes, translatableTypes } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";

const singletons = new Set<string>(singletonTypes);
const languages = Object.values(markets).map((market) => ({
  id: market.language,
  title: market.languageLabel,
}));

/** Maler redaktøren ikke skal se i «Nytt dokument»: singletons og sider uten språk. */
function isHiddenTemplate(templateId: string): boolean {
  const type = templateId.replace(/-(nb|is|parameterized)$/, "");
  if (singletons.has(type)) return true;
  return (
    (translatableTypes as readonly string[]).includes(templateId) || templateId.endsWith("-parameterized")
  );
}

export default defineConfig({
  name: "stok",
  title: "STOK Emballage",
  basePath: studioBasePath,
  projectId: projectId || "not-configured",
  dataset,
  schema: {
    types: schemaTypes,
    // Én mal per singleton og språk, så `language` fylles ut automatisk.
    templates: (templates) => [
      ...templates.filter((template) => !singletons.has(template.schemaType)),
      ...singletonTypes.flatMap((type) =>
        Object.values(markets).map((market) => ({
          id: singletonId(type, market.language),
          title: `${type} (${market.label})`,
          schemaType: type,
          value: { language: market.language },
        })),
      ),
    ],
  },
  document: {
    // Singletons kan ikke slettes eller dupliseres.
    actions: (actions, { schemaType }) =>
      singletons.has(schemaType)
        ? actions.filter(({ action }) => action && ["publish", "discardChanges", "restore"].includes(action))
        : actions,
    newDocumentOptions: (options) => options.filter((option) => !isHiddenTemplate(option.templateId)),
  },
  plugins: [
    structureTool({ structure }),
    // Forhåndsvisning med klikk-for-å-redigere. Nettsiden og Studio ligger på
    // samme domene, så adressene er relative.
    presentationTool({
      title: "Forhåndsvisning",
      resolve: presentationResolve,
      previewUrl: {
        initial: "/no",
        previewMode: { enable: "/api/draft-mode/enable" },
      },
    }),
    documentInternationalization({
      supportedLanguages: languages,
      schemaTypes: [...translatableTypes],
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});

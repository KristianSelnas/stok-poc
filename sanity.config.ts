"use client";

import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { markets } from "@/lib/markets";
import { apiVersion, dataset, projectId, studioBasePath } from "@/sanity/env";
import { schemaTypes, singletonTypes } from "@/sanity/schemaTypes";
import { singletonId } from "@/sanity/lib/singletons";
import { structure } from "@/sanity/structure";

const singletons = new Set<string>(singletonTypes);

export default defineConfig({
  name: "stok",
  title: "STOK Emballage",
  basePath: studioBasePath,
  projectId: projectId || "not-configured",
  dataset,
  schema: {
    types: schemaTypes,
    // Én mal per singleton og språk, så `language` fylles ut automatisk.
    // Singletons fjernes fra «Nytt dokument»-menyen.
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
    newDocumentOptions: (options) =>
      options.filter((option) => !singletons.has(option.templateId.replace(/-(nb|is)$/, ""))),
  },
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: apiVersion })],
});

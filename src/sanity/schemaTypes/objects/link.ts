import { LinkIcon } from "@sanity/icons/Link";
import { defineField, defineType } from "sanity";

import { referenceFilterByLanguage } from "../../lib/referenceFilter";

/** Dokumenttyper en intern lenke kan peke på. Adressen bygges i `src/lib/routes.ts`. */
export const linkableTypes = [
  { type: "page" },
  { type: "industry" },
  { type: "product" },
  { type: "newsArticle" },
];

/** Felt for hvor lenken peker. Deles av `link` og `linkAnnotation`. */
const targetFields = [
  defineField({
    name: "linkType",
    title: "Type",
    type: "string",
    initialValue: "internal",
    options: {
      list: [
        { title: "Side", value: "internal" },
        { title: "Sti", value: "path" },
        { title: "Ekstern lenke", value: "external" },
      ],
      layout: "radio",
      direction: "horizontal",
    },
  }),
  defineField({
    name: "internal",
    title: "Side",
    type: "reference",
    to: linkableTypes,
    options: { filter: referenceFilterByLanguage },
    hidden: ({ parent }) => (parent?.linkType ?? "internal") !== "internal",
    validation: (rule) =>
      rule.custom((value, context) => {
        const parent = context.parent as { linkType?: string } | undefined;
        if ((parent?.linkType ?? "internal") === "internal" && !value) return "Velg en side";
        return true;
      }),
  }),
  defineField({
    name: "path",
    title: "Sti",
    type: "string",
    description: "Sti uten markedsprefiks, f.eks. /kontakt. Prefikset (/no eller /is) legges til automatisk.",
    hidden: ({ parent }) => parent?.linkType !== "path",
    validation: (rule) =>
      rule.custom((value, context) => {
        const parent = context.parent as { linkType?: string } | undefined;
        if (parent?.linkType !== "path") return true;
        if (!value) return "Fyll inn en sti";
        if (!value.startsWith("/")) return "Stien må starte med /";
        return true;
      }),
  }),
  defineField({
    name: "url",
    title: "URL",
    type: "url",
    hidden: ({ parent }) => parent?.linkType !== "external",
    validation: (rule) =>
      rule.uri({ scheme: ["https", "http", "mailto", "tel"] }).custom((value, context) => {
        const parent = context.parent as { linkType?: string } | undefined;
        if (parent?.linkType === "external" && !value) return "Fyll inn en URL";
        return true;
      }),
  }),
];

/**
 * Lenke med etikett. Intern lenke peker på et dokument i samme språk, så den
 * ikke brytes når en side får ny adresse. Sti brukes for adresser som ikke
 * finnes som dokumenter.
 */
export const link = defineType({
  name: "link",
  title: "Lenke",
  type: "object",
  icon: LinkIcon,
  fields: [
    defineField({
      name: "label",
      title: "Tekst",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    ...targetFields,
  ],
  preview: {
    select: {
      title: "label",
      path: "path",
      url: "url",
      linkType: "linkType",
      internalTitle: "internal.title",
    },
    prepare({ title, path, url, linkType, internalTitle }) {
      const subtitle =
        linkType === "external" ? url : linkType === "path" ? path : internalTitle && `→ ${internalTitle}`;
      return { title, subtitle };
    },
  },
});

/** Lenke i rik tekst. Lenketeksten er den markerte teksten, så etikett trengs ikke. */
export const linkAnnotation = defineType({
  name: "linkAnnotation",
  title: "Lenke",
  type: "object",
  icon: LinkIcon,
  fields: targetFields,
});

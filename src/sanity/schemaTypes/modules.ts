import { BlockContentIcon } from "@sanity/icons/BlockContent";
import { BulbOutlineIcon } from "@sanity/icons/BulbOutline";
import { DashboardIcon } from "@sanity/icons/Dashboard";
import { DocumentTextIcon } from "@sanity/icons/DocumentText";
import { ImageIcon } from "@sanity/icons/Image";
import { StarIcon } from "@sanity/icons/Star";
import { defineArrayMember, defineField, defineType } from "sanity";

import { featureIcons } from "../../lib/featureIcons";

/**
 * Sidemoduler. Hver modul har en React-komponent med samme navn i
 * `src/components/modules/`. Se docs/07-innholdsmodell.md.
 */

const eyebrowField = defineField({
  name: "eyebrow",
  title: "Stikktittel",
  type: "string",
  description: "Kort tekst over overskriften, f.eks. «Emballasje og rådgivning».",
});

const titleField = (required = true) =>
  defineField({
    name: "title",
    title: "Overskrift",
    type: "string",
    validation: (rule) => (required ? rule.required() : rule),
  });

const countLabel = (count: unknown, singular: string, plural: string) => {
  const n = Array.isArray(count) ? count.length : 0;
  return `${n} ${n === 1 ? singular : plural}`;
};

export const hero = defineType({
  name: "hero",
  title: "Hero",
  type: "object",
  icon: StarIcon,
  fields: [
    eyebrowField,
    defineField({
      name: "title",
      title: "Overskrift",
      type: "string",
      description: "Blir sidens H1. Bruk bare én hero per side.",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "lead", title: "Ingress", type: "text", rows: 3 }),
    defineField({ name: "image", title: "Bilde", type: "imageWithAlt" }),
    defineField({
      name: "ctas",
      title: "Knapper",
      type: "array",
      of: [defineArrayMember({ type: "link" })],
      validation: (rule) => rule.max(2),
    }),
  ],
  preview: {
    select: { title: "title", media: "image" },
    prepare: ({ title, media }) => ({ title, subtitle: "Hero", media }),
  },
});

export const richText = defineType({
  name: "richText",
  title: "Rik tekst",
  type: "object",
  icon: BlockContentIcon,
  fields: [defineField({ name: "content", title: "Innhold", type: "blockContent" })],
  preview: {
    select: { content: "content" },
    prepare: ({ content }) => {
      const first = Array.isArray(content)
        ? content.find((block: { _type: string }) => block._type === "block")
        : undefined;
      const text = first?.children?.map((child: { text?: string }) => child.text).join("") ?? "";
      return { title: text || "Tom tekst", subtitle: "Rik tekst" };
    },
  },
});

export const textWithImage = defineType({
  name: "textWithImage",
  title: "Tekst med bilde",
  type: "object",
  icon: ImageIcon,
  fields: [
    eyebrowField,
    titleField(),
    defineField({ name: "body", title: "Tekst", type: "simpleBlockContent" }),
    defineField({
      name: "image",
      title: "Bilde",
      type: "imageWithAlt",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "imagePosition",
      title: "Bildeplassering",
      type: "string",
      initialValue: "right",
      options: {
        list: [
          { title: "Venstre", value: "left" },
          { title: "Høyre", value: "right" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
    }),
    defineField({ name: "cta", title: "Lenke", type: "link" }),
  ],
  preview: {
    select: { title: "title", media: "image" },
    prepare: ({ title, media }) => ({ title, subtitle: "Tekst med bilde", media }),
  },
});

export const card = defineType({
  name: "card",
  title: "Kort",
  type: "object",
  fields: [
    defineField({ name: "image", title: "Bilde", type: "imageWithAlt" }),
    titleField(),
    defineField({ name: "text", title: "Tekst", type: "text", rows: 3 }),
    defineField({ name: "link", title: "Lenke", type: "link" }),
  ],
  preview: { select: { title: "title", subtitle: "text", media: "image" } },
});

export const cardGrid = defineType({
  name: "cardGrid",
  title: "Kortrutenett",
  type: "object",
  icon: DashboardIcon,
  fields: [
    eyebrowField,
    titleField(false),
    defineField({ name: "intro", title: "Ingress", type: "text", rows: 2 }),
    defineField({
      name: "cards",
      title: "Kort",
      type: "array",
      of: [defineArrayMember({ type: "card" })],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "columns",
      title: "Kolonner på stor skjerm",
      type: "number",
      initialValue: 3,
      options: { list: [2, 3, 4], layout: "radio", direction: "horizontal" },
    }),
  ],
  preview: {
    select: { title: "title", cards: "cards" },
    prepare: ({ title, cards }) => ({
      title: title || "Kortrutenett",
      subtitle: `Kortrutenett · ${countLabel(cards, "kort", "kort")}`,
    }),
  },
});

export const featureItem = defineType({
  name: "featureItem",
  title: "Fordel",
  type: "object",
  fields: [
    defineField({
      name: "icon",
      title: "Ikon",
      type: "string",
      initialValue: "check",
      options: { list: featureIcons.map((icon) => ({ ...icon })) },
    }),
    titleField(),
    defineField({ name: "text", title: "Tekst", type: "text", rows: 2 }),
  ],
  preview: { select: { title: "title", subtitle: "text" } },
});

export const featureList = defineType({
  name: "featureList",
  title: "Fordelsliste",
  type: "object",
  icon: BulbOutlineIcon,
  fields: [
    eyebrowField,
    titleField(false),
    defineField({ name: "intro", title: "Ingress", type: "text", rows: 2 }),
    defineField({
      name: "items",
      title: "Fordeler",
      type: "array",
      of: [defineArrayMember({ type: "featureItem" })],
      validation: (rule) => rule.min(1).max(8),
    }),
  ],
  preview: {
    select: { title: "title", items: "items" },
    prepare: ({ title, items }) => ({
      title: title || "Fordelsliste",
      subtitle: `Fordelsliste · ${countLabel(items, "punkt", "punkter")}`,
    }),
  },
});

export const ctaBanner = defineType({
  name: "ctaBanner",
  title: "CTA-banner",
  type: "object",
  icon: DocumentTextIcon,
  fields: [
    titleField(),
    defineField({ name: "text", title: "Tekst", type: "text", rows: 2 }),
    defineField({ name: "cta", title: "Knapp", type: "link" }),
    defineField({ name: "image", title: "Bilde", type: "imageWithAlt" }),
    defineField({
      name: "tone",
      title: "Farge",
      type: "string",
      initialValue: "blue",
      options: {
        list: [
          { title: "Blå", value: "blue" },
          { title: "Grønn", value: "green" },
          { title: "Lys", value: "light" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
    }),
  ],
  preview: {
    select: { title: "title", media: "image" },
    prepare: ({ title, media }) => ({ title, subtitle: "CTA-banner", media }),
  },
});

export const moduleTypes = [hero, richText, textWithImage, cardGrid, featureList, ctaBanner];

/** Felt med moduler, brukt av `page` og `frontPage`. */
export const modulesField = defineField({
  name: "modules",
  title: "Moduler",
  type: "array",
  group: "content",
  of: moduleTypes.map((module) => defineArrayMember({ type: module.name })),
  options: {
    insertMenu: {
      views: [{ name: "grid" }, { name: "list" }],
    },
  },
});

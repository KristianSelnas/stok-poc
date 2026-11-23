import { BlockContentIcon } from "@sanity/icons/BlockContent";
import { BulbOutlineIcon } from "@sanity/icons/BulbOutline";
import { DashboardIcon } from "@sanity/icons/Dashboard";
import { DocumentTextIcon } from "@sanity/icons/DocumentText";
import { ImageIcon } from "@sanity/icons/Image";
import { CommentIcon } from "@sanity/icons/Comment";
import { PackageIcon } from "@sanity/icons/Package";
import { PinIcon } from "@sanity/icons/Pin";
import { SearchIcon } from "@sanity/icons/Search";
import { StarIcon } from "@sanity/icons/Star";
import { StarFilledIcon } from "@sanity/icons/StarFilled";
import { UsersIcon } from "@sanity/icons/Users";
import { defineArrayMember, defineField, defineType } from "sanity";

import { featureIcons } from "../../lib/featureIcons";
import { referenceFilterByLanguage } from "../lib/referenceFilter";

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

type ReferenceListOptions = {
  description?: string;
  min?: number;
  max?: number;
  /** Navnet på et felt i samme objekt som må ha denne verdien for at listen vises. */
  showWhen?: { field: string; value: string; default?: string };
};

/** Liste med referanser til dokumenter i samme språk. */
const languageReferences = (
  name: string,
  title: string,
  type: string,
  { description, min, max, showWhen }: ReferenceListOptions = {},
) =>
  defineField({
    name,
    title,
    type: "array",
    description,
    of: [
      defineArrayMember({
        type: "reference",
        to: [{ type }],
        options: { filter: referenceFilterByLanguage },
      }),
    ],
    hidden: showWhen
      ? ({ parent }) =>
          ((parent as Record<string, string> | undefined)?.[showWhen.field] ?? showWhen.default) !==
          showWhen.value
      : undefined,
    validation: (rule) => {
      let result = rule.unique();
      if (min !== undefined) result = result.min(min);
      if (max !== undefined) result = result.max(max);
      return result;
    },
  });

export const productGrid = defineType({
  name: "productGrid",
  title: "Produktutvalg",
  type: "object",
  icon: PackageIcon,
  fields: [
    eyebrowField,
    titleField(false),
    defineField({ name: "intro", title: "Ingress", type: "text", rows: 2 }),
    defineField({
      name: "source",
      title: "Utvalg",
      type: "string",
      initialValue: "manual",
      options: {
        list: [
          { title: "Velg produkter", value: "manual" },
          { title: "Produkter i en gruppe", value: "group" },
          { title: "Produkter i en bransje", value: "industry" },
        ],
        layout: "radio",
      },
    }),
    languageReferences("products", "Produkter", "product", {
      showWhen: { field: "source", value: "manual", default: "manual" },
    }),
    defineField({
      name: "productGroup",
      title: "Produktgruppe",
      type: "reference",
      to: [{ type: "productGroup" }],
      options: { filter: referenceFilterByLanguage },
      hidden: ({ parent }) => parent?.source !== "group",
    }),
    defineField({
      name: "industry",
      title: "Bransje",
      type: "reference",
      to: [{ type: "industry" }],
      options: { filter: referenceFilterByLanguage },
      hidden: ({ parent }) => parent?.source !== "industry",
    }),
    defineField({
      name: "limit",
      title: "Maks antall",
      type: "number",
      initialValue: 4,
      validation: (rule) => rule.min(1).max(12),
    }),
    defineField({ name: "cta", title: "Lenke under utvalget", type: "link" }),
  ],
  preview: {
    select: { title: "title", source: "source" },
    prepare: ({ title, source }) => ({
      title: title || "Produktutvalg",
      subtitle: `Produktutvalg · ${source === "group" ? "gruppe" : source === "industry" ? "bransje" : "manuelt"}`,
    }),
  },
});

export const productCatalog = defineType({
  name: "productCatalog",
  title: "Produktkatalog",
  type: "object",
  icon: SearchIcon,
  description: "Alle produkter med filtre for gruppe, bransje og materiale.",
  fields: [titleField(false), defineField({ name: "intro", title: "Ingress", type: "text", rows: 2 })],
  preview: {
    select: { title: "title" },
    prepare: ({ title }) => ({ title: title || "Produktkatalog", subtitle: "Produktkatalog med filtre" }),
  },
});

export const newsList = defineType({
  name: "newsList",
  title: "Nyhetsliste",
  type: "object",
  icon: BulbOutlineIcon,
  fields: [
    eyebrowField,
    titleField(false),
    defineField({
      name: "limit",
      title: "Antall",
      type: "number",
      description: "Står feltet tomt, vises alle nyheter.",
      validation: (rule) => rule.min(1).max(50),
    }),
    defineField({
      name: "category",
      title: "Bare kategori",
      type: "reference",
      to: [{ type: "newsCategory" }],
      options: { filter: referenceFilterByLanguage },
    }),
    defineField({ name: "cta", title: "Lenke under listen", type: "link" }),
  ],
  preview: {
    select: { title: "title", limit: "limit" },
    prepare: ({ title, limit }) => ({
      title: title || "Nyhetsliste",
      subtitle: `Nyhetsliste · ${limit ? `${limit} siste` : "alle"}`,
    }),
  },
});

export const contactPeople = defineType({
  name: "contactPeople",
  title: "Kontaktpersoner",
  type: "object",
  icon: UsersIcon,
  fields: [
    eyebrowField,
    titleField(false),
    defineField({ name: "intro", title: "Ingress", type: "text", rows: 2 }),
    defineField({
      name: "showCustomerService",
      title: "Vis kundeservice",
      type: "boolean",
      description: "Viser telefon og e-post fra Innstillinger øverst.",
      initialValue: true,
    }),
    languageReferences("departments", "Avdelinger", "department", {
      description: "Står listen tom, vises alle avdelinger med personer.",
    }),
    languageReferences("people", "Utvalgte personer", "person", {
      description: "Velg personer for å vise bare dem, f.eks. på en bransjeside. Overstyrer avdelinger.",
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare: ({ title }) => ({ title: title || "Kontaktpersoner", subtitle: "Kontaktpersoner" }),
  },
});

export const locations = defineType({
  name: "locations",
  title: "Lokasjoner",
  type: "object",
  icon: PinIcon,
  fields: [
    eyebrowField,
    titleField(false),
    languageReferences("items", "Lokasjoner", "location", {
      description: "Står listen tom, vises alle lokasjoner.",
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare: ({ title }) => ({ title: title || "Lokasjoner", subtitle: "Lokasjoner" }),
  },
});

export const testimonials = defineType({
  name: "testimonials",
  title: "Kundesitater",
  type: "object",
  icon: CommentIcon,
  fields: [
    eyebrowField,
    titleField(false),
    languageReferences("items", "Sitater", "testimonial", { min: 1, max: 6 }),
  ],
  preview: {
    select: { title: "title", items: "items" },
    prepare: ({ title, items }) => ({
      title: title || "Kundesitater",
      subtitle: `Kundesitater · ${countLabel(items, "sitat", "sitater")}`,
    }),
  },
});

export const logoRow = defineType({
  name: "logoRow",
  title: "Logorad",
  type: "object",
  icon: StarFilledIcon,
  fields: [
    eyebrowField,
    titleField(false),
    defineField({ name: "intro", title: "Ingress", type: "text", rows: 2 }),
    languageReferences("certificates", "Sertifikater", "certificate"),
  ],
  preview: {
    select: { title: "title" },
    prepare: ({ title }) => ({ title: title || "Logorad", subtitle: "Sertifikater og logoer" }),
  },
});

export const moduleTypes = [
  hero,
  richText,
  textWithImage,
  cardGrid,
  featureList,
  ctaBanner,
  productGrid,
  productCatalog,
  newsList,
  contactPeople,
  locations,
  testimonials,
  logoRow,
];

/** Felt med moduler, brukt av `page`, `frontPage` og `industry`. */
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

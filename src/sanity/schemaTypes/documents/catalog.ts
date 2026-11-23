import { PackageIcon } from "@sanity/icons/Package";
import { TagIcon } from "@sanity/icons/Tag";
import { TagsIcon } from "@sanity/icons/Tags";
import { defineArrayMember, defineField, defineType } from "sanity";

import { referenceFilterByLanguage } from "../../lib/referenceFilter";
import { languageField, seoField, slugField } from "../fields";

const languageReference = (type: string) =>
  defineArrayMember({
    type: "reference",
    to: [{ type }],
    options: { filter: referenceFilterByLanguage },
  });

/** Produktgruppe, f.eks. «Eske» eller «Brett». Brukes i filteret i katalogen. */
export const productGroup = defineType({
  name: "productGroup",
  title: "Produktgruppe",
  type: "document",
  icon: TagsIcon,
  fields: [
    languageField,
    defineField({ name: "title", title: "Navn", type: "string", validation: (rule) => rule.required() }),
    slugField("productGroup"),
    defineField({ name: "description", title: "Beskrivelse", type: "text", rows: 3 }),
    defineField({
      name: "order",
      title: "Rekkefølge",
      type: "number",
      description: "Lavere tall vises først i filteret.",
    }),
  ],
  orderings: [{ title: "Rekkefølge", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title", subtitle: "slug.current" } },
});

/** Materiale, f.eks. «EPS» eller «Kartong». Brukes i filteret i katalogen. */
export const material = defineType({
  name: "material",
  title: "Materiale",
  type: "document",
  icon: TagIcon,
  fields: [
    languageField,
    defineField({ name: "title", title: "Navn", type: "string", validation: (rule) => rule.required() }),
    slugField("material"),
  ],
  preview: { select: { title: "title", subtitle: "slug.current" } },
});

export const productProperty = defineType({
  name: "productProperty",
  title: "Egenskap",
  type: "object",
  fields: [
    defineField({
      name: "key",
      title: "Egenskap",
      type: "string",
      description: "F.eks. «Ytre mål» eller «Volum».",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "value", title: "Verdi", type: "string", validation: (rule) => rule.required() }),
  ],
  preview: { select: { title: "key", subtitle: "value" } },
});

/** Produkt i katalogen. Adresse: /no/produkter/<slug>. */
export const product = defineType({
  name: "product",
  title: "Produkt",
  type: "document",
  icon: PackageIcon,
  groups: [
    { name: "content", title: "Innhold", default: true },
    { name: "details", title: "Detaljer" },
    { name: "relations", title: "Kategorier" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    languageField,
    defineField({
      name: "title",
      title: "Navn",
      type: "string",
      group: "content",
      validation: (rule) => rule.required(),
    }),
    slugField("product", { group: "content" }),
    defineField({
      name: "shortDescription",
      title: "Kort beskrivelse",
      type: "text",
      rows: 2,
      group: "content",
      description: "Vises på produktkort og øverst på produktsiden.",
      validation: (rule) => rule.max(240).warning("Hold den kort beskrivelsen under 240 tegn"),
    }),
    defineField({
      name: "images",
      title: "Bilder",
      type: "array",
      group: "content",
      description: "Det første bildet er hovedbildet.",
      of: [defineArrayMember({ type: "imageWithAlt" })],
    }),
    defineField({ name: "description", title: "Beskrivelse", type: "blockContent", group: "content" }),
    defineField({
      name: "properties",
      title: "Egenskaper",
      type: "array",
      group: "details",
      description: "Tekniske egenskaper, vises som tabell.",
      of: [defineArrayMember({ type: "productProperty" })],
    }),
    defineField({
      name: "datasheet",
      title: "Datablad",
      type: "file",
      group: "details",
      options: { accept: "application/pdf" },
    }),
    defineField({
      name: "productGroup",
      title: "Produktgruppe",
      type: "reference",
      group: "relations",
      to: [{ type: "productGroup" }],
      options: { filter: referenceFilterByLanguage },
    }),
    defineField({
      name: "industries",
      title: "Bransjer",
      type: "array",
      group: "relations",
      of: [languageReference("industry")],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: "materials",
      title: "Materialer",
      type: "array",
      group: "relations",
      of: [languageReference("material")],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: "relatedProducts",
      title: "Relaterte produkter",
      type: "array",
      group: "relations",
      description: "Står listen tom, vises andre produkter i samme gruppe.",
      of: [languageReference("product")],
      validation: (rule) => rule.unique().max(4),
    }),
    seoField,
  ],
  preview: {
    select: { title: "title", group: "productGroup.title", media: "images.0" },
    prepare: ({ title, group, media }) => ({ title, subtitle: group, media }),
  },
});

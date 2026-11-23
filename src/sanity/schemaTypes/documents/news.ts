import { BulbOutlineIcon } from "@sanity/icons/BulbOutline";
import { TagIcon } from "@sanity/icons/Tag";
import { defineField, defineType } from "sanity";

import { referenceFilterByLanguage } from "../../lib/referenceFilter";
import { contentGroups, languageField, seoField, slugField } from "../fields";

export const newsCategory = defineType({
  name: "newsCategory",
  title: "Nyhetskategori",
  type: "document",
  icon: TagIcon,
  fields: [
    languageField,
    defineField({ name: "title", title: "Navn", type: "string", validation: (rule) => rule.required() }),
    slugField("newsCategory"),
  ],
  preview: { select: { title: "title" } },
});

/** Nyhetsartikkel. Adresse: /no/nyheter/<slug>. */
export const newsArticle = defineType({
  name: "newsArticle",
  title: "Nyhet",
  type: "document",
  icon: BulbOutlineIcon,
  groups: contentGroups,
  fields: [
    languageField,
    defineField({
      name: "title",
      title: "Tittel",
      type: "string",
      group: "content",
      validation: (rule) => rule.required(),
    }),
    slugField("newsArticle", { group: "content" }),
    defineField({
      name: "publishedAt",
      title: "Publiseringsdato",
      type: "date",
      group: "content",
      initialValue: () => new Date().toISOString().slice(0, 10),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Kategori",
      type: "reference",
      group: "content",
      to: [{ type: "newsCategory" }],
      options: { filter: referenceFilterByLanguage },
    }),
    defineField({
      name: "excerpt",
      title: "Ingress",
      type: "text",
      rows: 3,
      group: "content",
      description: "Vises på nyhetskort og øverst i artikkelen.",
      validation: (rule) => rule.max(300).warning("Hold ingressen under 300 tegn"),
    }),
    defineField({ name: "image", title: "Bilde", type: "imageWithAlt", group: "content" }),
    defineField({ name: "body", title: "Brødtekst", type: "blockContent", group: "content" }),
    seoField,
  ],
  orderings: [
    { title: "Nyeste først", name: "publishedAtDesc", by: [{ field: "publishedAt", direction: "desc" }] },
  ],
  preview: {
    select: { title: "title", date: "publishedAt", media: "image" },
    prepare: ({ title, date, media }) => ({ title, subtitle: date, media }),
  },
});

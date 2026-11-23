import { DocumentIcon } from "@sanity/icons/Document";
import { defineField, defineType } from "sanity";

import { contentGroups, languageField, seoField, slugField } from "../fields";
import { modulesField } from "../modules";

export const page = defineType({
  name: "page",
  title: "Side",
  type: "document",
  icon: DocumentIcon,
  groups: contentGroups,
  fields: [
    languageField,
    defineField({
      name: "title",
      title: "Tittel",
      type: "string",
      group: "content",
      description: "Brukes i menyer, brødsmuler og som standard metatittel.",
      validation: (rule) => rule.required(),
    }),
    slugField("page", { nested: true, group: "content" }),
    modulesField,
    seoField,
  ],
  preview: {
    select: { title: "title", slug: "slug.current", language: "language" },
    prepare: ({ title, slug, language }) => ({
      title,
      subtitle: slug ? `/${language === "is" ? "is" : "no"}/${slug}` : "Mangler adresse",
    }),
  },
});

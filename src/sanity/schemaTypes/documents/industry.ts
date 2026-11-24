import { CaseIcon } from "@sanity/icons/Case";
import { defineField, defineType } from "sanity";

import { contentGroups, languageField, seoField, slugField } from "../fields";
import { modulesField } from "../modules";

/** Bransje, f.eks. «Fisk og sjømat». Adresse: /no/bransjer/<slug>. */
export const industry = defineType({
  name: "industry",
  title: "Bransje",
  type: "document",
  icon: CaseIcon,
  groups: contentGroups,
  fields: [
    languageField,
    defineField({
      name: "title",
      title: "Navn",
      type: "string",
      group: "content",
      validation: (rule) => rule.required(),
    }),
    slugField("industry", { group: "content" }),
    defineField({
      name: "heroTitle",
      title: "Overskrift",
      type: "string",
      group: "content",
      description: "Sidens H1. Står tom: navnet brukes.",
    }),
    defineField({
      name: "lead",
      title: "Ingress",
      type: "text",
      rows: 3,
      group: "content",
      description: "Vises øverst på siden og på bransjekort.",
    }),
    defineField({ name: "image", title: "Bilde", type: "imageWithAlt", group: "content" }),
    modulesField,
    seoField,
  ],
  preview: {
    select: { title: "title", subtitle: "lead", media: "image" },
  },
});

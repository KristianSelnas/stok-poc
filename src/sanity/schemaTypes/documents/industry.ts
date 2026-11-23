import { CaseIcon } from "@sanity/icons/Case";
import { defineArrayMember, defineField, defineType } from "sanity";

import { referenceFilterByLanguage } from "../../lib/referenceFilter";
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
    defineField({
      name: "featuredProducts",
      title: "Utvalgte produkter",
      type: "array",
      group: "content",
      description: "Vises nederst på siden. Står listen tom, vises produkter som er knyttet til bransjen.",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "product" }],
          options: { filter: referenceFilterByLanguage },
        }),
      ],
      validation: (rule) => rule.unique().max(8),
    }),
    seoField,
  ],
  preview: {
    select: { title: "title", subtitle: "lead", media: "image" },
  },
});

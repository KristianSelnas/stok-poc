import { HomeIcon } from "@sanity/icons/Home";
import { defineField, defineType } from "sanity";

import { modulesField } from "../modules";

/** Forsiden. Ett dokument per marked. */
export const frontPage = defineType({
  name: "frontPage",
  title: "Forside",
  type: "document",
  icon: HomeIcon,
  groups: [
    { name: "content", title: "Innhold", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "language",
      type: "string",
      readOnly: true,
      hidden: true,
    }),
    modulesField,
    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
  ],
  preview: {
    select: { language: "language" },
    prepare: ({ language }) => ({ title: "Forside", subtitle: language }),
  },
});

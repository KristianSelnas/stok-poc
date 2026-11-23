import { MenuIcon } from "@sanity/icons/Menu";
import { defineArrayMember, defineField, defineType } from "sanity";

/** Hovedmeny og bunntekst. Ett dokument per marked. */
export const navigation = defineType({
  name: "navigation",
  title: "Navigasjon",
  type: "document",
  icon: MenuIcon,
  groups: [
    { name: "header", title: "Header", default: true },
    { name: "footer", title: "Bunntekst" },
  ],
  fields: [
    defineField({
      name: "language",
      type: "string",
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: "mainMenu",
      title: "Hovedmeny",
      type: "array",
      group: "header",
      of: [defineArrayMember({ type: "menuItem" })],
      validation: (rule) => rule.max(6).warning("Mer enn seks punkter blir trangt i menyen"),
    }),
    defineField({
      name: "headerCta",
      title: "Knapp i header",
      type: "link",
      group: "header",
      description: "Vises som grønn knapp til høyre, f.eks. «Kontakt oss».",
    }),
    defineField({
      name: "footerGroups",
      title: "Lenkegrupper i bunnteksten",
      type: "array",
      group: "footer",
      of: [defineArrayMember({ type: "linkGroup" })],
      validation: (rule) => rule.max(3),
    }),
    defineField({
      name: "legalLinks",
      title: "Juridiske lenker",
      type: "array",
      group: "footer",
      description: "Personvern, informasjonskapsler, åpenhetsloven osv.",
      of: [defineArrayMember({ type: "link" })],
    }),
  ],
  preview: {
    select: { language: "language" },
    prepare({ language }) {
      return { title: "Navigasjon", subtitle: language };
    },
  },
});

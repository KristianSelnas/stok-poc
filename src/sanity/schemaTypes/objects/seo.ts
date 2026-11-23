import { SearchIcon } from "@sanity/icons/Search";
import { defineField, defineType } from "sanity";

export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  icon: SearchIcon,
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: "title",
      title: "Metatittel",
      type: "string",
      description: "Brukes i fanen og i søkeresultater. Står tom: sidens tittel brukes.",
      validation: (rule) => rule.max(60).warning("Hold metatittelen under 60 tegn"),
    }),
    defineField({
      name: "description",
      title: "Metabeskrivelse",
      type: "text",
      rows: 3,
      validation: (rule) => rule.max(160).warning("Hold metabeskrivelsen under 160 tegn"),
    }),
    defineField({
      name: "image",
      title: "Delingsbilde",
      type: "image",
      description: "Vises når siden deles i sosiale medier. Anbefalt størrelse: 1200 × 630 piksler.",
    }),
    defineField({
      name: "noIndex",
      title: "Skjul fra søkemotorer",
      type: "boolean",
      initialValue: false,
    }),
  ],
});

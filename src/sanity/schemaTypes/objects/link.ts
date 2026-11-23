import { LinkIcon } from "@sanity/icons/Link";
import { defineField, defineType } from "sanity";

/**
 * Lenke med etikett. I fase 1 finnes bare sti og ekstern URL.
 * Interne referanser til dokumenter kommer i fase 2, når sidetypene finnes.
 */
export const link = defineType({
  name: "link",
  title: "Lenke",
  type: "object",
  icon: LinkIcon,
  fields: [
    defineField({
      name: "label",
      title: "Tekst",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "linkType",
      title: "Type",
      type: "string",
      initialValue: "path",
      options: {
        list: [
          { title: "Side på nettstedet", value: "path" },
          { title: "Ekstern lenke", value: "external" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
    }),
    defineField({
      name: "path",
      title: "Sti",
      type: "string",
      description:
        "Sti uten markedsprefiks, f.eks. /kontakt. Prefikset (/no eller /is) legges til automatisk.",
      hidden: ({ parent }) => parent?.linkType === "external",
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { linkType?: string } | undefined;
          if (parent?.linkType === "external") return true;
          if (!value) return "Fyll inn en sti";
          if (!value.startsWith("/")) return "Stien må starte med /";
          return true;
        }),
    }),
    defineField({
      name: "url",
      title: "URL",
      type: "url",
      hidden: ({ parent }) => parent?.linkType !== "external",
      validation: (rule) =>
        rule.uri({ scheme: ["https", "http", "mailto", "tel"] }).custom((value, context) => {
          const parent = context.parent as { linkType?: string } | undefined;
          if (parent?.linkType === "external" && !value) return "Fyll inn en URL";
          return true;
        }),
    }),
  ],
  preview: {
    select: { title: "label", path: "path", url: "url", linkType: "linkType" },
    prepare({ title, path, url, linkType }) {
      return { title, subtitle: linkType === "external" ? url : path };
    },
  },
});

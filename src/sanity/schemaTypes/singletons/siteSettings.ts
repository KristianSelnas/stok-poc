import { CogIcon } from "@sanity/icons/Cog";
import { defineArrayMember, defineField, defineType } from "sanity";

/** Innstillinger for nettstedet. Ett dokument per marked. */
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Innstillinger",
  type: "document",
  icon: CogIcon,
  groups: [
    { name: "general", title: "Generelt", default: true },
    { name: "contact", title: "Kontaktinfo" },
  ],
  fields: [
    defineField({
      name: "language",
      type: "string",
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: "title",
      title: "Nettstedets navn",
      type: "string",
      group: "general",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Standard metabeskrivelse",
      type: "text",
      rows: 3,
      group: "general",
      description: "Brukes når en side mangler egen beskrivelse.",
      validation: (rule) => rule.max(160).warning("Hold beskrivelsen under 160 tegn"),
    }),
    defineField({
      name: "companyName",
      title: "Firmanavn",
      type: "string",
      group: "contact",
    }),
    defineField({
      name: "orgNumber",
      title: "Organisasjonsnummer",
      type: "string",
      group: "contact",
    }),
    defineField({
      name: "address",
      title: "Adresse",
      type: "text",
      rows: 3,
      group: "contact",
    }),
    defineField({
      name: "phone",
      title: "Telefon",
      type: "string",
      group: "contact",
    }),
    defineField({
      name: "email",
      title: "E-post",
      type: "string",
      group: "contact",
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: "socialLinks",
      title: "Sosiale medier",
      type: "array",
      group: "contact",
      of: [defineArrayMember({ type: "socialLink" })],
    }),
  ],
  preview: {
    select: { title: "title", language: "language" },
    prepare({ title, language }) {
      return { title: title || "Innstillinger", subtitle: language };
    },
  },
});

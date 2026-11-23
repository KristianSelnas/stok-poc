import { DocumentIcon } from "@sanity/icons/Document";
import { defineField, defineType, type SlugValidationContext } from "sanity";

import { slugify } from "../../../lib/slugify";
import { modulesField } from "../modules";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/;

/** Slug må være unik innenfor samme språk. Norsk og islandsk side kan dele adresse. */
async function isUniqueInLanguage(slug: string, context: SlugValidationContext) {
  const { document, getClient } = context;
  const client = getClient({ apiVersion: "2026-11-01" });
  const id = document?._id.replace(/^drafts\./, "");
  return client.fetch<boolean>(
    `!defined(*[_type == "page" && slug.current == $slug && language == $language && !(_id in [$draft, $published])][0]._id)`,
    { slug, language: document?.language ?? null, draft: `drafts.${id}`, published: id },
  );
}

export const page = defineType({
  name: "page",
  title: "Side",
  type: "document",
  icon: DocumentIcon,
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
    defineField({
      name: "title",
      title: "Tittel",
      type: "string",
      group: "content",
      description: "Brukes i menyer, brødsmuler og som standard metatittel.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Adresse",
      type: "slug",
      group: "content",
      description:
        "Adressen etter markedsprefikset, f.eks. «om-oss» eller «om-oss/karriere». Bruk / for undersider.",
      options: { source: "title", slugify, isUnique: isUniqueInLanguage },
      validation: (rule) =>
        rule.required().custom((value) => {
          if (!value?.current) return true;
          return SLUG_PATTERN.test(value.current)
            ? true
            : "Bruk små bokstaver a–z, tall, bindestrek og / mellom nivåer";
        }),
    }),
    modulesField,
    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
  ],
  preview: {
    select: { title: "title", slug: "slug.current", language: "language" },
    prepare: ({ title, slug, language }) => ({
      title,
      subtitle: slug ? `/${language === "is" ? "is" : "no"}/${slug}` : "Mangler adresse",
    }),
  },
});

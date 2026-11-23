import { defineField, type SlugValidationContext } from "sanity";

import { slugify } from "../../lib/slugify";

/**
 * Felles felt for dokumenttyper som er knyttet til ett språk/marked.
 * `language` fylles ut av språkpluginen og vises ikke for redaktøren.
 */
export const languageField = defineField({
  name: "language",
  type: "string",
  readOnly: true,
  hidden: true,
});

const SINGLE_SEGMENT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MULTI_SEGMENT = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/;

/** Sjekker at slugen er unik blant dokumenter av samme type i samme språk. */
function isUniqueInLanguage(type: string) {
  return async (slug: string, context: SlugValidationContext) => {
    const { document, getClient } = context;
    const client = getClient({ apiVersion: "2026-11-01" });
    const id = document?._id.replace(/^drafts\./, "");
    return client.fetch<boolean>(
      `!defined(*[_type == $type && slug.current == $slug && language == $language && !(_id in [$draft, $published])][0]._id)`,
      { type, slug, language: document?.language ?? null, draft: `drafts.${id}`, published: id },
    );
  };
}

/**
 * Adressefelt. Sider kan ha undersider (`om-oss/karriere`), andre typer har
 * én del etter prefikset (`/bransjer/fisk-og-sjomat`).
 */
export function slugField(
  type: string,
  { source = "title", nested = false, group }: { source?: string; nested?: boolean; group?: string } = {},
) {
  const pattern = nested ? MULTI_SEGMENT : SINGLE_SEGMENT;
  return defineField({
    name: "slug",
    title: "Adresse",
    type: "slug",
    ...(group ? { group } : {}),
    description: nested
      ? "Adressen etter markedsprefikset, f.eks. «om-oss» eller «om-oss/karriere». Bruk / for undersider."
      : "Siste del av adressen, f.eks. «fisk-og-sjomat».",
    options: { source, slugify, isUnique: isUniqueInLanguage(type) },
    validation: (rule) =>
      rule.required().custom((value) => {
        if (!value?.current) return true;
        if (pattern.test(value.current)) return true;
        return nested
          ? "Bruk små bokstaver a–z, tall, bindestrek og / mellom nivåer"
          : "Bruk små bokstaver a–z, tall og bindestrek";
      }),
  });
}

export const seoField = defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" });

export const contentGroups = [
  { name: "content", title: "Innhold", default: true },
  { name: "seo", title: "SEO" },
];

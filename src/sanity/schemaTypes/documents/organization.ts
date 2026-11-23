import { StarFilledIcon } from "@sanity/icons/StarFilled";
import { CommentIcon } from "@sanity/icons/Comment";
import { PinIcon } from "@sanity/icons/Pin";
import { UserIcon } from "@sanity/icons/User";
import { UsersIcon } from "@sanity/icons/Users";
import { defineField, defineType } from "sanity";

import { referenceFilterByLanguage } from "../../lib/referenceFilter";
import { languageField } from "../fields";

/** Avdeling, f.eks. «Salg». Kontaktpersoner grupperes etter avdeling. */
export const department = defineType({
  name: "department",
  title: "Avdeling",
  type: "document",
  icon: UsersIcon,
  fields: [
    languageField,
    defineField({ name: "title", title: "Navn", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "order",
      title: "Rekkefølge",
      type: "number",
      description: "Lavere tall vises først på kontaktsiden.",
    }),
  ],
  orderings: [{ title: "Rekkefølge", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "title", order: "order" },
    prepare: ({ title, order }) => ({ title, subtitle: order != null ? `#${order}` : undefined }),
  },
});

export const person = defineType({
  name: "person",
  title: "Kontaktperson",
  type: "document",
  icon: UserIcon,
  fields: [
    languageField,
    defineField({ name: "name", title: "Navn", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "role", title: "Stilling", type: "string" }),
    defineField({ name: "image", title: "Bilde", type: "imageWithAlt" }),
    defineField({ name: "phone", title: "Telefon", type: "string" }),
    defineField({ name: "email", title: "E-post", type: "string", validation: (rule) => rule.email() }),
    defineField({
      name: "department",
      title: "Avdeling",
      type: "reference",
      to: [{ type: "department" }],
      options: { filter: referenceFilterByLanguage },
    }),
    defineField({
      name: "area",
      title: "Område",
      type: "string",
      description: "Geografisk område personen dekker, f.eks. «Nord-Norge». Valgfritt.",
    }),
    defineField({
      name: "order",
      title: "Rekkefølge",
      type: "number",
      description: "Lavere tall vises først innenfor avdelingen.",
    }),
  ],
  orderings: [{ title: "Navn", name: "name", by: [{ field: "name", direction: "asc" }] }],
  preview: {
    select: { title: "name", role: "role", department: "department.title", media: "image" },
    prepare: ({ title, role, department, media }) => ({
      title,
      subtitle: [role, department].filter(Boolean).join(" · "),
      media,
    }),
  },
});

export const location = defineType({
  name: "location",
  title: "Lokasjon",
  type: "document",
  icon: PinIcon,
  fields: [
    languageField,
    defineField({
      name: "title",
      title: "Navn",
      type: "string",
      description: "F.eks. «Hovedkontor» eller «Lager Ålesund».",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "street", title: "Gateadresse", type: "string" }),
    defineField({ name: "postalCode", title: "Postnummer", type: "string" }),
    defineField({ name: "city", title: "Sted", type: "string" }),
    defineField({ name: "phone", title: "Telefon", type: "string" }),
    defineField({ name: "email", title: "E-post", type: "string", validation: (rule) => rule.email() }),
    defineField({ name: "openingHours", title: "Åpningstider", type: "text", rows: 2 }),
    defineField({ name: "position", title: "Kartposisjon", type: "geopoint" }),
  ],
  preview: {
    select: { title: "title", city: "city", street: "street" },
    prepare: ({ title, city, street }) => ({ title, subtitle: [street, city].filter(Boolean).join(", ") }),
  },
});

export const testimonial = defineType({
  name: "testimonial",
  title: "Kundesitat",
  type: "document",
  icon: CommentIcon,
  fields: [
    languageField,
    defineField({
      name: "quote",
      title: "Sitat",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "name", title: "Navn", type: "string" }),
    defineField({ name: "role", title: "Stilling", type: "string" }),
    defineField({ name: "company", title: "Firma", type: "string" }),
    defineField({ name: "logo", title: "Logo", type: "imageWithAlt" }),
  ],
  preview: {
    select: { title: "company", subtitle: "quote", media: "logo" },
  },
});

export const certificate = defineType({
  name: "certificate",
  title: "Sertifikat",
  type: "document",
  icon: StarFilledIcon,
  fields: [
    languageField,
    defineField({
      name: "title",
      title: "Navn",
      type: "string",
      description: "F.eks. «FSC» eller «ISO 14001».",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "description", title: "Beskrivelse", type: "text", rows: 3 }),
    defineField({ name: "logo", title: "Logo", type: "imageWithAlt" }),
    defineField({ name: "url", title: "Lenke til sertifikat", type: "url" }),
    defineField({
      name: "file",
      title: "Sertifikat (PDF)",
      type: "file",
      options: { accept: "application/pdf" },
    }),
  ],
  preview: { select: { title: "title", subtitle: "description", media: "logo" } },
});

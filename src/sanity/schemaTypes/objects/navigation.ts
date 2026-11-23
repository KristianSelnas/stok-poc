import { MenuIcon } from "@sanity/icons/Menu";
import { ThListIcon } from "@sanity/icons/ThList";
import { defineArrayMember, defineField, defineType } from "sanity";

/** Gruppe med lenker i mega-menyen eller bunnteksten. */
export const linkGroup = defineType({
  name: "linkGroup",
  title: "Lenkegruppe",
  type: "object",
  icon: ThListIcon,
  fields: [
    defineField({
      name: "title",
      title: "Overskrift",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "links",
      title: "Lenker",
      type: "array",
      of: [defineArrayMember({ type: "link" })],
      validation: (rule) => rule.min(1),
    }),
  ],
  preview: {
    select: { title: "title", links: "links" },
    prepare({ title, links }) {
      const count = Array.isArray(links) ? links.length : 0;
      return { title, subtitle: `${count} lenker` };
    },
  },
});

/**
 * Punkt i hovedmenyen. Et punkt med grupper åpner mega-menyen.
 * Et punkt uten grupper er en vanlig lenke.
 */
export const menuItem = defineType({
  name: "menuItem",
  title: "Menypunkt",
  type: "object",
  icon: MenuIcon,
  fields: [
    defineField({
      name: "label",
      title: "Tekst",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "link",
      title: "Lenke",
      type: "link",
      description: "Hovedside for menypunktet. Påkrevd hvis punktet ikke har grupper.",
    }),
    defineField({
      name: "groups",
      title: "Grupper i mega-menyen",
      type: "array",
      of: [defineArrayMember({ type: "linkGroup" })],
    }),
  ],
  validation: (rule) =>
    rule.custom((value) => {
      const item = value as { link?: unknown; groups?: unknown[] } | undefined;
      if (!item?.link && !item?.groups?.length) {
        return "Menypunktet trenger en lenke eller minst én gruppe";
      }
      return true;
    }),
  preview: {
    select: { title: "label", groups: "groups" },
    prepare({ title, groups }) {
      const count = Array.isArray(groups) ? groups.length : 0;
      return { title, subtitle: count ? `Mega-meny med ${count} grupper` : "Lenke" };
    },
  },
});

export const socialLink = defineType({
  name: "socialLink",
  title: "Sosialt medium",
  type: "object",
  fields: [
    defineField({
      name: "platform",
      title: "Plattform",
      type: "string",
      options: {
        list: [
          { title: "LinkedIn", value: "linkedin" },
          { title: "Facebook", value: "facebook" },
          { title: "Instagram", value: "instagram" },
          { title: "YouTube", value: "youtube" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "url",
      title: "URL",
      type: "url",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: { select: { title: "platform", subtitle: "url" } },
});

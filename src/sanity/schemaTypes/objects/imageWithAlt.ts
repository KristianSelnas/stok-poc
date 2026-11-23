import { ImageIcon } from "@sanity/icons/Image";
import { defineField, defineType } from "sanity";

/** Bilde med påkrevd alternativ tekst, hotspot og beskjæring. */
export const imageWithAlt = defineType({
  name: "imageWithAlt",
  title: "Bilde",
  type: "image",
  icon: ImageIcon,
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "Alternativ tekst",
      type: "string",
      description:
        "Beskriv hva bildet viser for dem som ikke ser det. La feltet stå tomt bare hvis bildet er pynt.",
      validation: (rule) =>
        rule
          .custom((value, context) => {
            const parent = context.parent as { asset?: unknown } | undefined;
            if (parent?.asset && !value) return "Legg inn alternativ tekst";
            return true;
          })
          .warning(),
    }),
  ],
});

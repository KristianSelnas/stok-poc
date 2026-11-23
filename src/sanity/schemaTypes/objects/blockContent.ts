import { defineArrayMember, defineType } from "sanity";

/** Rik tekst med overskrifter, lister, lenker og bilder. */
export const blockContent = defineType({
  name: "blockContent",
  title: "Rik tekst",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "Overskrift 2", value: "h2" },
        { title: "Overskrift 3", value: "h3" },
        { title: "Ingress", value: "lead" },
        { title: "Sitat", value: "blockquote" },
      ],
      lists: [
        { title: "Punktliste", value: "bullet" },
        { title: "Nummerert liste", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Fet", value: "strong" },
          { title: "Kursiv", value: "em" },
        ],
        annotations: [defineArrayMember({ type: "linkAnnotation" })],
      },
    }),
    defineArrayMember({ type: "imageWithAlt" }),
  ],
});

/** Enkel tekst uten overskrifter og bilder, til moduler med egen overskrift. */
export const simpleBlockContent = defineType({
  name: "simpleBlockContent",
  title: "Tekst",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [{ title: "Normal", value: "normal" }],
      lists: [{ title: "Punktliste", value: "bullet" }],
      marks: {
        decorators: [
          { title: "Fet", value: "strong" },
          { title: "Kursiv", value: "em" },
        ],
        annotations: [defineArrayMember({ type: "linkAnnotation" })],
      },
    }),
  ],
});

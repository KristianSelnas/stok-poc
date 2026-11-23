import type { ReferenceFilterResolver } from "sanity";

/**
 * Begrenser referanser til dokumenter i samme språk som dokumentet
 * redaktøren står i, så en norsk side ikke lenker til en islandsk.
 */
export const referenceFilterByLanguage: ReferenceFilterResolver = ({ document }) => {
  const language = (document as { language?: string }).language;
  if (!language) return {};
  return { filter: "language == $language", params: { language } };
};

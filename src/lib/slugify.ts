const replacements: Record<string, string> = {
  æ: "ae",
  ø: "o",
  å: "a",
  ð: "d",
  þ: "th",
  ö: "o",
  ä: "a",
};

/**
 * Lager URL-vennlige adresser av norsk og islandsk tekst.
 * «Bærekraft og miljø» blir «baerekraft-og-miljo», «Um okkur» blir «um-okkur».
 * Skråstrek beholdes, så redaktøren kan lage undersider.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[æøåðþöä]/g, (char) => replacements[char] ?? char)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9/]+/g, "-")
    .replace(/-*\/-*/g, "/")
    .replace(/\/{2,}/g, "/")
    .replace(/^[-/]+|[-/]+$/g, "")
    .slice(0, 96);
}

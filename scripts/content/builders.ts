import type { Image, Link, ModuleOf, RichTextContent, SimpleTextContent } from "@/sanity/types";

/*
 * Hjelpere som bygger startinnhold i samme form som GROQ-resultatene.
 * TypeScript sjekker innholdet mot de genererte typene, så startinnholdet
 * følger skjemaet når det endres.
 */

let keyCounter = 0;
const key = (prefix = "k") => `${prefix}${++keyCounter}`;

// Lenker

export const pageLink = (label: string, slug: string): Link => ({
  label,
  linkType: "internal",
  internal: { _type: "page", slug },
  path: null,
  url: null,
});

/** Intern lenke til et hvilket som helst dokument, f.eks. en bransje eller et produkt. */
export const docLink = (label: string, type: NonNullable<Link["internal"]>["_type"], slug: string): Link => ({
  label,
  linkType: "internal",
  internal: { _type: type, slug } as NonNullable<Link["internal"]>,
  path: null,
  url: null,
});

export const pathLink = (label: string, path: string): Link => ({
  label,
  linkType: "path",
  path,
  internal: null,
  url: null,
});

export const externalLink = (label: string, url: string): Link => ({
  label,
  linkType: "external",
  url,
  path: null,
  internal: null,
});

const withKey = <T extends object>(value: T) => ({ _key: key("l"), ...value });

// Bilder fra public/images/innhold

const imageSizes = {
  "fabrikkskip.jpg": [1600, 900],
  "laks-pa-is.jpg": [1600, 900],
  "laksefilet.jpg": [1600, 417],
  "medarbeidere.jpg": [1072, 912],
  "pakkemaskin.jpg": [1024, 768],
  "pakket-paprika.jpg": [1000, 800],
  "papp-pa-pall.jpg": [1500, 907],
  "radgivning-lager.jpg": [1600, 1073],
  "resirkulering.jpg": [1000, 800],
  "salat-i-kasse.jpg": [1600, 762],
  "traler.jpg": [1600, 900],
  "transportkasser.jpg": [1600, 640],
} as const;

export const image = (file: keyof typeof imageSizes, alt: string): Image => ({
  url: `/images/innhold/${file}`,
  alt,
  width: imageSizes[file][0],
  height: imageSizes[file][1],
  lqip: null,
  hotspot: null,
});

/** Bilde fra en ekstern URL. Importskriptet laster det ned og opp i Sanity. */
export const remoteImage = (url: string, alt: string): Image => ({
  url,
  alt,
  width: null,
  height: null,
  lqip: null,
  hotspot: null,
});

// Rik tekst

type Block = Extract<RichTextContent[number], { _type: "block" }>;
type Span = { text: string; marks?: string[] };
type LinkDef = NonNullable<Block["markDefs"]>[number];

/**
 * Lager et tekstavsnitt. Støtter en enkel markdown-variant:
 * `**fet**` og `[tekst](lenke)`, der lenken er `page:slug` (intern side),
 * en sti som `/kontakt`, eller en full URL.
 */
function block(style: NonNullable<Block["style"]>, text: string, listItem?: Block["listItem"]): Block {
  const markDefs: LinkDef[] = [];
  const children: Span[] = [];
  const pattern = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > last) children.push({ text: text.slice(last, match.index) });
    if (match[3]) {
      children.push({ text: match[3], marks: ["strong"] });
    } else {
      const markKey = key("m");
      const target = match[2];
      const link = target.startsWith("page:")
        ? pageLink("", target.slice(5))
        : target.startsWith("/")
          ? pathLink("", target)
          : externalLink("", target);
      markDefs.push({ _key: markKey, _type: "linkAnnotation", ...link, label: null });
      children.push({ text: match[1], marks: [markKey] });
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) children.push({ text: text.slice(last) });

  return {
    _type: "block",
    _key: key("b"),
    style,
    ...(listItem ? { listItem, level: 1 } : {}),
    markDefs,
    children: children.map((child) => ({ _type: "span", _key: key("s"), marks: [], ...child })),
  };
}

export const p = (text: string) => block("normal", text);
export const h2 = (text: string) => block("h2", text);
export const h3 = (text: string) => block("h3", text);
export const lead = (text: string) => block("lead", text);
export const ul = (...items: string[]) => items.map((item) => block("normal", item, "bullet"));
export const quote = (text: string) => block("blockquote", text);

/** Enkel JSON-form for rik tekst, brukt i innholdsfilene under `scripts/content/`. */
export type JsonBlock = { p: string } | { h: string } | { ul: string[] } | { quote: string };

export const blocksFromJson = (blocks: JsonBlock[]) =>
  blocks.flatMap((b) =>
    "p" in b ? [p(b.p)] : "h" in b ? [h2(b.h)] : "ul" in b ? ul(...b.ul) : [quote(b.quote)],
  );

/** Enkel tekst (bare avsnitt og punktlister) til «Tekst med bilde». */
export const simple = (...blocks: (Block | Block[])[]): SimpleTextContent =>
  blocks.flat() as SimpleTextContent;

export const rich = (...blocks: (Block | Block[])[]): RichTextContent => blocks.flat();

// Moduler

export const hero = (
  value: Partial<Omit<ModuleOf<"hero">, "_type" | "_key" | "ctas">> & { title: string; ctas?: Link[] },
): ModuleOf<"hero"> => ({
  _type: "hero",
  _key: key("hero"),
  eyebrow: null,
  lead: null,
  image: null,
  ...value,
  ctas: value.ctas?.map(withKey) ?? null,
});

export const richText = (content: RichTextContent): ModuleOf<"richText"> => ({
  _type: "richText",
  _key: key("rt"),
  content,
});

export const textWithImage = (
  value: Partial<Omit<ModuleOf<"textWithImage">, "_type" | "_key">> & {
    title: string;
    image: Image;
  },
): ModuleOf<"textWithImage"> => ({
  _type: "textWithImage",
  _key: key("twi"),
  eyebrow: null,
  body: null,
  imagePosition: "right",
  cta: null,
  ...value,
});

type CardInput = { title: string; text?: string; image?: Image; link?: Link };

export const cardGrid = (
  value: Partial<Omit<ModuleOf<"cardGrid">, "_type" | "_key" | "cards">> & { cards: CardInput[] },
): ModuleOf<"cardGrid"> => ({
  _type: "cardGrid",
  _key: key("cg"),
  eyebrow: null,
  title: null,
  intro: null,
  columns: 3,
  ...value,
  cards: value.cards.map((card) => ({
    _key: key("card"),
    title: card.title,
    text: card.text ?? null,
    image: card.image ?? null,
    link: card.link ?? null,
  })),
});

type FeatureItem = NonNullable<ModuleOf<"featureList">["items"]>[number];

export const featureList = (
  value: Partial<Omit<ModuleOf<"featureList">, "_type" | "_key" | "items">> & {
    items: { icon: NonNullable<FeatureItem["icon"]>; title: string; text?: string }[];
  },
): ModuleOf<"featureList"> => ({
  _type: "featureList",
  _key: key("fl"),
  eyebrow: null,
  title: null,
  intro: null,
  ...value,
  items: value.items.map((item) => ({ _key: key("fi"), text: null, ...item })),
});

export const ctaBanner = (
  value: Partial<Omit<ModuleOf<"ctaBanner">, "_type" | "_key">> & { title: string },
): ModuleOf<"ctaBanner"> => ({
  _type: "ctaBanner",
  _key: key("cta"),
  text: null,
  tone: "blue",
  cta: null,
  image: null,
  ...value,
});

export const productCatalog = (
  value: Partial<Omit<ModuleOf<"productCatalog">, "_type" | "_key">> = {},
): ModuleOf<"productCatalog"> => ({
  _type: "productCatalog",
  _key: key("pc"),
  title: null,
  intro: null,
  ...value,
});

/** Nyhetsliste. Artiklene hentes av GROQ-spørringen, så listen er tom her. */
export const newsList = (
  value: Partial<Omit<ModuleOf<"newsList">, "_type" | "_key" | "articles">> = {},
): ModuleOf<"newsList"> => ({
  _type: "newsList",
  _key: key("nl"),
  eyebrow: null,
  title: null,
  limit: null,
  cta: null,
  ...value,
  articles: [],
});

/** Kontaktpersoner. Personer og avdelinger hentes av GROQ-spørringen. */
export const contactPeople = (
  value: Partial<Pick<ModuleOf<"contactPeople">, "eyebrow" | "title" | "intro" | "showCustomerService">> = {},
): ModuleOf<"contactPeople"> => ({
  _type: "contactPeople",
  _key: key("cp"),
  eyebrow: null,
  title: null,
  intro: null,
  showCustomerService: true,
  ...value,
  selectedPeople: null,
  departments: [],
  people: [],
});

export const locations = (
  value: Partial<Pick<ModuleOf<"locations">, "eyebrow" | "title">> = {},
): ModuleOf<"locations"> => ({
  _type: "locations",
  _key: key("loc"),
  eyebrow: null,
  title: null,
  ...value,
  items: [],
});

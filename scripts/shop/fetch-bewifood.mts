/**
 * Henter produktene fra bewifood.com og lagrer dem som rådata for mock-katalogen.
 *
 * Kjør: node scripts/shop/fetch-bewifood.mts
 *
 * Skriptet leser produktlisten, WordPress-API-et (kategorier) og hver
 * produktside (beskrivelse, fordeler, varianter og varianttabell). Bildene
 * lastes ned til public/images/produkter/<bewifood-slug>/. Resultatet skrives
 * til scripts/shop/data/bewifood-raw.json. Deretter lager
 * build-catalog.mts selve katalogen.
 *
 * Skriptet er et engangsverktøy. Appen bruker bare JSON-filene som er sjekket inn.
 */
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = "https://bewifood.com";
const ROOT = path.resolve(import.meta.dirname, "../..");
const OUT_FILE = path.join(ROOT, "scripts/shop/data/bewifood-raw.json");
const IMAGE_DIR = path.join(ROOT, "public/images/produkter");
/** Mellomlager for HTML, så skriptet kan kjøres på nytt uten å hente alt. */
const CACHE_DIR = path.join(ROOT, "scripts/shop/.cache");

export type DescriptionBlock =
  { type: "h"; text: string } | { type: "p"; text: string } | { type: "ul"; items: string[] };

export type RawProduct = {
  bewifoodSlug: string;
  url: string;
  wpId: number | null;
  /** Overskriften produktet står under i produktlisten, f.eks. «Eske». */
  listGroup: string;
  name: string;
  pageTitle: string | null;
  shortDescription: string | null;
  description: DescriptionBlock[];
  benefits: { title: string; text: string }[];
  variantBoxes: { name: string | null; sku: string | null; text: string | null; image: string | null }[];
  specTable: { columns: string[]; rows: string[][] } | null;
  specNote: string | null;
  downloads: { label: string; url: string }[];
  /** Bilder som URL på bewifood.com og lokal sti under public/. */
  images: { url: string; local: string | null }[];
  categories: { id: number; name: string; slug: string; parent: number }[];
  tags: { id: number; name: string; slug: string }[];
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchText(url: string, cacheKey?: string): Promise<string> {
  const cacheFile = cacheKey ? path.join(CACHE_DIR, cacheKey) : null;
  if (cacheFile && existsSync(cacheFile)) return readFile(cacheFile, "utf8");
  const response = await fetch(url, { headers: { "user-agent": "stok-poc-katalogimport" } });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  const text = await response.text();
  if (cacheFile) {
    await mkdir(path.dirname(cacheFile), { recursive: true });
    await writeFile(cacheFile, text);
  }
  await sleep(150);
  return text;
}

async function fetchJson<T>(url: string, cacheKey: string): Promise<T> {
  return JSON.parse(await fetchText(url, cacheKey)) as T;
}

const entities: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  laquo: "«",
  raquo: "»",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  deg: "°",
  aring: "å",
  Aring: "Å",
  oslash: "ø",
  Oslash: "Ø",
  aelig: "æ",
  AElig: "Æ",
  times: "×",
};

function decode(value: string): string {
  return value.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (match, code: string) => {
    if (code[0] === "#") {
      const n = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return String.fromCodePoint(n);
    }
    return entities[code] ?? match;
  });
}

/** Fjerner tagger og normaliserer mellomrom. */
function text(html: string): string {
  return decode(html.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, ""))
    .replace(/\s+/g, " ")
    .trim();
}

/** Tekst fra et sted i HTML-en fram til første av sluttmarkørene. */
function section(html: string, start: RegExp, ends: string[]): string | null {
  const match = start.exec(html);
  if (!match) return null;
  const rest = html.slice(match.index);
  const positions = ends.map((end) => rest.indexOf(end, 1)).filter((i) => i > 0);
  return positions.length ? rest.slice(0, Math.min(...positions)) : rest;
}

function parseDescription(html: string): DescriptionBlock[] {
  const blocks: DescriptionBlock[] = [];
  const pattern = /<(h[1-6]|p|ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  for (const match of html.matchAll(pattern)) {
    const tag = match[1].toLowerCase();
    if (tag === "ul" || tag === "ol") {
      const items = [...match[2].matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((li) => text(li[1]));
      if (items.some(Boolean)) blocks.push({ type: "ul", items: items.filter(Boolean) });
    } else {
      const value = text(match[2]);
      if (value) blocks.push({ type: tag === "p" ? "p" : "h", text: value });
    }
  }
  return blocks;
}

function parseProductPage(html: string) {
  const main = html
    .slice(html.indexOf("<main"), html.indexOf("</main>"))
    .replace(/<script[\s\S]*?<\/script>/g, "");

  const h1 = /<h1[^>]*hero-fade-in[^>]*>([\s\S]*?)<\/h1>/.exec(main);
  const short = /<span class="[^"]*product-description[^"]*">([\s\S]*?)<\/span>/.exec(main);

  const images: string[] = [];
  const addImage = (url: string | undefined) => {
    if (url && /^https?:\/\//.test(url) && !/logo|icon/i.test(url) && !images.includes(url)) images.push(url);
  };
  const carousel = section(main, /<div class="image-container"/, ['<div class="description-container"']);
  for (const tag of carousel?.match(/<img[^>]+>/g) ?? []) {
    addImage(/data-src="([^"]+)"/.exec(tag)?.[1] ?? /\ssrc="?(https?:\/\/[^"\s>]+)/.exec(tag)?.[1]);
  }

  const descriptionHtml = section(main, /<div class="description">/, [
    '<div class="usp-section',
    '<div class="variations-block',
    '<div class="row spec',
    '<div class="downloads',
  ]);
  const description = descriptionHtml ? parseDescription(descriptionHtml) : [];

  const benefits = [
    ...main.matchAll(
      /<h4 class="usp-header[^"]*">([\s\S]*?)<\/h4>[\s\S]*?<span class="usp-text">([\s\S]*?)<\/span>/g,
    ),
  ].map((m) => ({ title: text(m[1]), text: text(m[2]) }));

  const variantBoxes: RawProduct["variantBoxes"] = [];
  const variationsHtml = section(main, /<div class="variations-block/, [
    '<div class="row spec',
    '<div class="downloads',
  ]);
  for (const box of variationsHtml?.split('<div class="variations-box').slice(1) ?? []) {
    const image = /<img src=["']?([^"'\s>]+)/.exec(box)?.[1];
    const spans = [...box.matchAll(/<span>([\s\S]*?)<\/span>/g)];
    variantBoxes.push({
      name: text(/<span class="header">([\s\S]*?)<\/span>/.exec(box)?.[1] ?? "") || null,
      sku: text(/<span class='d-block sku'>([\s\S]*?)<\/span>/.exec(box)?.[1] ?? "") || null,
      text: spans.length ? text(spans[spans.length - 1][1]) || null : null,
      image: image?.startsWith("http") ? image : null,
    });
    addImage(image?.startsWith("http") ? image : undefined);
  }

  let specTable: RawProduct["specTable"] = null;
  let specNote: string | null = null;
  const specHtml = section(main, /<div class="row spec/, ['<div class="downloads']);
  if (specHtml) {
    const rows = [...specHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)]
      .map((row) => [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((cell) => text(cell[1])))
      .filter((row) => row.some(Boolean));
    if (rows.length) specTable = { columns: rows[0], rows: rows.slice(1) };
    const note = /<div class="asterix-text">([\s\S]*?)<\/div>/.exec(specHtml);
    specNote = note ? text(note[1]) || null : null;
  }

  const downloads: RawProduct["downloads"] = [];
  const downloadsHtml = section(main, /<div class="row">\s*<div class="downloads/, ["</main>"]);
  for (const m of downloadsHtml?.matchAll(
    /<a href=["']?([^"'\s>]+)["']?[^>]*class="download-block"[^>]*>\s*<span class="capped">([\s\S]*?)<\/span>/g,
  ) ?? []) {
    downloads.push({ label: text(m[2]), url: m[1] });
  }

  const hero = /class="hero[^"]*"[\s\S]*?<img[^>]*data-src="([^"]+)"/.exec(main)?.[1];
  if (!images.length) addImage(hero);

  return {
    pageTitle: h1 ? text(h1[1]) || null : null,
    shortDescription: short ? text(short[1]) || null : null,
    description,
    benefits,
    variantBoxes,
    specTable,
    specNote,
    downloads,
    images,
  };
}

type ListItem = { group: string; name: string; url: string; img: string | null; short: string | null };

function parseCatalogue(html: string): ListItem[] {
  const items: ListItem[] = [];
  for (const block of html.split('<div class="products-block">').slice(1)) {
    const heading = text(/<h3>([\s\S]*?)<\/h3>/.exec(block)?.[1] ?? "");
    const group = heading.includes("—") ? heading.split("—")[1].trim() : heading;
    for (const m of block.matchAll(/<a href="([^"]+)">\s*<div class="item">([\s\S]*?)<\/a>/g)) {
      const body = m[2];
      items.push({
        group,
        name: text(/<h4>([\s\S]*?)<\/h4>/.exec(body)?.[1] ?? ""),
        url: m[1],
        img: /data-src="([^"]+)"/.exec(body)?.[1] ?? null,
        short: text(/<\/div>\s*<span>([\s\S]*?)<\/span>/.exec(body)?.[1] ?? "") || null,
      });
    }
  }
  return items;
}

function slugFromUrl(url: string): string {
  return new URL(url).pathname.replace(/\/$/, "").split("/").pop() ?? url;
}

async function downloadImage(url: string, slug: string): Promise<string | null> {
  const file = decodeURIComponent(new URL(url).pathname.split("/").pop() ?? "").toLowerCase();
  const target = path.join(IMAGE_DIR, slug, file);
  const local = `/images/produkter/${slug}/${file}`;
  if (existsSync(target)) return local;
  try {
    const response = await fetch(url, { headers: { "user-agent": "stok-poc-katalogimport" } });
    if (!response.ok) {
      console.warn(`  Bilde mangler (${response.status}): ${url}`);
      return null;
    }
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, Buffer.from(await response.arrayBuffer()));
    await sleep(100);
    return local;
  } catch (error) {
    console.warn(`  Kunne ikke laste ned ${url}: ${(error as Error).message}`);
    return null;
  }
}

type WpItem = { id: number; slug: string; link: string; categories: number[]; tags: number[] };
type WpTerm = { id: number; name: string; slug: string; parent?: number };

async function main() {
  console.log("Henter produktlisten …");
  const list = parseCatalogue(await fetchText(`${BASE}/emballasje/produkter?lang=no`, "catalogue.html"));
  console.log(`  ${list.length} produkter`);

  const [wpItems, categories, tags] = await Promise.all([
    fetchJson<WpItem[]>(
      `${BASE}/wp-json/wp/v2/product-items?per_page=100&lang=no&_fields=id,slug,link,categories,tags`,
      "wp-items.json",
    ),
    fetchJson<WpTerm[]>(
      `${BASE}/wp-json/wp/v2/categories?per_page=100&lang=no&_fields=id,name,slug,parent`,
      "wp-categories.json",
    ),
    fetchJson<WpTerm[]>(
      `${BASE}/wp-json/wp/v2/tags?per_page=100&lang=no&_fields=id,name,slug`,
      "wp-tags.json",
    ),
  ]);
  const wpByLink = new Map(wpItems.map((item) => [slugFromUrl(item.link), item]));
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const tagById = new Map(tags.map((t) => [t.id, t]));

  const products: RawProduct[] = [];
  for (const item of list) {
    const slug = slugFromUrl(item.url);
    console.log(`Henter ${slug}`);
    const page = parseProductPage(await fetchText(`${item.url}?lang=no`, `products/${slug}.html`));
    const wp = wpByLink.get(slug);

    const imageUrls = [...page.images];
    if (item.img && !imageUrls.includes(item.img)) imageUrls.unshift(item.img);
    const images: RawProduct["images"] = [];
    for (const url of imageUrls) images.push({ url, local: await downloadImage(url, slug) });

    products.push({
      bewifoodSlug: slug,
      url: item.url,
      wpId: wp?.id ?? null,
      listGroup: item.group,
      name: item.name,
      pageTitle: page.pageTitle && page.pageTitle !== item.name ? page.pageTitle : null,
      shortDescription: page.shortDescription ?? item.short,
      description: page.description,
      benefits: page.benefits,
      variantBoxes: page.variantBoxes,
      specTable: page.specTable,
      specNote: page.specNote,
      downloads: page.downloads,
      images,
      categories: (wp?.categories ?? []).flatMap((id) => {
        const c = categoryById.get(id);
        return c ? [{ id: c.id, name: decode(c.name), slug: c.slug, parent: c.parent ?? 0 }] : [];
      }),
      tags: (wp?.tags ?? []).flatMap((id) => {
        const t = tagById.get(id);
        return t ? [{ id: t.id, name: decode(t.name), slug: t.slug }] : [];
      }),
    });
  }

  await mkdir(path.dirname(OUT_FILE), { recursive: true });
  await writeFile(
    OUT_FILE,
    JSON.stringify(
      { source: `${BASE}/emballasje/produkter?lang=no`, fetchedAt: new Date().toISOString(), products },
      null,
      2,
    ) + "\n",
  );
  console.log(`Skrev ${products.length} produkter til ${path.relative(ROOT, OUT_FILE)}`);
}

await main();

/**
 * Legger inn innholdet for fase 3 i Sanity: bransjer, produkter, nyheter,
 * kontaktpersoner og sidene Produkter, Nyheter og Kontakt, for begge markeder.
 *
 * Skriptet er laget for å kunne kjøres flere ganger:
 * - Dokumenter opprettes bare hvis de mangler. Med `--replace` overskrives de.
 * - Navigasjonen beholder rekkefølgen og tekstene redaktøren har satt.
 *   Sti-lenker gjøres om til ekte referanser når dokumentet nå finnes.
 * - Forsiden får en nyhetsliste hvis den ikke har en fra før.
 * - Kundeservice legges inn i Innstillinger hvis feltene er tomme.
 *
 * Bildene lastes ned fra bewifood.com og stok.dk og lastes opp i Sanity.
 *
 * Kjør med innlogget Sanity-bruker (ingen token i koden):
 *   pnpm exec sanity login
 *   pnpm seed:content --dry-run   # viser hva som ville blitt gjort
 *   pnpm seed:content             # oppretter det som mangler
 *   pnpm seed:content --replace   # overskriver innholdet fra dette skriptet
 */
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { getCliClient } from "sanity/cli";

import { blocksFromJson, type JsonBlock, remoteImage } from "../src/content/fallback/builders";
import { fallbackPages } from "../src/content/fallback";
import { slugify } from "../src/lib/slugify";
import { documentPath } from "../src/lib/routes";
import { markets, type MarketId } from "../src/lib/markets";
import catalogIs from "./content/catalog-is.json";
import catalogNo from "./content/catalog-no.json";
import newsNo from "./content/news-no.json";
import organizationIs from "./content/organization-is.json";
import organizationNo from "./content/organization-no.json";
import { industriesIs, pagesIs } from "./content/structure-is";
import {
  frontPageNewsNo,
  industriesNo,
  pagesNo,
  type IndustryContent,
  type PageContent,
} from "./content/structure-no";
import { docId, DocumentConverter, type JsonObject, ref, type SanityDocument } from "./lib/convert";

const dryRun = process.argv.includes("--dry-run");
const replace = process.argv.includes("--replace");
const client = getCliClient({ apiVersion: "2026-11-01" });
const converter = new DocumentConverter(client, dryRun);

/** Formatet på filene i `scripts/content/`, generert fra data hentet fra bewifood.com. */
type CatalogFile = {
  productGroups: { slug: string; title: string; order: number }[];
  materials: { slug: string; title: string }[];
  products: {
    slug: string;
    title: string;
    shortDescription: string | null;
    group: string | null;
    materials: string[];
    industries: string[];
    images: { url: string; alt: string }[];
    description: JsonBlock[];
    properties: { key: string; value: string }[];
    datasheetUrl: string | null;
  }[];
};

type OrganizationFile = {
  customerService: { phone: string; email: string };
  departments: { key: string; title: string; order: number }[];
  people: {
    name: string;
    role: string | null;
    phone: string | null;
    email: string | null;
    department: string;
    order: number;
  }[];
  locations: ({ slug: string } & Record<string, string | null>)[];
};

type NewsFile = {
  categories: { slug: string; title: string }[];
  articles: {
    slug: string;
    title: string;
    publishedAt: string;
    category: string;
    excerpt: string;
    image: { url: string; alt: string };
    body: JsonBlock[];
  }[];
};

type MarketContent = {
  catalog: CatalogFile;
  organization: OrganizationFile;
  news: NewsFile | null;
  industries: IndustryContent[];
  pages: PageContent[];
  frontPageNews: typeof frontPageNewsNo | null;
};

const content: Record<MarketId, MarketContent> = {
  no: {
    catalog: catalogNo as CatalogFile,
    organization: organizationNo as OrganizationFile,
    news: newsNo as NewsFile,
    industries: industriesNo,
    pages: pagesNo,
    frontPageNews: frontPageNewsNo,
  },
  is: {
    catalog: catalogIs as CatalogFile,
    organization: organizationIs as OrganizationFile,
    news: null,
    industries: industriesIs,
    pages: pagesIs,
    frontPageNews: null,
  },
};

const slugValue = (current: string) => ({ _type: "slug", current });

async function uploadFile(url: string): Promise<string | null> {
  if (dryRun) return `file-dryrun-${url.split("/").pop()}`;
  const response = await fetch(url);
  if (!response.ok) {
    console.warn(`  ! Fant ikke datablad ${url} (${response.status})`);
    return null;
  }
  const asset = await client.assets.upload("file", Buffer.from(await response.arrayBuffer()), {
    filename: url.split("/").pop(),
  });
  return asset._id;
}

async function buildDocuments(marketId: MarketId): Promise<SanityDocument[]> {
  const language = markets[marketId].language;
  const { catalog, organization, news, industries, pages } = content[marketId];
  const docs: SanityDocument[] = [];
  const add = (type: string, key: string, body: JsonObject) =>
    docs.push({ ...body, _id: docId(type, language, key), _type: type, language });

  for (const group of catalog.productGroups) {
    add("productGroup", group.slug, { title: group.title, slug: slugValue(group.slug), order: group.order });
  }
  for (const material of catalog.materials) {
    add("material", material.slug, { title: material.title, slug: slugValue(material.slug) });
  }

  for (const industry of industries) {
    const { featuredProducts, slug, modules, image, ...fields } = industry;
    add("industry", slug, {
      ...(await converter.convertObject(fields, language)),
      slug: slugValue(slug),
      ...(image ? { image: await converter.convert(image, language) } : {}),
      modules: await converter.convert(modules, language),
      featuredProducts: featuredProducts.map((product, i) => ref("product", language, product, `p${i}`)),
    });
  }

  for (const product of catalog.products) {
    const datasheet = product.datasheetUrl ? await uploadFile(product.datasheetUrl) : null;
    add("product", product.slug, {
      title: product.title,
      slug: slugValue(product.slug),
      ...(product.shortDescription ? { shortDescription: product.shortDescription } : {}),
      images: await converter.convert(
        product.images.map((img) => remoteImage(img.url, img.alt)),
        language,
      ),
      description: await converter.convert(blocksFromJson(product.description), language),
      properties: await converter.convert(product.properties, language, "properties"),
      ...(datasheet ? { datasheet: { _type: "file", asset: { _type: "reference", _ref: datasheet } } } : {}),
      ...(product.group ? { productGroup: ref("productGroup", language, product.group) } : {}),
      industries: product.industries.map((slug, i) => ref("industry", language, slug, `i${i}`)),
      materials: product.materials.map((slug, i) => ref("material", language, slug, `m${i}`)),
    });
  }

  for (const department of organization.departments) {
    add("department", department.key, { title: department.title, order: department.order });
  }
  for (const person of organization.people) {
    add("person", slugify(person.name), {
      name: person.name,
      ...(person.role ? { role: person.role } : {}),
      ...(person.phone ? { phone: person.phone } : {}),
      ...(person.email ? { email: person.email } : {}),
      department: ref("department", language, person.department),
      order: person.order,
    });
  }
  for (const { slug, ...fields } of organization.locations) {
    add("location", slug, fields);
  }

  if (news) {
    for (const category of news.categories) {
      add("newsCategory", category.slug, { title: category.title, slug: slugValue(category.slug) });
    }
    for (const article of news.articles) {
      add("newsArticle", article.slug, {
        title: article.title,
        slug: slugValue(article.slug),
        publishedAt: article.publishedAt,
        excerpt: article.excerpt,
        category: ref("newsCategory", language, article.category),
        image: await converter.convert(remoteImage(article.image.url, article.image.alt), language),
        body: await converter.convert(blocksFromJson(article.body), language),
      });
    }
  }

  for (const page of pages) {
    const { slug, ...fields } = page;
    add("page", slug, { ...(await converter.convertObject(fields, language)), slug: slugValue(slug) });
  }

  return docs;
}

/** Sti (uten markedsprefiks) → dokument-ID, for å gjøre sti-lenker om til referanser. */
function pathIndex(
  marketId: MarketId,
  docs: SanityDocument[],
): Map<string, { id: string; type: string; slug: string }> {
  const index = new Map<string, { id: string; type: string; slug: string }>();
  const language = markets[marketId].language;
  const known = [
    ...docs.flatMap((doc) => {
      const slug = (doc.slug as { current?: string } | undefined)?.current;
      return slug ? [{ type: doc._type, slug }] : [];
    }),
    ...fallbackPages[marketId].flatMap((page) => (page.slug ? [{ type: "page", slug: page.slug }] : [])),
  ];
  for (const { type, slug } of known) {
    const path = documentPath(type, slug, marketId);
    if (path) index.set(path, { id: docId(type, language, slug), type, slug });
  }
  return index;
}

/** Gjør sti-lenker om til referanser der dokumentet finnes. Returnerer antall endrede lenker. */
function relinkPaths(value: unknown, index: ReturnType<typeof pathIndex>): number {
  if (Array.isArray(value)) return value.reduce((sum, item) => sum + relinkPaths(item, index), 0);
  if (typeof value !== "object" || value === null) return 0;
  const obj = value as Record<string, unknown>;
  let changed = 0;
  if (obj.linkType === "path" && typeof obj.path === "string" && index.has(obj.path)) {
    const target = index.get(obj.path)!;
    obj.linkType = "internal";
    obj.internal = { _type: "reference", _ref: target.id };
    delete obj.path;
    changed++;
  }
  for (const child of Object.values(obj)) changed += relinkPaths(child, index);
  return changed;
}

async function main() {
  const { projectId, dataset } = client.config();
  console.log(
    `Sanity-prosjekt ${projectId}, datasett ${dataset}${dryRun ? " (tørrkjøring)" : ""}${replace ? " (overskriver)" : ""}`,
  );

  const allDocs: SanityDocument[] = [];
  const transaction = client.transaction();

  for (const marketId of Object.keys(markets) as MarketId[]) {
    const language = markets[marketId].language;
    console.log(`\n${markets[marketId].label} (${language})`);
    const docs = await buildDocuments(marketId);
    allDocs.push(...docs);
    for (const doc of docs) {
      if (replace) transaction.createOrReplace(doc);
      else transaction.createIfNotExists(doc);
    }

    // Navigasjon: behold redaktørens rekkefølge, men gjør sti-lenker om til referanser.
    const navigation = await client.getDocument(`navigation-${language}`);
    if (navigation) {
      const fields = ["mainMenu", "headerCta", "footerGroups", "legalLinks"] as const;
      const patch = Object.fromEntries(fields.map((field) => [field, structuredClone(navigation[field])]));
      const changed = relinkPaths(patch, pathIndex(marketId, docs));
      console.log(`  Navigasjon: ${changed} sti-lenker blir referanser`);
      if (changed) transaction.patch(navigation._id, (p) => p.set(patch).ifRevisionId(navigation._rev));
    }

    // Forside: legg til nyhetsliste hvis den mangler.
    const newsModule = content[marketId].frontPageNews;
    const frontPage = await client.getDocument(`frontPage-${language}`);
    const modules = (frontPage?.modules ?? []) as { _type: string }[];
    if (frontPage && newsModule && !modules.some((module) => module._type === "newsList")) {
      const value = await converter.convertObject(newsModule, language);
      console.log("  Forside: legger til nyhetsliste før siste modul");
      transaction.patch(frontPage._id, (p) =>
        modules.length
          ? p.insert("before", "modules[-1]", [{ ...value, _key: "nyheter" }])
          : p.setIfMissing({ modules: [] }).append("modules", [{ ...value, _key: "nyheter" }]),
      );
    }

    // Innstillinger: kundeservice hvis feltene er tomme.
    const { phone, email } = content[marketId].organization.customerService;
    transaction.patch(`siteSettings-${language}`, (p) => p.setIfMissing({ phone, email }));
  }

  const counts = allDocs.reduce<Record<string, number>>((acc, doc) => {
    acc[doc._type] = (acc[doc._type] ?? 0) + 1;
    return acc;
  }, {});
  console.log(
    "\nDokumenter:",
    Object.entries(counts)
      .map(([type, n]) => `${type} ${n}`)
      .join(", "),
  );

  if (dryRun) {
    const file = join(tmpdir(), "stok-seed-content.json");
    writeFileSync(file, JSON.stringify(allDocs, null, 2));
    console.log(`Tørrkjøring: ${allDocs.length} dokumenter skrevet til ${file}`);
    return;
  }

  await transaction.commit({ visibility: "async" });
  console.log(`\nFerdig: ${allDocs.length} dokumenter og ${converter.uploadCount} bilder i ${dataset}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

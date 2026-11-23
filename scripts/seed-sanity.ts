/**
 * Legger reserveinnholdet fra `src/content/fallback/` inn i Sanity.
 *
 * Skriptet laster opp bildene fra `public/images/innhold/` og lager eller
 * erstatter forside, sider, navigasjon og innstillinger for begge markeder.
 * Dokument-ID-ene er faste, så skriptet kan kjøres flere ganger. Det
 * overskriver da endringer gjort i Studio på de samme dokumentene.
 *
 * Kjør med innlogget Sanity-bruker (ingen token i koden):
 *   pnpm exec sanity login
 *   pnpm seed              # skriver til datasettet
 *   pnpm seed --dry-run    # viser hva som ville blitt skrevet
 */
import { createReadStream } from "node:fs";
import { basename, join } from "node:path";

import { getCliClient } from "sanity/cli";

import {
  fallbackFrontPages,
  fallbackNavigation,
  fallbackPages,
  fallbackSiteSettings,
} from "../src/content/fallback";
import { markets, type MarketId } from "../src/lib/markets";

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
type JsonObject = { [key: string]: Json };
type SanityDocument = JsonObject & { _id: string; _type: string };

const dryRun = process.argv.includes("--dry-run");
const client = getCliClient({ apiVersion: "2026-11-01" });

/** Felt som inneholder en lenke, og arrayer med kjent elementtype. */
const linkFields = new Set(["link", "cta", "headerCta"]);
const arrayItemTypes: Record<string, string> = {
  mainMenu: "menuItem",
  groups: "linkGroup",
  footerGroups: "linkGroup",
  links: "link",
  legalLinks: "link",
  ctas: "link",
  cards: "card",
  items: "featureItem",
  socialLinks: "socialLink",
};

const pageId = (language: string, slug: string) => `page-${language}-${slug.replaceAll("/", "-")}`;

// Bilder lastes opp én gang og gjenbrukes. Sanity deduplikerer også selv.
const uploadedImages = new Map<string, string>();

async function uploadImage(url: string): Promise<string> {
  const cached = uploadedImages.get(url);
  if (cached) return cached;
  const file = join(process.cwd(), "public", url);
  if (dryRun) {
    const fakeId = `image-dryrun-${basename(url)}`;
    uploadedImages.set(url, fakeId);
    return fakeId;
  }
  const asset = await client.assets.upload("image", createReadStream(file), { filename: basename(file) });
  uploadedImages.set(url, asset._id);
  console.log(`  ↑ ${basename(file)}`);
  return asset._id;
}

const isObject = (value: unknown): value is JsonObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Lenke fra GROQ-form ({ internal: { _type, slug } }) til dokumentform (referanse). */
function toLinkValue(value: JsonObject, language: string, type: string): JsonObject {
  const { internal, ...rest } = value;
  const result: JsonObject = { ...rest, _type: type };
  if (isObject(internal) && typeof internal.slug === "string") {
    result.internal = { _type: "reference", _ref: pageId(language, internal.slug) };
  }
  return result;
}

/**
 * Gjør et GROQ-resultat om til et Sanity-dokument: fjerner null-verdier,
 * legger på `_type` der skjemaet krever det, gjør lenker om til referanser
 * og laster opp bilder.
 */
async function toDocumentValue(value: unknown, language: string, field?: string): Promise<Json> {
  if (value === null || value === undefined) return null;

  if (Array.isArray(value)) {
    const itemType = field ? arrayItemTypes[field] : undefined;
    const items = await Promise.all(
      value.map(async (item, index) => {
        const converted = await toDocumentValue(item, language);
        if (!isObject(converted)) return converted;
        if (itemType === "link") return toLinkValue({ _key: `k${index}`, ...converted }, language, "link");
        return {
          _key: `k${index}`,
          ...(itemType && !converted._type ? { _type: itemType } : {}),
          ...converted,
        };
      }),
    );
    return items.filter((item) => item !== null);
  }

  if (!isObject(value)) return value as Json;

  // Bilde fra public/: last opp og pek på asset.
  if (typeof value.url === "string" && value.url.startsWith("/images/") && "width" in value) {
    const assetId = await uploadImage(value.url);
    return {
      _type: "imageWithAlt",
      asset: { _type: "reference", _ref: assetId },
      ...(value.alt ? { alt: value.alt } : {}),
    };
  }

  const entries = await Promise.all(
    Object.entries(value).map(
      async ([key, child]) => [key, await toDocumentValue(child, language, key)] as const,
    ),
  );
  const result: JsonObject = Object.fromEntries(entries.filter(([, child]) => child !== null));

  if (value._type === "linkAnnotation") return toLinkValue(result, language, "linkAnnotation");
  if (field && linkFields.has(field) && "linkType" in value) return toLinkValue(result, language, "link");
  if (field === "seo") {
    // Delingsbilde er en URL i GROQ-resultatet og legges ikke inn her.
    const { image: _image, ...seo } = result;
    return { _type: "seo", ...seo };
  }
  return result;
}

async function buildDocuments(): Promise<SanityDocument[]> {
  const documents: SanityDocument[] = [];

  for (const marketId of Object.keys(markets) as MarketId[]) {
    const language = markets[marketId].language;
    console.log(`\n${markets[marketId].label} (${language})`);

    const singletons = [
      ["siteSettings", fallbackSiteSettings[marketId]],
      ["navigation", fallbackNavigation[marketId]],
      ["frontPage", fallbackFrontPages[marketId]],
    ] as const;

    for (const [type, data] of singletons) {
      const body = (await toDocumentValue(data, language)) as JsonObject;
      documents.push({ ...body, _id: `${type}-${language}`, _type: type, language });
    }

    for (const page of fallbackPages[marketId]) {
      if (!page.slug) continue;
      const { _id: _fallbackId, slug, ...rest } = page;
      const body = (await toDocumentValue(rest, language)) as JsonObject;
      documents.push({
        ...body,
        _id: pageId(language, slug),
        _type: "page",
        language,
        slug: { _type: "slug", current: slug },
      });
    }
  }
  return documents;
}

async function main() {
  const { projectId, dataset } = client.config();
  console.log(`Sanity-prosjekt ${projectId}, datasett ${dataset}${dryRun ? " (tørrkjøring)" : ""}`);

  const clean = await buildDocuments();

  if (dryRun) {
    console.log(JSON.stringify(clean, null, 2));
    console.log(`\n${clean.length} dokumenter ville blitt skrevet.`);
    return;
  }

  const transaction = client.transaction();
  for (const document of clean) transaction.createOrReplace(document);
  await transaction.commit({ visibility: "async" });

  console.log(`\nFerdig: ${clean.length} dokumenter og ${uploadedImages.size} bilder i ${dataset}.`);
  for (const document of clean) console.log(`  ✓ ${document._id}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

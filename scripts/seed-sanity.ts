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
import { getCliClient } from "sanity/cli";

import {
  fallbackFrontPages,
  fallbackNavigation,
  fallbackPages,
  fallbackSiteSettings,
} from "../src/content/fallback";
import { markets, type MarketId } from "../src/lib/markets";
import { docId, DocumentConverter, type SanityDocument } from "./lib/convert";

const dryRun = process.argv.includes("--dry-run");
const client = getCliClient({ apiVersion: "2026-11-01" });
const converter = new DocumentConverter(client, dryRun);

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
      const body = await converter.convertObject(data, language);
      documents.push({ ...body, _id: `${type}-${language}`, _type: type, language });
    }

    for (const page of fallbackPages[marketId]) {
      if (!page.slug) continue;
      const { _id: _fallbackId, slug, ...rest } = page;
      const body = await converter.convertObject(rest, language);
      documents.push({
        ...body,
        _id: docId("page", language, slug),
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

  console.log(`\nFerdig: ${clean.length} dokumenter og ${converter.uploadCount} bilder i ${dataset}.`);
  for (const document of clean) console.log(`  ✓ ${document._id}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

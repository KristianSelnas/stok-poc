/**
 * Fjerner produktene fra Sanity etter fase N. Produktene, produktgruppene og
 * materialene ligger nå i produktkatalogen, og typene `product`,
 * `productGroup` og `material` finnes ikke lenger i skjemaet.
 *
 * Skriptet gjør dette i én transaksjon:
 * - fjerner feltet `featuredProducts` fra bransjene, siden det peker på produkter
 * - fjerner produktutvalg (`productGrid`) som bruker det gamle formatet, med
 *   manuelt valgte produkter eller en referanse til en produktgruppe
 * - gjør interne lenker til produkter om til sti-lenker (`/no/produkter/<slug>`)
 * - sletter dokumentene, kladdene og oversettelsesmetadataene deres
 *
 * Kjør med innlogget Sanity-bruker (ingen token i koden):
 *   pnpm remove:products --dry-run   # viser hva som ville blitt gjort
 *   pnpm remove:products
 */
import { getCliClient } from "sanity/cli";

import { documentPath } from "../src/lib/routes";
import { marketForLanguage } from "../src/lib/markets";

const dryRun = process.argv.includes("--dry-run");
const client = getCliClient({ apiVersion: "2026-11-01" });

const removedTypes = ["product", "productGroup", "material"];

type Doc = { _id: string; _type: string; _rev: string; [key: string]: unknown };
type Product = { _id: string; slug?: string; language?: string };

/**
 * Går gjennom et dokument og retter det som peker på produktene. Returnerer
 * en beskrivelse av hver endring.
 */
function clean(value: unknown, products: Map<string, Product>, changes: string[]): unknown {
  if (Array.isArray(value)) {
    return value
      .filter((item) => {
        const grid = item as { _type?: string; products?: unknown; productGroup?: unknown };
        const legacyGrid =
          grid?._type === "productGrid" &&
          (grid.products !== undefined || typeof grid.productGroup === "object");
        if (legacyGrid) changes.push("fjerner produktutvalg i gammelt format");
        return !legacyGrid;
      })
      .map((item) => clean(item, products, changes));
  }
  if (typeof value !== "object" || value === null) return value;
  const obj = { ...(value as Record<string, unknown>) };
  const internal = obj.internal as { _ref?: string } | undefined;
  const target = internal?._ref ? products.get(internal._ref.replace(/^drafts\./, "")) : undefined;
  if (target) {
    const market = marketForLanguage(target.language);
    const path = market ? documentPath("product", target.slug, market) : undefined;
    if (path) {
      obj.linkType = "path";
      obj.path = path;
      changes.push(`lenke til ${target._id} blir ${path}`);
    } else {
      changes.push(`fjerner lenke til ${target._id}`);
    }
    delete obj.internal;
  }
  for (const [key, child] of Object.entries(obj)) obj[key] = clean(child, products, changes);
  return obj;
}

async function main() {
  const { projectId, dataset } = client.config();
  console.log(`Sanity-prosjekt ${projectId}, datasett ${dataset}${dryRun ? " (tørrkjøring)" : ""}`);

  const products = await client.fetch<Product[]>(
    `*[_type == "product"]{ _id, "slug": slug.current, language }`,
    {},
    { perspective: "raw" },
  );
  const removed = await client.fetch<{ _id: string; _type: string }[]>(
    `*[_type in $types]{ _id, _type }`,
    { types: removedTypes },
    { perspective: "raw" },
  );
  const removedIds = new Set(removed.map((doc) => doc._id));
  const metadata = await client.fetch<{ _id: string }[]>(
    `*[_type == "translation.metadata" && count(schemaTypes[@ in $types]) > 0]{ _id }`,
    { types: removedTypes },
    { perspective: "raw" },
  );
  const referencing = await client.fetch<Doc[]>(
    `*[!(_id in $ids) && _type != "translation.metadata" && references($ids)]`,
    { ids: [...removedIds] },
    { perspective: "raw" },
  );

  const productById = new Map(products.map((p) => [p._id.replace(/^drafts\./, ""), p]));
  const transaction = client.transaction();

  for (const doc of referencing) {
    const changes: string[] = [];
    const fields = Object.fromEntries(
      Object.entries(doc).filter(([key]) => !key.startsWith("_") && key !== "featuredProducts"),
    );
    if (doc.featuredProducts !== undefined) changes.push("fjerner featuredProducts");
    const cleaned = clean(fields, productById, changes) as Record<string, unknown>;
    console.log(`  ${doc._id}: ${changes.length ? changes.join("; ") : "ingen kjente referanser"}`);
    transaction.patch(doc._id, (patch) =>
      patch.set(cleaned).unset(["featuredProducts"]).ifRevisionId(doc._rev),
    );
  }
  for (const doc of metadata) transaction.delete(doc._id);
  for (const doc of removed) transaction.delete(doc._id);

  const counts = removed.reduce<Record<string, number>>((acc, doc) => {
    acc[doc._type] = (acc[doc._type] ?? 0) + 1;
    return acc;
  }, {});
  console.log(
    `\nSletter ${removed.length} dokumenter (${Object.entries(counts)
      .map(([type, n]) => `${type} ${n}`)
      .join(", ")}) og ${metadata.length} oversettelsesmetadata. Retter ${referencing.length} dokumenter.`,
  );

  if (dryRun) {
    console.log("Tørrkjøring: ingenting er endret.");
    return;
  }
  await transaction.commit({ visibility: "async" });
  console.log("Ferdig.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

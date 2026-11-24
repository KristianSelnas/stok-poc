/**
 * Lager priser, lagerstatus og ordrehistorikk for mock-tjenestene.
 *
 * Kjør: node scripts/shop/generate-mock-data.mts
 *
 * Leser src/shop/mock/data/catalog.json og customers.json, og skriver
 * prices.json, inventory.json og orders.json i samme mappe. Tallene er
 * laget av oss, men følger vekt, materiale og pallestørrelse, så de virker
 * troverdige. Skriptet bruker en fast startverdi for tilfeldige tall, så det
 * gir samme resultat hver gang. Hver variant og hver kunde har sin egen
 * strøm av tall, så en endring ett sted ikke forskyver resten.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type {
  Customer,
  InventoryInfo,
  Order,
  OrderLine,
  OrderStatus,
  PackagingSpec,
  Product,
  Variant,
} from "../../src/shop/domain.ts";
import { calculateTotals, computePrice, unitPriceFor } from "../../src/shop/mock/rules.ts";

const ROOT = path.resolve(import.meta.dirname, "../..");
const DATA = path.join(ROOT, "src/shop/mock/data");
/** Dagens dato i demoen. Ordrehistorikken går 18 måneder tilbake herfra. */
const NOW = new Date("2026-11-24T09:00:00+01:00");
const FIRST_ORDER_NUMBER = 10301;

// ---------------------------------------------------------------------------
// Tilfeldige tall med fast startverdi (mulberry32)
// ---------------------------------------------------------------------------

const BASE_SEED = 20261124;
let seed = BASE_SEED;

/**
 * Starter en ny strøm av tall for én variant eller kunde. Da påvirker ikke
 * endringer i katalogen eller hos én kunde tallene for de andre.
 */
function reseed(key: string) {
  seed = BASE_SEED;
  for (const char of key) seed = Math.imul(seed ^ char.charCodeAt(0), 0x01000193);
}

function random(): number {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const between = (min: number, max: number) => Math.floor(min + random() * (max - min + 1));
const pick = <T,>(items: T[]): T => items[Math.floor(random() * items.length)];
const chance = (p: number) => random() < p;

// ---------------------------------------------------------------------------
// Priser
// ---------------------------------------------------------------------------

/** Faste listepriser for tillegget i build-catalog.mts. */
const manualPrices: Record<string, number> = {
  "9101-1": 19.9,
  "9101-2": 21.9,
  "9102-1": 34.9,
  "9110-1": 89,
  "9110-2": 109,
  "9111-1": 449,
  "9120-1": 329,
  "9120-2": 389,
  "9130-1": 0.9,
  "9130-2": 1.5,
  "9140-1": 9.9,
  "9140-2": 12.5,
  "9150-1": 14.9,
};

/** Kr per stk. etter type, når varianten mangler vekt. */
const typeFallback: Record<string, number> = {
  eske: 12,
  brett: 8,
  sekk: 14,
  film: 14,
  ark: 6,
  honeycomb: 6,
  pakkemaskin: 45,
  tilbehor: 45,
  "hvac-lokk": 45,
  annet: 45,
};

function round(value: number): number {
  if (value >= 100) return Math.round(value);
  if (value >= 10) return Math.round(value * 2) / 2 - 0.1;
  return Math.round(value * 10) / 10;
}

function listPrice(product: Product, variant: Variant): number {
  if (manualPrices[variant.sku]) return manualPrices[variant.sku];
  if (variant.weightKg) {
    // Plast: omtrent 90 kr per kg ferdig vare, pluss et fast tillegg.
    return round(5 + variant.weightKg * 90);
  }
  return round((typeFallback[product.type] ?? 25) * (0.9 + random() * 0.4));
}

// ---------------------------------------------------------------------------
// Lager
// ---------------------------------------------------------------------------

function inventory(variant: Variant): InventoryInfo {
  if (variant.salesMode === "quote") {
    return { sku: variant.sku, status: "onRequest", available: 0, leadTimeDays: 25 };
  }
  if (variant.salesMode === "madeToOrder") {
    return { sku: variant.sku, status: "madeToOrder", available: 0, leadTimeDays: pick([10, 15, 20]) };
  }
  const pallet = variant.unitsPerPallet ?? variant.unitsPerBundle * 40;
  const low = chance(0.15);
  const pallets = low ? random() * 0.8 + 0.1 : between(2, 30);
  const bundle = Math.max(1, variant.unitsPerBundle);
  const available = Math.max(bundle, Math.round((pallet * pallets) / bundle) * bundle);
  return { sku: variant.sku, status: low ? "lowStock" : "inStock", available, leadTimeDays: 2 };
}

// ---------------------------------------------------------------------------
// Ordrehistorikk
// ---------------------------------------------------------------------------

/** En vare kunden pleier å kjøpe: antall paller (`pallets`) eller stk. (`units`). */
type BasketItem =
  | { sku: string; pallets: [number, number]; weight?: number }
  | { sku: string; units: [number, number]; weight?: number }
  | {
      custom: Omit<OrderLine, "id" | "quantity" | "sku" | "productSlug">;
      units: [number, number];
      weight?: number;
    };

type Profile = {
  customerId: string;
  /** Dager mellom ordrene, med variasjon. */
  interval: [number, number];
  lines: [number, number];
  baskets: BasketItem[];
  defaultAddress: string;
  poPrefix: string | null;
};

function spec(input: PackagingSpec): PackagingSpec {
  return input;
}

const profiles: Profile[] = [
  {
    customerId: "havbris",
    interval: [35, 50],
    lines: [2, 4],
    defaultAddress: "havbris-ellingsoy",
    poPrefix: "PO-HB-",
    baskets: [
      { sku: "0293-1", pallets: [2, 4], weight: 3 },
      { sku: "0280-1", pallets: [1, 2] },
      { sku: "0285-0", pallets: [1, 1] },
      { sku: "7002", pallets: [1, 2] },
      { sku: "9130-1", units: [4000, 12000] },
      { sku: "9110-2", units: [12, 36] },
      { sku: "9140-1", units: [200, 400] },
      { sku: "8014-0", units: [2000, 5000], weight: 2 },
    ],
  },
  {
    customerId: "lunde",
    interval: [45, 70],
    lines: [1, 3],
    defaultAddress: "lunde-bakeri",
    poPrefix: null,
    baskets: [
      { sku: "6721", units: [12, 40] },
      { sku: "6723-2", units: [8, 24] },
      { sku: "3065", units: [50, 150] },
      { sku: "9101-1", units: [36, 72] },
      {
        custom: {
          name: "Brødeske med logo, 400 x 300 x 150 mm",
          unitPrice: 11.9,
          customSpec: spec({
            style: "0201",
            innerDimensionsMm: { length: 400, width: 300, height: 150 },
            board: "B-bølge",
            color: "Hvit",
            print: { colors: 2, description: "Logo Lunde Bakeri på to sider" },
            notes: null,
          }),
        },
        units: [500, 1000],
        weight: 3,
      },
      {
        custom: {
          name: "Kakeeske med vindu, 250 x 250 x 100 mm",
          unitPrice: 6.4,
          customSpec: spec({
            style: "0427",
            innerDimensionsMm: { length: 250, width: 250, height: 100 },
            board: "E-bølge",
            color: "Hvit",
            print: { colors: 1, description: "Logo på lokket, vindu i PET" },
            notes: "Vindu 120 x 120 mm sentrert på lokket",
          }),
        },
        units: [1000, 2000],
        weight: 2,
      },
    ],
  },
  {
    customerId: "nordlys",
    interval: [40, 60],
    lines: [2, 4],
    defaultAddress: "nordlys-lager",
    poPrefix: "NL-",
    baskets: [
      { sku: "9101-1", units: [36, 108], weight: 2 },
      { sku: "9101-2", units: [36, 72] },
      { sku: "9110-1", units: [6, 24] },
      {
        custom: {
          name: "Forsendelseseske, 300 x 200 x 150 mm",
          unitPrice: 6.9,
          customSpec: spec({
            style: "0201",
            innerDimensionsMm: { length: 300, width: 200, height: 150 },
            board: "B-bølge",
            color: "Brun",
            print: null,
            notes: null,
          }),
        },
        units: [500, 1500],
        weight: 2,
      },
      {
        custom: {
          name: "Forsendelseseske, 400 x 300 x 200 mm",
          unitPrice: 9.4,
          customSpec: spec({
            style: "0201",
            innerDimensionsMm: { length: 400, width: 300, height: 200 },
            board: "B-bølge",
            color: "Brun",
            print: null,
            notes: null,
          }),
        },
        units: [300, 800],
      },
      {
        custom: {
          name: "Gaveeske med logo, 300 x 200 x 80 mm",
          unitPrice: 9.8,
          customSpec: spec({
            style: "0427",
            innerDimensionsMm: { length: 300, width: 200, height: 80 },
            board: "E-bølge",
            color: "Sort",
            print: { colors: 1, description: "Hvit logo på lokket" },
            notes: null,
          }),
        },
        units: [1000, 1500],
      },
    ],
  },
];

function weightedPick<T extends { weight?: number }>(items: T[], exclude: Set<T>): T {
  const pool = items.filter((item) => !exclude.has(item));
  const total = pool.reduce((sum, item) => sum + (item.weight ?? 1), 0);
  let r = random() * total;
  for (const item of pool) {
    r -= item.weight ?? 1;
    if (r <= 0) return item;
  }
  return pool[pool.length - 1];
}

function statusFor(createdAt: Date, hasMadeToOrder: boolean): OrderStatus {
  const age = (NOW.getTime() - createdAt.getTime()) / 86_400_000;
  if (age > 25) return "delivered";
  if (age > 12) return chance(0.7) ? "delivered" : "shipped";
  if (age > 5) return hasMadeToOrder ? "inProduction" : "shipped";
  return "confirmed";
}

const isoDate = (d: Date) => d.toISOString().slice(0, 10);

async function main() {
  const catalog = JSON.parse(await readFile(path.join(DATA, "catalog.json"), "utf8")) as {
    products: Product[];
  };
  const customers = JSON.parse(await readFile(path.join(DATA, "customers.json"), "utf8")) as Customer[];

  const variants = new Map<string, { product: Product; variant: Variant }>();
  for (const product of catalog.products) {
    for (const variant of product.variants) variants.set(variant.sku, { product, variant });
  }

  // Priser og lager
  const prices: Record<string, number> = {};
  const stock: Record<string, InventoryInfo> = {};
  for (const { product, variant } of variants.values()) {
    reseed(`pris:${variant.sku}`);
    if (variant.salesMode !== "quote") prices[variant.sku] = listPrice(product, variant);
    reseed(`lager:${variant.sku}`);
    stock[variant.sku] = inventory(variant);
  }

  // Ordre
  const drafts: Omit<Order, "orderNumber">[] = [];
  const start = new Date(NOW.getTime() - 548 * 86_400_000);
  for (const profile of profiles) {
    const customer = customers.find((c) => c.id === profile.customerId)!;
    reseed(`ordre:${customer.id}`);
    let date = new Date(start.getTime() + between(0, 30) * 86_400_000);
    while (date < NOW) {
      const lineCount = between(...profile.lines);
      const chosen = new Set<BasketItem>();
      // Havbris bestiller nesten alltid fiskekasser.
      if (profile.customerId === "havbris" && chance(0.85)) chosen.add(profile.baskets[0]);
      while (chosen.size < Math.min(lineCount, profile.baskets.length)) {
        chosen.add(weightedPick(profile.baskets, chosen));
      }

      let hasMadeToOrder = false;
      const lines: OrderLine[] = [...chosen].map((item, i) => {
        const id = `l${i + 1}`;
        if ("custom" in item) {
          hasMadeToOrder = true;
          const quantity = Math.round(between(...item.units) / 100) * 100;
          return { id, sku: null, productSlug: null, quantity, ...item.custom };
        }
        const entry = variants.get(item.sku);
        if (!entry) throw new Error(`Ukjent varenummer i profil: ${item.sku}`);
        const { product, variant } = entry;
        if (variant.salesMode !== "stock") hasMadeToOrder = true;
        const bundle = Math.max(1, variant.unitsPerBundle);
        const quantity =
          "pallets" in item
            ? between(...item.pallets) * (variant.unitsPerPallet ?? bundle * 20)
            : Math.max(bundle, Math.round(between(...item.units) / bundle) * bundle);
        let unitPrice: number;
        if (variant.salesMode === "quote") {
          // Kundetilpasset kartong med avtalt pris.
          unitPrice = 14.5;
        } else {
          const price = computePrice(
            variant.sku,
            prices[variant.sku],
            variant,
            product.type,
            customer.priceAgreement,
          );
          // Eldre ordre har litt lavere pris (prisjustering i januar).
          const adjustment = date.getFullYear() < 2026 ? 0.96 : 1;
          unitPrice = Math.round(unitPriceFor(price, quantity) * adjustment * 10) / 10;
        }
        return {
          id,
          sku: variant.sku,
          productSlug: product.slug,
          name: variant.name,
          quantity,
          unitPrice,
          customSpec: null,
        };
      });

      const net = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
      const address =
        customer.addresses.find((a) => a.id === profile.defaultAddress && chance(0.8)) ??
        pick(customer.addresses);
      const createdAt = new Date(date);
      createdAt.setHours(between(7, 15), between(0, 59), 0, 0);
      drafts.push({
        customerId: customer.id,
        createdAt: createdAt.toISOString(),
        status: statusFor(createdAt, hasMadeToOrder),
        lines,
        deliveryAddress: address,
        poNumber: profile.poPrefix ? `${profile.poPrefix}${between(1000, 9999)}` : null,
        requestedDeliveryDate: chance(0.7)
          ? isoDate(new Date(createdAt.getTime() + between(7, 21) * 86_400_000))
          : null,
        note: null,
        orderedBy: pick(customer.users).name,
        totals: calculateTotals(net, customer.freeShippingThreshold),
        basedOn: null,
      });

      date = new Date(date.getTime() + between(...profile.interval) * 86_400_000);
    }
  }

  drafts.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const orders: Order[] = drafts.map((draft, i) => ({
    orderNumber: String(FIRST_ORDER_NUMBER + i),
    ...draft,
  }));

  // Noen av Havbris' ordre er gjenkjøp av forrige ordre.
  const havbris = orders.filter((o) => o.customerId === "havbris");
  const havbrisCustomer = customers.find((c) => c.id === "havbris")!;
  for (let i = 1; i < havbris.length; i += 3) {
    const previous = havbris[i - 1];
    const order = havbris[i];
    order.basedOn = { orderNumber: previous.orderNumber, kind: "reorder" };
    order.lines = previous.lines.map((line) => ({ ...line }));
    const net = order.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
    order.totals = calculateTotals(net, havbrisCustomer.freeShippingThreshold);
  }

  await writeFile(path.join(DATA, "prices.json"), JSON.stringify(prices, null, 2) + "\n");
  await writeFile(path.join(DATA, "inventory.json"), JSON.stringify(stock, null, 2) + "\n");
  await writeFile(path.join(DATA, "orders.json"), JSON.stringify(orders, null, 2) + "\n");

  console.log(`Priser: ${Object.keys(prices).length}, lager: ${Object.keys(stock).length}`);
  for (const c of customers) {
    const own = orders.filter((o) => o.customerId === c.id);
    console.log(`${c.name}: ${own.length} ordre (${own.map((o) => o.orderNumber).join(", ")})`);
  }
}

await main();

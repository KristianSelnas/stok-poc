import "server-only";

import type { PackagingSpec, Product, Variant } from "./domain";
import { shop } from "./index";

export type FrequentItem = {
  product: Product;
  variant: Variant;
  /** Antall ordre varen er med i. */
  timesOrdered: number;
  lastQuantity: number;
  lastOrderedAt: string;
};

/**
 * Varene kunden kjøper oftest, ut fra de siste ordrene. Brukes i «Kjøp igjen».
 * Skreddersydde linjer og varer som krever tilbud, er ikke med.
 */
export async function getFrequentItems(customerId: string, limit = 4): Promise<FrequentItem[]> {
  const { orders, catalog } = shop();
  const summaries = (await orders.listOrders(customerId)).slice(0, 12);
  const full = await Promise.all(summaries.map((s) => orders.getOrder(customerId, s.orderNumber)));

  const stats = new Map<string, { times: number; lastQuantity: number; lastOrderedAt: string }>();
  for (const order of full) {
    if (!order) continue;
    for (const line of order.lines) {
      if (!line.sku) continue;
      const current = stats.get(line.sku);
      // Ordrene er sortert med nyeste først, så første treff er siste bestilling.
      if (current) current.times += 1;
      else stats.set(line.sku, { times: 1, lastQuantity: line.quantity, lastOrderedAt: order.createdAt });
    }
  }

  const ranked = [...stats.entries()].sort(
    (a, b) => b[1].times - a[1].times || b[1].lastOrderedAt.localeCompare(a[1].lastOrderedAt),
  );
  const items: FrequentItem[] = [];
  for (const [sku, stat] of ranked) {
    const entry = await catalog.getVariant(sku);
    if (!entry || entry.variant.salesMode === "quote") continue;
    items.push({
      ...entry,
      timesOrdered: stat.times,
      lastQuantity: stat.lastQuantity,
      lastOrderedAt: stat.lastOrderedAt,
    });
    if (items.length >= limit) break;
  }
  return items;
}

export type CustomPackaging = {
  name: string;
  spec: PackagingSpec;
  lastUnitPrice: number;
  lastQuantity: number;
  lastOrderedAt: string;
  timesOrdered: number;
  /** Siste ordrelinje, brukt som original for «Lag variant» og «Bestill på nytt». */
  lastOrderNumber: string;
  lastLineId: string;
};

/** Kundens skreddersydde emballasjer, samlet fra ordrehistorikken. Nyeste først. */
export async function getCustomPackagings(customerId: string): Promise<CustomPackaging[]> {
  const { orders } = shop();
  const summaries = await orders.listOrders(customerId);
  const full = await Promise.all(summaries.map((s) => orders.getOrder(customerId, s.orderNumber)));
  const byName = new Map<string, CustomPackaging>();
  for (const order of full) {
    if (!order) continue;
    for (const line of order.lines) {
      if (!line.customSpec) continue;
      const existing = byName.get(line.name);
      if (existing) {
        existing.timesOrdered += 1;
        continue;
      }
      byName.set(line.name, {
        name: line.name,
        spec: line.customSpec,
        lastUnitPrice: line.unitPrice,
        lastQuantity: line.quantity,
        lastOrderedAt: order.createdAt,
        timesOrdered: 1,
        lastOrderNumber: order.orderNumber,
        lastLineId: line.id,
      });
    }
  }
  return [...byName.values()];
}

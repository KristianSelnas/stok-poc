import "server-only";

import type { Customer, InventoryInfo, Order, Product, ProductGroup, Taxon } from "../domain";
import catalogJson from "./data/catalog.json";
import customersJson from "./data/customers.json";
import inventoryJson from "./data/inventory.json";
import ordersJson from "./data/orders.json";
import pricesJson from "./data/prices.json";

/**
 * Mockdataene. JSON-filene lages av skriptene i scripts/shop/ og er sjekket inn.
 * Typene settes her, så resten av mocken bruker domenetypene.
 */
export const catalogData = catalogJson as unknown as {
  groups: ProductGroup[];
  industries: Taxon[];
  materials: Taxon[];
  products: Product[];
};
export const customersData = customersJson as unknown as Customer[];
export const inventoryData = inventoryJson as unknown as Record<string, InventoryInfo>;
export const ordersData = ordersJson as unknown as Order[];
export const pricesData = pricesJson as unknown as Record<string, number>;

/** Kunstig forsinkelse, så lastetilstander blir synlige. Styres av `SHOP_MOCK_LATENCY_MS`. */
export async function latency(): Promise<void> {
  const ms = Number(process.env.SHOP_MOCK_LATENCY_MS ?? 150);
  if (ms > 0) await new Promise((resolve) => setTimeout(resolve, ms));
}

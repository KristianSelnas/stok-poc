import "server-only";

import type { MarketId } from "@/lib/markets";

import type { CatalogService, ShopServices } from "../services";
import { mockCatalog, mockCatalogIs } from "./catalog";
import { mockCustomers } from "./customers";
import { mockInventory } from "./inventory";
import { mockOrders, resetMockOrders } from "./orders";
import { mockPricing } from "./pricing";
import { mockQuotes, resetMockQuotes } from "./quotes";

export const mockServices: ShopServices = {
  catalog: mockCatalog,
  inventory: mockInventory,
  pricing: mockPricing,
  customers: mockCustomers,
  orders: mockOrders,
  quotes: mockQuotes,
};

/** Katalogen per marked, til nettsidens produktsider. Nettbutikken bruker bare den norske. */
export const mockMarketCatalogs: Record<MarketId, CatalogService> = { no: mockCatalog, is: mockCatalogIs };

/** Nullstiller demoen: sletter ordre og forespørsler som er lagt inn siden oppstart. */
export function resetMockData() {
  resetMockOrders();
  resetMockQuotes();
}

import "server-only";

import type { ShopServices } from "../services";
import { mockCatalog } from "./catalog";
import { mockCustomers } from "./customers";
import { mockInventory } from "./inventory";
import { mockOrders, resetMockOrders } from "./orders";
import { mockPricing } from "./pricing";

export const mockServices: ShopServices = {
  catalog: mockCatalog,
  inventory: mockInventory,
  pricing: mockPricing,
  customers: mockCustomers,
  orders: mockOrders,
};

/** Nullstiller demoen: sletter ordre som er lagt inn siden oppstart. */
export function resetMockData() {
  resetMockOrders();
}

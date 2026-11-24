import type { CatalogService } from "./catalog";
import type { CustomerService } from "./customers";
import type { InventoryService } from "./inventory";
import type { OrderService } from "./orders";
import type { PricingService } from "./pricing";

export type { CartService } from "./cart";
export type { CatalogService, CustomerService, InventoryService, OrderService, PricingService };
export { OrderError } from "./orders";

/** Tjenestene bak nettbutikken. `src/shop/index.ts` velger implementasjon. */
export type ShopServices = {
  catalog: CatalogService;
  inventory: InventoryService;
  pricing: PricingService;
  customers: CustomerService;
  orders: OrderService;
};

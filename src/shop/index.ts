import "server-only";

import type { MarketId } from "@/lib/markets";

import { mockMarketCatalogs, mockServices, resetMockData } from "./mock";
import type { CatalogService, ShopServices } from "./services";

/**
 * Velger implementasjon av tjenestene bak nettbutikken.
 *
 * `SHOP_BACKEND=mock` (standard) gir mockene i `src/shop/mock/`. En ekte
 * integrasjon legges i `src/shop/adapters/` og kobles inn her, for eksempel
 * med `SHOP_BACKEND=erp`. Sider og server actions henter alltid tjenestene
 * via `shop()`, og vet ikke hvilken implementasjon de får.
 */
const backend = process.env.SHOP_BACKEND ?? "mock";

const services: ShopServices = (() => {
  switch (backend) {
    case "mock":
      return mockServices;
    default:
      throw new Error(`Ukjent SHOP_BACKEND: «${backend}». Gyldige verdier: mock.`);
  }
})();

export function shop(): ShopServices {
  return services;
}

const marketCatalogs: Record<MarketId, CatalogService> = (() => {
  switch (backend) {
    case "mock":
      return mockMarketCatalogs;
    default:
      throw new Error(`Ukjent SHOP_BACKEND: «${backend}».`);
  }
})();

/**
 * Produktkatalogen for et marked. Nettsidens produktsider bruker denne
 * (fase N). Den norske er den samme som nettbutikkens.
 */
export function catalogFor(market: MarketId): CatalogService {
  return marketCatalogs[market];
}

/** Om demoen kan nullstilles. Gjelder bare mockene. */
export const canResetDemo = backend === "mock";

export function resetDemo() {
  if (canResetDemo) resetMockData();
}

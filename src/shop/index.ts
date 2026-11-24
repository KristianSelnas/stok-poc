import "server-only";

import { mockServices, resetMockData } from "./mock";
import type { ShopServices } from "./services";

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

/** Om demoen kan nullstilles. Gjelder bare mockene. */
export const canResetDemo = backend === "mock";

export function resetDemo() {
  if (canResetDemo) resetMockData();
}

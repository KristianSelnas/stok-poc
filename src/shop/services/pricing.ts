import type { PriceInfo } from "../domain";

/**
 * Priser per variant. Med kunde-ID gir den kundens avtalepris, uten gir den listepris.
 * Varer som krever tilbud, har ingen pris og mangler i svaret.
 * Ekte implementasjon: adapter mot ERP.
 */
export interface PricingService {
  getPrices(skus: string[], customerId?: string): Promise<Record<string, PriceInfo>>;
}

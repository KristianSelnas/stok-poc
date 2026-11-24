import "server-only";

import type { PriceInfo } from "../domain";
import type { PricingService } from "../services";
import { catalogData, customersData, latency, pricesData } from "./data";
import { computePrice } from "./rules";

const variants = new Map(
  catalogData.products.flatMap((product) =>
    product.variants.map((variant) => [variant.sku, { product, variant }]),
  ),
);

export const mockPricing: PricingService = {
  async getPrices(skus, customerId) {
    await latency();
    const agreement = customersData.find((c) => c.id === customerId)?.priceAgreement ?? null;
    const result: Record<string, PriceInfo> = {};
    for (const sku of skus) {
      const listPrice = pricesData[sku];
      const entry = variants.get(sku);
      if (listPrice === undefined || !entry) continue;
      result[sku] = computePrice(sku, listPrice, entry.variant, entry.product.type, agreement);
    }
    return result;
  },
};

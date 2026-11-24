import "server-only";

import type { InventoryInfo } from "../domain";
import type { InventoryService } from "../services";
import { inventoryData, latency } from "./data";

export const mockInventory: InventoryService = {
  async getInventory(skus) {
    await latency();
    const result: Record<string, InventoryInfo> = {};
    for (const sku of skus) if (inventoryData[sku]) result[sku] = inventoryData[sku];
    return result;
  },
};

import type { InventoryInfo } from "../domain";

/**
 * Lagerstatus og leveringstid per variant.
 * Ekte implementasjon: adapter mot ERP.
 */
export interface InventoryService {
  getInventory(skus: string[]): Promise<Record<string, InventoryInfo>>;
}

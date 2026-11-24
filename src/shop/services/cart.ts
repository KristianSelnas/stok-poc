import type { Cart } from "../domain";

/**
 * Handlekurven. Den ligger i BFF-en, også når de andre tjenestene er ekte.
 * Implementasjonen i `src/shop/cart.ts` lagrer kurven i en cookie.
 */
export interface CartService {
  getCart(): Promise<Cart>;
  setQuantity(sku: string, quantity: number): Promise<Cart>;
  add(sku: string, quantity: number): Promise<Cart>;
  remove(sku: string): Promise<Cart>;
  clear(): Promise<void>;
}

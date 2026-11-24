import "server-only";

import { cookies } from "next/headers";

import type { Cart, CartLine } from "./domain";
import type { CartService } from "./services";

/**
 * Handlekurven ligger i en cookie i nettleseren, på formen «sku*antall|sku*antall».
 * Den overlever derfor omstart av serveren. Endringer må skje i server actions.
 */
const CART_COOKIE = "stok-handlekurv";
const MAX_LINES = 50;

function parse(value: string | undefined): Cart {
  const lines: CartLine[] = [];
  for (const part of (value ?? "").split("|")) {
    const [sku, quantity] = part.split("*");
    const n = Number(quantity);
    if (sku && Number.isInteger(n) && n > 0) lines.push({ sku, quantity: n });
  }
  return { lines: lines.slice(0, MAX_LINES) };
}

async function write(cart: Cart): Promise<Cart> {
  const store = await cookies();
  if (!cart.lines.length) {
    store.delete(CART_COOKIE);
    return cart;
  }
  store.set(CART_COOKIE, cart.lines.map((l) => `${l.sku}*${l.quantity}`).join("|"), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return cart;
}

export const cookieCart: CartService = {
  async getCart() {
    return parse((await cookies()).get(CART_COOKIE)?.value);
  },
  async setQuantity(sku, quantity) {
    const cart = await this.getCart();
    const lines =
      quantity > 0
        ? cart.lines.some((l) => l.sku === sku)
          ? cart.lines.map((l) => (l.sku === sku ? { sku, quantity } : l))
          : [...cart.lines, { sku, quantity }]
        : cart.lines.filter((l) => l.sku !== sku);
    return write({ lines });
  },
  async add(sku, quantity) {
    const existing = (await this.getCart()).lines.find((l) => l.sku === sku)?.quantity ?? 0;
    return this.setQuantity(sku, existing + quantity);
  },
  async remove(sku) {
    return this.setQuantity(sku, 0);
  },
  async clear() {
    await write({ lines: [] });
  },
};

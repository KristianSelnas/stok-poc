import "server-only";

import type { InventoryInfo, OrderTotals, PriceInfo, Product, Variant } from "./domain";
import { cookieCart } from "./cart";
import { shop } from "./index";
import { calculateTotals, unitPriceFor } from "./mock/rules";
import type { Session } from "./session";

export type CartViewLine = {
  sku: string;
  quantity: number;
  product: Product;
  variant: Variant;
  price: PriceInfo | null;
  inventory: InventoryInfo | null;
  unitPrice: number | null;
  lineTotal: number | null;
};

export type CartView = { lines: CartViewLine[]; totals: OrderTotals; count: number };

/** Standard grense for fraktfri levering når ingen kunde er logget inn. */
const DEFAULT_FREE_SHIPPING = 5000;

/** Handlekurven med produkt, pris og lager per linje. Ukjente varenumre hoppes over. */
export async function getCartView(session: Session | null): Promise<CartView> {
  const cart = await cookieCart.getCart();
  const { catalog, pricing, inventory } = shop();
  const skus = cart.lines.map((l) => l.sku);
  const [prices, stock, entries] = await Promise.all([
    pricing.getPrices(skus, session?.customer.id),
    inventory.getInventory(skus),
    Promise.all(skus.map((sku) => catalog.getVariant(sku))),
  ]);

  const lines: CartViewLine[] = cart.lines.flatMap((line, i) => {
    const entry = entries[i];
    if (!entry) return [];
    const price = prices[line.sku] ?? null;
    const unitPrice = price ? unitPriceFor(price, line.quantity) : null;
    return [
      {
        sku: line.sku,
        quantity: line.quantity,
        product: entry.product,
        variant: entry.variant,
        price,
        inventory: stock[line.sku] ?? null,
        unitPrice,
        lineTotal: unitPrice !== null ? Math.round(unitPrice * line.quantity * 100) / 100 : null,
      },
    ];
  });

  const net = lines.reduce((sum, l) => sum + (l.lineTotal ?? 0), 0);
  const threshold = session?.customer.freeShippingThreshold ?? DEFAULT_FREE_SHIPPING;
  return { lines, totals: calculateTotals(net, threshold), count: lines.length };
}

/** Antall linjer i kurven, til ikonet i headeren. */
export async function getCartCount(): Promise<number> {
  return (await cookieCart.getCart()).lines.length;
}

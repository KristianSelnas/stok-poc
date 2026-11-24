import "server-only";

import type { Order, OrderLine, OrderSummary } from "../domain";
import { OrderError, type OrderService } from "../services";
import { customersData, latency, ordersData } from "./data";
import { mockCatalog } from "./catalog";
import { mockPricing } from "./pricing";
import { calculateTotals, roundToBundle, unitPriceFor } from "./rules";

/**
 * Ordre som legges inn i demoen, ligger i minnet. De ligger på `globalThis`,
 * så de overlever hot reload under utvikling. På Vercel forsvinner de hvis
 * plattformen starter en ny instans (beslutning N8).
 */
const store = globalThis as typeof globalThis & { __stokDemoOrders?: Order[] };
const placedOrders = () => (store.__stokDemoOrders ??= []);

/** Sletter ordrene som er lagt inn i demoen. */
export function resetMockOrders() {
  store.__stokDemoOrders = [];
}

function allOrders(customerId: string): Order[] {
  return [...ordersData, ...placedOrders()]
    .filter((o) => o.customerId === customerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function nextOrderNumber(): string {
  const numbers = [...ordersData, ...placedOrders()].map((o) => Number(o.orderNumber));
  return String(Math.max(...numbers) + 1);
}

function summarize(order: Order): OrderSummary {
  return {
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    status: order.status,
    poNumber: order.poNumber,
    totals: order.totals,
    basedOn: order.basedOn,
    lineCount: order.lines.length,
    firstLineName: order.lines[0]?.name ?? "",
  };
}

export const mockOrders: OrderService = {
  async listOrders(customerId) {
    await latency();
    return allOrders(customerId).map(summarize);
  },

  async getOrder(customerId, orderNumber) {
    await latency();
    return allOrders(customerId).find((o) => o.orderNumber === orderNumber) ?? null;
  },

  async placeOrder(customerId, input) {
    const customer = customersData.find((c) => c.id === customerId);
    if (!customer) throw new OrderError("Fant ikke kunden.");
    if (!input.lines.length) throw new OrderError("Handlekurven er tom.");
    const address = customer.addresses.find((a) => a.id === input.deliveryAddressId);
    if (!address) throw new OrderError("Velg en leveringsadresse.");

    const prices = await mockPricing.getPrices(
      input.lines.map((l) => l.sku),
      customerId,
    );
    const lines: OrderLine[] = [];
    for (const [i, line] of input.lines.entries()) {
      const entry = await mockCatalog.getVariant(line.sku);
      const price = prices[line.sku];
      if (!entry || !price || entry.variant.salesMode === "quote") {
        throw new OrderError(`Varen ${line.sku} kan ikke bestilles i nettbutikken.`);
      }
      const quantity = roundToBundle(line.quantity, entry.variant.unitsPerBundle);
      lines.push({
        id: `l${i + 1}`,
        sku: line.sku,
        productSlug: entry.product.slug,
        name: entry.variant.name,
        quantity,
        unitPrice: unitPriceFor(price, quantity),
        customSpec: null,
      });
    }

    const net = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);
    const order: Order = {
      orderNumber: nextOrderNumber(),
      customerId,
      createdAt: new Date().toISOString(),
      status: "received",
      lines,
      deliveryAddress: address,
      poNumber: input.poNumber,
      requestedDeliveryDate: input.requestedDeliveryDate,
      note: input.note,
      orderedBy: input.orderedBy,
      totals: calculateTotals(net, customer.freeShippingThreshold),
      basedOn: input.basedOn ?? null,
    };
    placedOrders().push(order);
    return order;
  },
};

import "server-only";

import type { QuoteRequest } from "../domain";
import type { QuoteService } from "../services";
import { diffSpec } from "../specs";
import { latency, ordersData } from "./data";
import { estimateVariantUnitPrice } from "./rules";
import { placedOrders } from "./orders";

/**
 * Forespørsler ligger i minnet, på samme måte som nye ordre (beslutning N8).
 * I en ekte løsning blir forespørselen en sak i CRM.
 */
const store = globalThis as typeof globalThis & { __stokDemoQuotes?: QuoteRequest[] };
const requests = () => (store.__stokDemoQuotes ??= []);

export function resetMockQuotes() {
  store.__stokDemoQuotes = [];
}

function nextId(): string {
  return `T-${String(2401 + requests().length)}`;
}

export const mockQuotes: QuoteService = {
  async createRequest(customerId, input) {
    await latency();
    let original: QuoteRequest["original"] = null;
    if (input.basedOn) {
      const order = [...ordersData, ...placedOrders()].find(
        (o) => o.customerId === customerId && o.orderNumber === input.basedOn!.orderNumber,
      );
      const line = order?.lines.find((l) => l.id === input.basedOn!.lineId);
      if (line?.customSpec) {
        original = { spec: line.customSpec, quantity: line.quantity, unitPrice: line.unitPrice };
      }
    }
    const next = { spec: input.spec, quantity: input.quantity };
    const request: QuoteRequest = {
      id: nextId(),
      customerId,
      createdAt: new Date().toISOString(),
      status: "submitted",
      requestedBy: input.requestedBy,
      name: input.name,
      spec: input.spec,
      quantity: input.quantity,
      basedOn: original ? input.basedOn : null,
      original,
      changes: original ? diffSpec(original, next) : [],
      estimatedUnitPrice: original ? estimateVariantUnitPrice(original, next) : null,
      note: input.note,
    };
    requests().push(request);
    return request;
  },

  async listRequests(customerId) {
    await latency();
    return requests()
      .filter((r) => r.customerId === customerId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async getRequest(customerId, id) {
    await latency();
    return requests().find((r) => r.customerId === customerId && r.id === id) ?? null;
  },
};

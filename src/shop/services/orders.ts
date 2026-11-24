import type { Invoice, Order, OrderSummary, PlaceOrderInput } from "../domain";

/**
 * Ordre og ordrehistorikk. Kunde-ID kommer alltid fra sesjonen på serveren.
 * Ekte implementasjon: adapter mot ERP.
 */
export interface OrderService {
  /** Nyeste ordre først. */
  listOrders(customerId: string): Promise<OrderSummary[]>;
  getOrder(customerId: string, orderNumber: string): Promise<Order | null>;
  /** Kaster `OrderError` hvis en vare ikke kan bestilles. */
  placeOrder(customerId: string, input: PlaceOrderInput): Promise<Order>;
  /** Fakturaer, nyeste først. */
  listInvoices(customerId: string): Promise<Invoice[]>;
}

export class OrderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderError";
  }
}

import "server-only";

import type { CustomerService } from "../services";
import { customersData, latency } from "./data";

export const mockCustomers: CustomerService = {
  async getCustomer(id) {
    await latency();
    return customersData.find((c) => c.id === id) ?? null;
  },
  async listCustomers() {
    return customersData;
  },
};

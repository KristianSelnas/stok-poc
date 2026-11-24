import "server-only";

import { cookies } from "next/headers";

import type { Customer, CustomerUser } from "./domain";
import { shop } from "./index";

/**
 * Demoinnlogging. Cookien inneholder «kunde-ID:bruker-ID». Ekte innlogging
 * (for eksempel Entra ID eller BankID for bedrift) erstatter bare denne filen.
 */
export const SESSION_COOKIE = "stok-demo-session";

export type Session = { customer: Customer; user: CustomerUser };

export async function getSession(): Promise<Session | null> {
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!value) return null;
  const [customerId, userId] = value.split(":");
  const customer = await shop().customers.getCustomer(customerId);
  const user = customer?.users.find((u) => u.id === userId) ?? customer?.users[0];
  return customer && user ? { customer, user } : null;
}

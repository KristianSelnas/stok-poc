"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { cookieCart } from "./cart";
import { t } from "./dictionary";
import { canResetDemo, resetDemo, shop } from "./index";
import { roundToBundle } from "./mock/rules";
import { shopPath } from "./paths";
import { OrderError } from "./services";
import { getSession, SESSION_COOKIE } from "./session";

/*
 * Server actions for nettbutikken. Alle kan kalles direkte med POST, så hver
 * action sjekker input og sesjon selv. Kunde-ID kommer alltid fra cookien,
 * aldri fra skjemaet.
 */

export type ActionState = { ok: boolean; message: string } | null;

const text = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
};

/** Bare interne stier i butikken er gyldige mål etter innlogging. */
function safeNext(value: string): string {
  return value.startsWith(shopPath()) && !value.startsWith("//") ? value : shopPath();
}

export async function login(formData: FormData) {
  const customer = await shop().customers.getCustomer(text(formData, "customerId"));
  if (!customer) redirect(shopPath("/logg-inn"));
  const user = customer.users.find((u) => u.id === text(formData, "userId")) ?? customer.users[0];
  (await cookies()).set(SESSION_COOKIE, `${customer.id}:${user.id}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect(safeNext(text(formData, "next")));
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect(shopPath());
}

export async function resetDemoData() {
  if (canResetDemo) {
    resetDemo();
    await cookieCart.clear();
  }
  redirect(`${shopPath("/logg-inn")}?nullstilt=1`);
}

async function orderableVariant(sku: string) {
  const entry = await shop().catalog.getVariant(sku);
  return entry && entry.variant.salesMode !== "quote" ? entry.variant : null;
}

export async function addToCart(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const variant = await orderableVariant(text(formData, "sku"));
  if (!variant) return { ok: false, message: t.errorNotOrderable };
  const quantity = Number(text(formData, "quantity"));
  if (!Number.isFinite(quantity) || quantity <= 0) return { ok: false, message: t.errorQuantity };
  const rounded = roundToBundle(quantity, variant.unitsPerBundle);
  await cookieCart.add(variant.sku, rounded);
  return {
    ok: true,
    message: rounded !== quantity ? `${t.addedToCart} ${t.roundedUp(rounded)}` : t.addedToCart,
  };
}

/** Legger en vare i kurven uten tilbakemelding i skjemaet. Brukes av «Kjøp igjen». */
export async function quickAddToCart(formData: FormData) {
  const variant = await orderableVariant(text(formData, "sku"));
  const quantity = Number(text(formData, "quantity"));
  if (!variant || !Number.isFinite(quantity) || quantity <= 0) return;
  await cookieCart.add(variant.sku, roundToBundle(quantity, variant.unitsPerBundle));
}

export async function updateCartLine(formData: FormData) {
  const sku = text(formData, "sku");
  const variant = await orderableVariant(sku);
  const quantity = Number(text(formData, "quantity"));
  if (!variant || !Number.isFinite(quantity) || quantity <= 0) {
    await cookieCart.remove(sku);
    return;
  }
  await cookieCart.setQuantity(sku, roundToBundle(quantity, variant.unitsPerBundle));
}

export async function removeCartLine(formData: FormData) {
  await cookieCart.remove(text(formData, "sku"));
}

export async function placeOrder(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { ok: false, message: t.errorLoginRequired };
  const cart = await cookieCart.getCart();

  const date = text(formData, "requestedDeliveryDate");
  let orderNumber: string;
  try {
    const order = await shop().orders.placeOrder(session.customer.id, {
      lines: cart.lines,
      deliveryAddressId: text(formData, "deliveryAddressId"),
      poNumber: text(formData, "poNumber").slice(0, 40) || null,
      requestedDeliveryDate: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null,
      note: text(formData, "note").slice(0, 500) || null,
      orderedBy: session.user.name,
    });
    orderNumber = order.orderNumber;
  } catch (error) {
    return { ok: false, message: error instanceof OrderError ? error.message : t.errorGeneric };
  }

  await cookieCart.clear();
  redirect(`${shopPath("/bekreftelse")}?ordre=${encodeURIComponent(orderNumber)}`);
}

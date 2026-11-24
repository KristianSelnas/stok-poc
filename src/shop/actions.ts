"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { cookieCart, getCartOrigin, setCartOrigin } from "./cart";
import { t } from "./dictionary";
import { canResetDemo, resetDemo, shop } from "./index";
import { roundToBundle } from "./mock/rules";
import { minSidePath, shopPath } from "./paths";
import { specName } from "./specs";
import type { PackagingSpec } from "./domain";
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
  const allowed = [shopPath(), minSidePath()].some((prefix) => value.startsWith(prefix));
  return allowed && !value.startsWith("//") ? value : shopPath();
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
  const origin = await getCartOrigin();
  let orderNumber: string;
  try {
    const order = await shop().orders.placeOrder(session.customer.id, {
      lines: cart.lines,
      deliveryAddressId: text(formData, "deliveryAddressId"),
      poNumber: text(formData, "poNumber").slice(0, 40) || null,
      requestedDeliveryDate: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null,
      note: text(formData, "note").slice(0, 500) || null,
      orderedBy: session.user.name,
      basedOn: origin ? { orderNumber: origin, kind: "reorder" } : null,
    });
    orderNumber = order.orderNumber;
  } catch (error) {
    return { ok: false, message: error instanceof OrderError ? error.message : t.errorGeneric };
  }

  await cookieCart.clear();
  redirect(`${shopPath("/bekreftelse")}?ordre=${encodeURIComponent(orderNumber)}`);
}

// ---------------------------------------------------------------------------
// Min side
// ---------------------------------------------------------------------------

/** Legger katalogvarene fra en tidligere ordre i kurven, med samme antall. */
export async function reorder(formData: FormData) {
  const orderNumber = text(formData, "orderNumber");
  const session = await getSession();
  if (!session) redirect(shopPath("/logg-inn"));
  const order = await shop().orders.getOrder(session.customer.id, orderNumber);
  if (!order) redirect(minSidePath("/ordre"));
  for (const line of order.lines) {
    if (!line.sku) continue;
    const variant = await orderableVariant(line.sku);
    if (variant) await cookieCart.add(variant.sku, roundToBundle(line.quantity, variant.unitsPerBundle));
  }
  await setCartOrigin(order.orderNumber);
  redirect(`${shopPath("/handlekurv")}?fra=${encodeURIComponent(order.orderNumber)}`);
}

/** Variant av en katalogvare: en annen variant av samme produkt i kurven. */
export async function addVariantToCart(formData: FormData) {
  const variant = await orderableVariant(text(formData, "sku"));
  const quantity = Number(text(formData, "quantity"));
  if (variant && Number.isFinite(quantity) && quantity > 0) {
    await cookieCart.add(variant.sku, roundToBundle(quantity, variant.unitsPerBundle));
  }
  redirect(shopPath("/handlekurv"));
}

export type VariantFormState = { ok: false; message: string; fields?: Record<string, string> } | null;

const MM = { min: 30, max: 2000 };

/**
 * Lager en forespørsel på en variant av en skreddersydd ordrelinje.
 * Originalen hentes fra ordren på serveren, så diffen alltid er mot det kunden faktisk kjøpte.
 */
export async function createVariantRequest(
  _prev: VariantFormState,
  formData: FormData,
): Promise<VariantFormState> {
  const session = await getSession();
  if (!session) return { ok: false, message: t.errorLoginRequired };
  const order = await shop().orders.getOrder(session.customer.id, text(formData, "orderNumber"));
  const line = order?.lines.find((l) => l.id === text(formData, "lineId"));
  if (!order || !line?.customSpec) return { ok: false, message: t.errorGeneric };

  const fields: Record<string, string> = {};
  const mm = (key: string) => {
    const n = Math.round(Number(text(formData, key)));
    if (!Number.isFinite(n) || n < MM.min || n > MM.max) fields[key] = t.errorMm(MM.min, MM.max);
    return n;
  };
  const length = mm("length");
  const width = mm("width");
  const height = mm("height");
  const quantity = Math.round(Number(text(formData, "quantity")));
  if (!Number.isFinite(quantity) || quantity < 100) fields.quantity = t.errorMinQuantity(100);
  const colors = Math.max(0, Math.min(4, Math.round(Number(text(formData, "printColors")) || 0)));
  if (Object.keys(fields).length) return { ok: false, message: t.errorFixFields, fields };

  const spec: PackagingSpec = {
    style: line.customSpec.style,
    innerDimensionsMm: { length, width, height },
    board: text(formData, "board") || line.customSpec.board,
    color: text(formData, "color") || line.customSpec.color,
    print:
      colors > 0
        ? { colors, description: text(formData, "printDescription").slice(0, 200) || "Trykk" }
        : null,
    notes: text(formData, "notes").slice(0, 300) || null,
  };

  const request = await shop().quotes.createRequest(session.customer.id, {
    name: specName(line.name, spec),
    spec,
    quantity,
    basedOn: { orderNumber: order.orderNumber, lineId: line.id },
    note: text(formData, "note").slice(0, 500) || null,
    requestedBy: session.user.name,
  });
  redirect(`${minSidePath("/foresporsler")}?ny=${encodeURIComponent(request.id)}`);
}

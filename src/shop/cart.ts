import "server-only";

import { cookies } from "next/headers";

import type { Cart, CartLine } from "./domain";
import type { CartService } from "./services";
import { getSession } from "./session";

/**
 * Handlekurven ligger i en cookie i nettleseren, på formen «sku*antall|sku*antall».
 * Den overlever derfor omstart av serveren. Endringer må skje i server actions.
 *
 * Hver bruker har sin egen cookie, med kunde-ID og bruker-ID i navnet. Etter
 * utlogging ser nettleseren bare gjestekurven, og neste bruker som logger inn
 * på samme maskin, ser ikke kurven til den forrige. Gjestekurven flettes inn i
 * brukerens kurv ved innlogging (`mergeGuestCart`).
 */
const CART_COOKIE = "stok-handlekurv";
/** Ordren kurven er fylt fra ved «Gjenta ordre». Følger med på ny ordre som `basedOn`. */
const ORIGIN_COOKIE = "stok-handlekurv-gjenkjop";
const MAX_LINES = 50;

type Owner = { customerId: string; userId: string };

const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge,
});

/** Cookienavnet for eieren. Uten eier er det gjestekurven. */
function cookieName(base: string, owner: Owner | null): string {
  if (!owner) return base;
  const safe = (id: string) => id.replace(/[^A-Za-z0-9_-]/g, "_");
  return `${base}.${safe(owner.customerId)}.${safe(owner.userId)}`;
}

async function currentOwner(): Promise<Owner | null> {
  const session = await getSession();
  return session ? { customerId: session.customer.id, userId: session.user.id } : null;
}

function parse(value: string | undefined): Cart {
  const lines: CartLine[] = [];
  for (const part of (value ?? "").split("|")) {
    const [sku, quantity] = part.split("*");
    const n = Number(quantity);
    if (sku && Number.isInteger(n) && n > 0) lines.push({ sku, quantity: n });
  }
  return { lines: lines.slice(0, MAX_LINES) };
}

async function read(owner: Owner | null): Promise<Cart> {
  return parse((await cookies()).get(cookieName(CART_COOKIE, owner))?.value);
}

async function write(owner: Owner | null, cart: Cart): Promise<Cart> {
  const store = await cookies();
  const name = cookieName(CART_COOKIE, owner);
  const lines = cart.lines.slice(0, MAX_LINES);
  if (!lines.length) {
    store.delete(name);
    return { lines };
  }
  store.set(name, lines.map((l) => `${l.sku}*${l.quantity}`).join("|"), cookieOptions(60 * 60 * 24 * 30));
  return { lines };
}

function withQuantity(cart: Cart, sku: string, quantity: number): Cart {
  if (quantity <= 0) return { lines: cart.lines.filter((l) => l.sku !== sku) };
  return cart.lines.some((l) => l.sku === sku)
    ? { lines: cart.lines.map((l) => (l.sku === sku ? { sku, quantity } : l)) }
    : { lines: [...cart.lines, { sku, quantity }] };
}

export const cookieCart: CartService = {
  async getCart() {
    return read(await currentOwner());
  },
  async setQuantity(sku, quantity) {
    const owner = await currentOwner();
    return write(owner, withQuantity(await read(owner), sku, quantity));
  },
  async add(sku, quantity) {
    const owner = await currentOwner();
    const cart = await read(owner);
    const existing = cart.lines.find((l) => l.sku === sku)?.quantity ?? 0;
    return write(owner, withQuantity(cart, sku, existing + quantity));
  },
  async remove(sku) {
    return this.setQuantity(sku, 0);
  },
  async clear() {
    const owner = await currentOwner();
    await write(owner, { lines: [] });
    (await cookies()).delete(cookieName(ORIGIN_COOKIE, owner));
  },
};

/**
 * Flytter gjestekurven over i kurven til brukeren som nettopp logget inn, og
 * tømmer gjestekurven. Eieren sendes inn fordi sesjonscookien er satt i samme
 * forespørsel.
 */
export async function mergeGuestCart(owner: Owner) {
  const guest = await read(null);
  if (!guest.lines.length) return;
  let cart = await read(owner);
  for (const line of guest.lines) {
    const existing = cart.lines.find((l) => l.sku === line.sku)?.quantity ?? 0;
    cart = withQuantity(cart, line.sku, existing + line.quantity);
  }
  await write(owner, cart);
  await write(null, { lines: [] });
}

/** Tømmer alle kurver i nettleseren, også de som tilhører andre brukere. */
export async function clearAllCarts() {
  const store = await cookies();
  for (const { name } of store.getAll()) {
    const isCart = [CART_COOKIE, ORIGIN_COOKIE].some((base) => name === base || name.startsWith(`${base}.`));
    if (isCart) store.delete(name);
  }
}

export async function getCartOrigin(): Promise<string | null> {
  return (await cookies()).get(cookieName(ORIGIN_COOKIE, await currentOwner()))?.value ?? null;
}

export async function setCartOrigin(orderNumber: string) {
  (await cookies()).set(
    cookieName(ORIGIN_COOKIE, await currentOwner()),
    orderNumber,
    cookieOptions(60 * 60 * 24),
  );
}

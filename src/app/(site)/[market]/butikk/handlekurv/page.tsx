import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { CartSummary } from "@/components/shop/CartSummary";
import { ProductImageBox } from "@/components/shop/ProductImageBox";
import { StockBadge } from "@/components/shop/StockBadge";
import { buttonClasses } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { removeCartLine, updateCartLine } from "@/shop/actions";
import { getCartView } from "@/shop/cart-view";
import { t } from "@/shop/dictionary";
import { formatNok } from "@/shop/format";
import { catalogPath, productPath, shopPath } from "@/shop/paths";
import { getSession } from "@/shop/session";

export const metadata: Metadata = { title: "Handlekurv" };

async function CartContents() {
  const session = await getSession();
  const cart = await getCartView(session);

  if (!cart.lines.length) {
    return (
      <div className="rounded-3xl bg-white p-8 ring-1 ring-stok-blue/10">
        <p className="text-xl font-semibold text-stok-blue">{t.cartEmpty}</p>
        <p className="mt-2">{t.cartEmptyHelp}</p>
        <Link href={catalogPath()} className={buttonClasses("primary", "mt-6")}>
          {t.seeProducts}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr_1fr] lg:items-start">
      <ul className="divide-y divide-stok-blue/10 rounded-3xl bg-white px-5 ring-1 ring-stok-blue/10">
        {cart.lines.map((line) => (
          <li key={line.sku} className="grid gap-4 py-5 sm:grid-cols-[6rem_1fr_auto] sm:items-center">
            <ProductImageBox
              image={line.variant.image ?? line.product.images[0] ?? null}
              sizes="96px"
              className="hidden aspect-square rounded-2xl sm:block"
            />
            <div>
              <Link
                href={productPath(line.product.slug)}
                className="font-semibold text-stok-blue hover:underline"
              >
                {line.variant.name}
              </Link>
              <p className="text-sm">
                {t.sku} {line.sku}
                {line.unitPrice !== null && (
                  <>
                    {" "}
                    · {formatNok(line.unitPrice)} {t.perUnit}
                  </>
                )}
              </p>
              {line.inventory && (
                <div className="mt-2">
                  <StockBadge inventory={line.inventory} />
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-end gap-3 sm:flex-col sm:items-end">
              <form action={updateCartLine} className="flex items-end gap-2">
                <input type="hidden" name="sku" value={line.sku} />
                <label className="sr-only" htmlFor={`qty-${line.sku}`}>
                  {t.quantityFor(line.variant.name)}
                </label>
                <input
                  id={`qty-${line.sku}`}
                  name="quantity"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  defaultValue={line.quantity}
                  className="w-28 rounded-full border-2 border-stok-blue/20 px-4 py-2 focus:border-stok-blue focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-full px-3 py-2 text-sm font-semibold text-stok-blue underline hover:bg-stok-light"
                >
                  {t.update}
                </button>
              </form>
              <p className="font-bold text-stok-blue">
                {line.lineTotal !== null ? formatNok(line.lineTotal) : t.priceOnRequest}
              </p>
              <form action={removeCartLine}>
                <input type="hidden" name="sku" value={line.sku} />
                <button
                  type="submit"
                  aria-label={t.removeItem(line.variant.name)}
                  className="text-sm text-stok-text underline hover:text-red-700"
                >
                  {t.remove}
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>

      <aside className="rounded-3xl bg-white p-6 ring-1 ring-stok-blue/10 lg:sticky lg:top-6">
        <h2 className="mb-4 text-2xl">{t.summary}</h2>
        <CartSummary totals={cart.totals} freeShippingThreshold={session?.customer.freeShippingThreshold} />
        {session ? (
          <Link href={shopPath("/kasse")} className={buttonClasses("primary", "mt-6 w-full")}>
            {t.checkout}
          </Link>
        ) : (
          <>
            <p className="mt-4 text-sm">{t.cartPricesNote}</p>
            <Link
              href={`${shopPath("/logg-inn")}?neste=${encodeURIComponent(shopPath("/handlekurv"))}`}
              className={buttonClasses("primary", "mt-4 w-full")}
            >
              {t.loginToOrder}
            </Link>
          </>
        )}
        <Link href={catalogPath()} className={buttonClasses("outline", "mt-3 w-full")}>
          {t.continueShopping}
        </Link>
      </aside>
    </div>
  );
}

export default function CartPage() {
  return (
    <section className="min-h-[60vh] bg-stok-light py-10 md:py-14">
      <Container>
        <h1 className="mb-8 text-4xl">{t.cart}</h1>
        <Suspense fallback={<div aria-busy="true" className="h-72 animate-pulse rounded-3xl bg-white" />}>
          <CartContents />
        </Suspense>
      </Container>
    </section>
  );
}

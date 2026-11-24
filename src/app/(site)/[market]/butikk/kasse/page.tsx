import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { CartSummary } from "@/components/shop/CartSummary";
import { CheckoutForm } from "@/components/shop/CheckoutForm";
import { Container } from "@/components/ui/Container";
import { getCartView } from "@/shop/cart-view";
import { t } from "@/shop/dictionary";
import { earliestDeliveryDate, formatNok, formatNumber } from "@/shop/format";
import { shopPath } from "@/shop/paths";
import { getSession } from "@/shop/session";

export const metadata: Metadata = { title: "Kasse" };

async function Checkout() {
  const session = await getSession();
  if (!session) redirect(`${shopPath("/logg-inn")}?neste=${encodeURIComponent(shopPath("/kasse"))}`);
  const cart = await getCartView(session);
  if (!cart.lines.length) redirect(shopPath("/handlekurv"));

  const minDate = earliestDeliveryDate();

  return (
    <div className="grid gap-8 lg:grid-cols-[3fr_2fr] lg:items-start">
      <CheckoutForm
        addresses={session.customer.addresses}
        paymentTermsDays={session.customer.paymentTermsDays}
        orderedBy={`${session.user.name}, ${session.customer.name}`}
        minDate={minDate}
      />
      <aside className="rounded-3xl bg-white p-6 ring-1 ring-stok-blue/10 lg:sticky lg:top-6">
        <h2 className="mb-4 text-2xl">{t.summary}</h2>
        <ul className="mb-5 divide-y divide-stok-blue/10 text-sm">
          {cart.lines.map((line) => (
            <li key={line.sku} className="flex justify-between gap-4 py-2">
              <span>
                <span className="block font-semibold text-stok-blue">{line.variant.name}</span>
                {formatNumber(line.quantity)} stk. ×{" "}
                {line.unitPrice !== null ? formatNok(line.unitPrice) : "–"}
              </span>
              <span className="whitespace-nowrap">
                {line.lineTotal !== null ? formatNok(line.lineTotal) : "–"}
              </span>
            </li>
          ))}
        </ul>
        <CartSummary totals={cart.totals} freeShippingThreshold={session.customer.freeShippingThreshold} />
        <Link
          href={shopPath("/handlekurv")}
          className="mt-5 inline-block text-sm font-semibold text-stok-blue underline"
        >
          {t.backToCart}
        </Link>
      </aside>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <section className="min-h-[60vh] bg-stok-light py-10 md:py-14">
      <Container>
        <h1 className="mb-8 text-4xl">{t.checkoutTitle}</h1>
        <Suspense fallback={<div aria-busy="true" className="h-96 animate-pulse rounded-3xl bg-white" />}>
          <Checkout />
        </Suspense>
      </Container>
    </section>
  );
}

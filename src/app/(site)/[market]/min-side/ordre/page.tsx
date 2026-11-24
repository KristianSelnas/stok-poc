import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { CartSummary } from "@/components/shop/CartSummary";
import { MinSideSkeleton } from "@/components/shop/PageSkeleton";
import { SpecSummary } from "@/components/shop/SpecSummary";
import { orderTone, StatusBadge } from "@/components/shop/StatusBadge";
import { buttonClasses } from "@/components/ui/Button";
import { reorder } from "@/shop/actions";
import { t } from "@/shop/dictionary";
import type { Order } from "@/shop/domain";
import { formatNok, formatNumber, formatShopDate } from "@/shop/format";
import { shop } from "@/shop/index";
import { unitPriceFor } from "@/shop/mock/rules";
import { minSidePath, orderPath, productPath, variantPath } from "@/shop/paths";
import { requireSession, type Session } from "@/shop/session";

export const metadata: Metadata = { title: "Ordre" };

type Props = PageProps<"/[market]/min-side/ordre">;

// ---------------------------------------------------------------------------
// Ordreliste
// ---------------------------------------------------------------------------

async function OrderList({ session }: { session: Session }) {
  const orders = await shop().orders.listOrders(session.customer.id);
  return (
    <>
      <h1 className="mb-6 text-4xl">{t.orderHistory}</h1>
      {orders.length ? (
        <div className="overflow-x-auto rounded-3xl bg-white ring-1 ring-stok-blue/10">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className="bg-stok-blue text-white">
              <tr>
                <th scope="col" className="px-4 py-3">
                  {t.orderNumber}
                </th>
                <th scope="col" className="px-4 py-3">
                  {t.orderDate}
                </th>
                <th scope="col" className="px-4 py-3">
                  {t.contents}
                </th>
                <th scope="col" className="px-4 py-3">
                  {t.poNumber}
                </th>
                <th scope="col" className="px-4 py-3">
                  {t.status}
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  {t.total}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stok-blue/10">
              {orders.map((o) => (
                <tr key={o.orderNumber}>
                  <td className="px-4 py-3">
                    <Link href={orderPath(o.orderNumber)} className="font-semibold text-stok-blue underline">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatShopDate(o.createdAt)}</td>
                  <td className="px-4 py-3">
                    {o.firstLineName}
                    {o.lineCount > 1 && t.andMore(o.lineCount - 1)}
                    {o.basedOn && (
                      <span className="block text-xs text-stok-text">
                        {o.basedOn.kind === "reorder"
                          ? t.reorderOf(o.basedOn.orderNumber)
                          : t.variantOf(o.basedOn.orderNumber)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">{o.poNumber ?? "–"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={orderTone[o.status]}>{t.orderStatus[o.status]}</StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold whitespace-nowrap text-stok-blue">
                    {formatNok(o.totals.gross)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="rounded-3xl bg-white p-8">{t.noOrders}</p>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Ordredetaljer
// ---------------------------------------------------------------------------

/** Dagens pris og om varen fortsatt kan bestilles, per katalogvare i ordren. */
async function currentLineInfo(order: Order, customerId: string) {
  const { catalog, pricing } = shop();
  const skus = order.lines.flatMap((l) => (l.sku ? [l.sku] : []));
  const [prices, entries] = await Promise.all([
    pricing.getPrices(skus, customerId),
    Promise.all(skus.map((sku) => catalog.getVariant(sku))),
  ]);
  const info = new Map<
    string,
    { orderable: boolean; quoteOnly: boolean; unitPrice: number | null; productSlug: string | null }
  >();
  skus.forEach((sku, i) => {
    const entry = entries[i];
    const price = prices[sku];
    const line = order.lines.find((l) => l.sku === sku)!;
    info.set(sku, {
      orderable: !!entry && entry.variant.salesMode !== "quote" && !!price,
      quoteOnly: entry?.variant.salesMode === "quote",
      unitPrice: price ? unitPriceFor(price, line.quantity) : null,
      productSlug: entry?.product.slug ?? null,
    });
  });
  return info;
}

async function OrderDetail({ session, orderNumber }: { session: Session; orderNumber: string }) {
  const order = await shop().orders.getOrder(session.customer.id, orderNumber);
  if (!order) notFound();
  const info = await currentLineInfo(order, session.customer.id);
  const hasOrderable = [...info.values()].some((i) => i.orderable);
  const hasCustom = order.lines.some((l) => l.customSpec);

  return (
    <>
      <Link href={minSidePath("/ordre")} className="font-semibold text-stok-blue underline">
        {t.backToOrders}
      </Link>
      <div className="mt-4 mb-6 flex flex-wrap items-center gap-4">
        <h1 className="text-4xl">{t.order(order.orderNumber)}</h1>
        <StatusBadge tone={orderTone[order.status]}>{t.orderStatus[order.status]}</StatusBadge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr] lg:items-start">
        <div className="space-y-6">
          <ul className="divide-y divide-stok-blue/10 rounded-3xl bg-white px-6 ring-1 ring-stok-blue/10">
            {order.lines.map((line) => {
              const current = line.sku ? info.get(line.sku) : undefined;
              const priceChanged =
                current?.unitPrice != null && Math.abs(current.unitPrice - line.unitPrice) >= 0.05;
              return (
                <li key={line.id} className="grid gap-4 py-5 sm:grid-cols-[1fr_auto]">
                  <div>
                    {line.customSpec && (
                      <p className="font-meta text-xs font-medium tracking-wide text-stok-green-dark uppercase">
                        {t.customProduct}
                      </p>
                    )}
                    {current?.productSlug ? (
                      <Link
                        href={productPath(current.productSlug)}
                        className="font-semibold text-stok-blue hover:underline"
                      >
                        {line.name}
                      </Link>
                    ) : (
                      <p className="font-semibold text-stok-blue">{line.name}</p>
                    )}
                    <p className="text-sm">
                      {line.sku && (
                        <>
                          {t.sku} {line.sku} ·{" "}
                        </>
                      )}
                      {formatNumber(line.quantity)} stk. × {formatNok(line.unitPrice)}
                    </p>
                    {line.customSpec && (
                      <div className="mt-3">
                        <SpecSummary spec={line.customSpec} />
                      </div>
                    )}
                    {current?.quoteOnly && <p className="mt-2 text-sm">{t.quoteOnlyLine}</p>}
                    {current && !current.orderable && !current.quoteOnly && (
                      <p className="mt-2 text-sm font-semibold text-red-700">{t.notAvailable}</p>
                    )}
                    {current?.orderable && priceChanged && (
                      <p className="mt-2 text-sm font-semibold text-amber-800">
                        {t.priceChanged(formatNok(line.unitPrice), formatNok(current.unitPrice!))}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-start gap-2 sm:items-end">
                    <p className="font-bold text-stok-blue">
                      {formatNok(Math.round(line.quantity * line.unitPrice * 100) / 100)}
                    </p>
                    {line.customSpec ? (
                      <>
                        <Link
                          href={variantPath(order.orderNumber, line.id)}
                          aria-label={t.makeVariantFor(line.name)}
                          className={buttonClasses("primary", "px-5 py-2 text-sm")}
                        >
                          {t.makeVariant}
                        </Link>
                        <Link
                          href={variantPath(order.orderNumber, line.id)}
                          className="text-sm font-semibold text-stok-blue underline"
                        >
                          {t.orderAgain}
                        </Link>
                      </>
                    ) : (
                      current?.orderable && (
                        <Link
                          href={variantPath(order.orderNumber, line.id)}
                          aria-label={t.makeVariantFor(line.name)}
                          className="text-sm font-semibold text-stok-blue underline"
                        >
                          {t.makeVariant}
                        </Link>
                      )
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl bg-white p-6 ring-1 ring-stok-blue/10">
            {hasOrderable && (
              <form action={reorder}>
                <input type="hidden" name="orderNumber" value={order.orderNumber} />
                <button type="submit" className={buttonClasses("primary", "w-full")}>
                  {t.reorder}
                </button>
                <p className="mt-2 text-sm">{t.reorderHelp}</p>
              </form>
            )}
            {hasCustom && <p className={`text-sm ${hasOrderable ? "mt-3" : ""}`}>{t.reorderCustomHelp}</p>}
          </div>
          <div className="rounded-3xl bg-white p-6 ring-1 ring-stok-blue/10">
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="font-semibold text-stok-blue">{t.orderDate}</dt>
                <dd>{formatShopDate(order.createdAt)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-stok-blue">{t.deliveryAddress}</dt>
                <dd>
                  {order.deliveryAddress.label}: {order.deliveryAddress.street},{" "}
                  {order.deliveryAddress.postalCode} {order.deliveryAddress.city}
                </dd>
              </div>
              {order.poNumber && (
                <div>
                  <dt className="font-semibold text-stok-blue">{t.poNumber}</dt>
                  <dd>{order.poNumber}</dd>
                </div>
              )}
              <div>
                <dt className="font-semibold text-stok-blue">{t.orderedBy}</dt>
                <dd>{order.orderedBy}</dd>
              </div>
              {order.basedOn && (
                <div>
                  <dt className="font-semibold text-stok-blue">{t.basedOnOrder}</dt>
                  <dd>
                    <Link href={orderPath(order.basedOn.orderNumber)} className="text-stok-blue underline">
                      {order.basedOn.kind === "reorder"
                        ? t.reorderOf(order.basedOn.orderNumber)
                        : t.variantOf(order.basedOn.orderNumber)}
                    </Link>
                  </dd>
                </div>
              )}
            </dl>
            <div className="mt-5 border-t border-stok-blue/10 pt-4">
              <CartSummary totals={order.totals} />
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

async function OrdersContent({ searchParams }: { searchParams: Props["searchParams"] }) {
  const { ordre } = await searchParams;
  const orderNumber = typeof ordre === "string" ? ordre : null;
  const session = await requireSession(orderNumber ? orderPath(orderNumber) : minSidePath("/ordre"));
  return orderNumber ? (
    <OrderDetail session={session} orderNumber={orderNumber} />
  ) : (
    <OrderList session={session} />
  );
}

/** Ordrehistorikk, og ordredetaljer med `?ordre=10327`. */
export default function OrdersPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<MinSideSkeleton />}>
      <OrdersContent searchParams={searchParams} />
    </Suspense>
  );
}

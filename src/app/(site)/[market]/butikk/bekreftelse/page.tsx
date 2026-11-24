import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { CartSummary } from "@/components/shop/CartSummary";
import { buttonClasses } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { t } from "@/shop/dictionary";
import { formatNok, formatNumber, formatShopDate } from "@/shop/format";
import { shop } from "@/shop/index";
import { catalogPath, shopPath } from "@/shop/paths";
import { getSession } from "@/shop/session";

export const metadata: Metadata = { title: "Ordrebekreftelse", robots: { index: false } };

type Props = PageProps<"/[market]/butikk/bekreftelse">;

async function Confirmation({ searchParams }: { searchParams: Props["searchParams"] }) {
  const { ordre } = await searchParams;
  if (typeof ordre !== "string") notFound();
  const session = await getSession();
  if (!session) redirect(shopPath("/logg-inn"));
  const order = await shop().orders.getOrder(session.customer.id, ordre);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-3xl bg-white p-8 ring-1 ring-stok-blue/10">
        <p className="flex items-center gap-2 font-meta text-sm font-medium text-stok-green-dark uppercase">
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="m4 10.5 4 4 8-9" />
          </svg>
          {t.orderStatus[order.status]}
        </p>
        <h1 className="mt-2 text-4xl">{t.orderConfirmed}</h1>
        <p className="mt-4 text-lg">{t.orderConfirmedLead(order.orderNumber)}</p>

        <dl className="mt-8 grid gap-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-stok-blue">{t.orderNumber}</dt>
            <dd>{order.orderNumber}</dd>
          </div>
          <div>
            <dt className="font-semibold text-stok-blue">{t.orderDate}</dt>
            <dd>{formatShopDate(order.createdAt)}</dd>
          </div>
          <div>
            <dt className="font-semibold text-stok-blue">{t.deliveryAddress}</dt>
            <dd>
              {order.deliveryAddress.name}, {order.deliveryAddress.street}, {order.deliveryAddress.postalCode}{" "}
              {order.deliveryAddress.city}
            </dd>
          </div>
          {order.poNumber && (
            <div>
              <dt className="font-semibold text-stok-blue">{t.poNumber}</dt>
              <dd>{order.poNumber}</dd>
            </div>
          )}
          {order.requestedDeliveryDate && (
            <div>
              <dt className="font-semibold text-stok-blue">{t.requestedDate}</dt>
              <dd>{formatShopDate(order.requestedDeliveryDate)}</dd>
            </div>
          )}
          <div>
            <dt className="font-semibold text-stok-blue">{t.orderedBy}</dt>
            <dd>{order.orderedBy}</dd>
          </div>
          {order.note && (
            <div className="sm:col-span-2">
              <dt className="font-semibold text-stok-blue">{t.note}</dt>
              <dd>{order.note}</dd>
            </div>
          )}
        </dl>

        <table className="mt-8 w-full text-left text-sm">
          <thead className="border-b-2 border-stok-blue/15 text-stok-blue">
            <tr>
              <th scope="col" className="py-2">
                {t.product}
              </th>
              <th scope="col" className="py-2 text-right">
                {t.quantity}
              </th>
              <th scope="col" className="py-2 text-right">
                {t.unitPrice}
              </th>
              <th scope="col" className="py-2 text-right">
                {t.lineTotal}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stok-blue/10">
            {order.lines.map((line) => (
              <tr key={line.id}>
                <td className="py-2">
                  <span className="block font-semibold text-stok-blue">{line.name}</span>
                  {line.sku && (
                    <span>
                      {t.sku} {line.sku}
                    </span>
                  )}
                </td>
                <td className="py-2 text-right">{formatNumber(line.quantity)}</td>
                <td className="py-2 text-right">{formatNok(line.unitPrice)}</td>
                <td className="py-2 text-right">
                  {formatNok(Math.round(line.quantity * line.unitPrice * 100) / 100)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-6 ml-auto max-w-xs">
          <CartSummary totals={order.totals} />
        </div>
      </div>
      <Link href={catalogPath()} className={buttonClasses("outline", "mt-8")}>
        {t.continueShopping}
      </Link>
    </div>
  );
}

export default function ConfirmationPage({ searchParams }: Props) {
  return (
    <section className="min-h-[60vh] bg-stok-light py-10 md:py-14">
      <Container>
        <Suspense
          fallback={
            <div aria-busy="true" className="mx-auto h-96 max-w-3xl animate-pulse rounded-3xl bg-white" />
          }
        >
          <Confirmation searchParams={searchParams} />
        </Suspense>
      </Container>
    </section>
  );
}

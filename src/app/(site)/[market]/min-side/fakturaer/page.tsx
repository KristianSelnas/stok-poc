import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { MinSideSkeleton } from "@/components/shop/PageSkeleton";
import { invoiceTone, StatusBadge } from "@/components/shop/StatusBadge";
import { t } from "@/shop/dictionary";
import { formatNok, formatShopDate } from "@/shop/format";
import { shop } from "@/shop/index";
import { minSidePath, orderPath } from "@/shop/paths";
import { requireSession } from "@/shop/session";

export const metadata: Metadata = { title: "Fakturaer" };

async function Invoices() {
  const session = await requireSession(minSidePath("/fakturaer"));
  const invoices = await shop().orders.listInvoices(session.customer.id);
  const unpaid = invoices.filter((i) => i.status !== "paid");
  return (
    <>
      <h1 className="text-4xl">{t.invoicesTitle}</h1>
      <p className="mt-2 mb-6 text-lg">
        {t.openInvoices(unpaid.length, formatNok(unpaid.reduce((sum, i) => sum + i.amount, 0)))}
      </p>
      {invoices.length ? (
        <div className="overflow-x-auto rounded-3xl bg-white ring-1 ring-stok-blue/10">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="bg-stok-blue text-white">
              <tr>
                <th scope="col" className="px-4 py-3">
                  {t.invoiceNumber}
                </th>
                <th scope="col" className="px-4 py-3">
                  {t.orderNumber}
                </th>
                <th scope="col" className="px-4 py-3">
                  {t.issued}
                </th>
                <th scope="col" className="px-4 py-3">
                  {t.due}
                </th>
                <th scope="col" className="px-4 py-3">
                  {t.status}
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  {t.amount}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stok-blue/10">
              {invoices.map((i) => (
                <tr key={i.invoiceNumber}>
                  <td className="px-4 py-3 font-semibold text-stok-blue">{i.invoiceNumber}</td>
                  <td className="px-4 py-3">
                    <Link href={orderPath(i.orderNumber)} className="text-stok-blue underline">
                      {i.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatShopDate(i.issuedAt)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatShopDate(i.dueAt)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={invoiceTone[i.status]}>{t.invoiceStatus[i.status]}</StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold whitespace-nowrap text-stok-blue">
                    {formatNok(i.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="rounded-3xl bg-white p-8">{t.noInvoices}</p>
      )}
    </>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense fallback={<MinSideSkeleton />}>
      <Invoices />
    </Suspense>
  );
}

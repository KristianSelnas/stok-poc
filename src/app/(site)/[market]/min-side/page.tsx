import Link from "next/link";
import { Suspense } from "react";

import { MinSideSkeleton } from "@/components/shop/PageSkeleton";
import { orderTone, StatusBadge } from "@/components/shop/StatusBadge";
import { buttonClasses } from "@/components/ui/Button";
import { t } from "@/shop/dictionary";
import { formatNok, formatShopDate } from "@/shop/format";
import { shop } from "@/shop/index";
import { catalogPath, minSidePath, orderPath } from "@/shop/paths";
import { getCustomPackagings } from "@/shop/recommendations";
import { requireSession } from "@/shop/session";

const cardClass = "rounded-3xl bg-white p-6 ring-1 ring-stok-blue/10";

async function Overview() {
  const session = await requireSession(minSidePath());
  const id = session.customer.id;
  const [orders, invoices, requests, packagings] = await Promise.all([
    shop().orders.listOrders(id),
    shop().orders.listInvoices(id),
    shop().quotes.listRequests(id),
    getCustomPackagings(id),
  ]);
  const unpaid = invoices.filter((i) => i.status !== "paid");
  const unpaidSum = unpaid.reduce((sum, i) => sum + i.amount, 0);

  return (
    <>
      <h1 className="text-4xl">{t.greeting(session.user.name.split(" ")[0])}</h1>
      <p className="mt-2 text-lg">{session.customer.name}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section aria-labelledby="siste-ordre" className={cardClass}>
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="siste-ordre" className="text-2xl">
              {t.latestOrders}
            </h2>
            <Link href={minSidePath("/ordre")} className="font-semibold text-stok-blue underline">
              {t.seeAllOrders}
            </Link>
          </div>
          {orders.length ? (
            <ul className="divide-y divide-stok-blue/10">
              {orders.slice(0, 4).map((o) => (
                <li key={o.orderNumber} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <Link
                      href={orderPath(o.orderNumber)}
                      className="font-semibold text-stok-blue hover:underline"
                    >
                      {t.order(o.orderNumber)}
                    </Link>
                    <p className="text-sm">
                      {formatShopDate(o.createdAt)} · {o.firstLineName}
                      {o.lineCount > 1 && t.andMore(o.lineCount - 1)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge tone={orderTone[o.status]}>{t.orderStatus[o.status]}</StatusBadge>
                    <span className="font-semibold text-stok-blue">{formatNok(o.totals.gross)}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>{t.noOrders}</p>
          )}
        </section>

        <div className="space-y-6">
          <section className={cardClass}>
            <h2 className="text-xl">{t.invoicesTitle}</h2>
            <p className="mt-1">{t.openInvoices(unpaid.length, formatNok(unpaidSum))}</p>
            <Link
              href={minSidePath("/fakturaer")}
              className="mt-3 inline-block font-semibold text-stok-blue underline"
            >
              {t.seeInvoices}
            </Link>
          </section>
          <section className={cardClass}>
            <h2 className="text-xl">{t.packagingsTitle}</h2>
            <p className="mt-1">{packagings.length ? t.packagingCount(packagings.length) : t.noPackagings}</p>
            <Link
              href={minSidePath("/emballasjer")}
              className="mt-3 inline-block font-semibold text-stok-blue underline"
            >
              {t.seePackagings}
            </Link>
          </section>
          <section className={cardClass}>
            <h2 className="text-xl">{t.requestsTitle}</h2>
            <p className="mt-1">{t.requestCount(requests.length)}</p>
            <Link
              href={minSidePath("/foresporsler")}
              className="mt-3 inline-block font-semibold text-stok-blue underline"
            >
              {t.seeRequests}
            </Link>
          </section>
          <Link href={catalogPath()} className={buttonClasses("primary", "w-full")}>
            {t.seeProducts}
          </Link>
        </div>
      </div>
    </>
  );
}

export default function MinSidePage() {
  return (
    <Suspense fallback={<MinSideSkeleton />}>
      <Overview />
    </Suspense>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { MinSideSkeleton } from "@/components/shop/PageSkeleton";
import { ChangesTable, SpecSummary } from "@/components/shop/SpecSummary";
import { requestTone, StatusBadge } from "@/components/shop/StatusBadge";
import { t } from "@/shop/dictionary";
import { formatNok, formatNumber, formatShopDate } from "@/shop/format";
import { shop } from "@/shop/index";
import { minSidePath, orderPath } from "@/shop/paths";
import { requireSession } from "@/shop/session";

export const metadata: Metadata = { title: "Forespørsler" };

type Props = PageProps<"/[market]/min-side/foresporsler">;

async function Requests({ searchParams }: { searchParams: Props["searchParams"] }) {
  const { ny } = await searchParams;
  const session = await requireSession(minSidePath("/foresporsler"));
  const requests = await shop().quotes.listRequests(session.customer.id);
  const created = typeof ny === "string" ? requests.find((r) => r.id === ny) : undefined;

  return (
    <>
      <h1 className="mb-6 text-4xl">{t.requestsTitle}</h1>
      {created && (
        <p role="status" className="mb-6 rounded-2xl bg-stok-green/20 p-4 font-semibold text-stok-blue">
          {t.requestSent(created.id)}
        </p>
      )}
      {requests.length ? (
        <ul className="space-y-6">
          {requests.map((r) => (
            <li
              key={r.id}
              className={`grid gap-6 rounded-3xl bg-white p-6 ring-1 lg:grid-cols-2 ${
                r.id === created?.id ? "ring-2 ring-stok-green" : "ring-stok-blue/10"
              }`}
            >
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl">{t.request(r.id)}</h2>
                  <StatusBadge tone={requestTone[r.status]}>{t.requestStatus[r.status]}</StatusBadge>
                </div>
                <p className="mt-1 font-semibold text-stok-blue">{r.name}</p>
                <p className="text-sm">
                  {formatShopDate(r.createdAt)} · {t.requestedBy} {r.requestedBy}
                  {r.basedOn && (
                    <>
                      {" "}
                      · {t.basedOnOrder}{" "}
                      <Link href={orderPath(r.basedOn.orderNumber)} className="text-stok-blue underline">
                        {r.basedOn.orderNumber}
                      </Link>
                    </>
                  )}
                </p>
                <div className="mt-4">
                  <SpecSummary spec={r.spec} />
                </div>
                <p className="mt-3 text-sm">
                  {t.quantity}: <strong>{formatNumber(r.quantity)} stk.</strong>
                  {r.estimatedUnitPrice !== null && (
                    <>
                      {" "}
                      · {t.estimatedPrice}: <strong>{formatNok(r.estimatedUnitPrice)}</strong> {t.perUnit} (
                      {formatNok(Math.round(r.estimatedUnitPrice * r.quantity))} {t.exVat})
                    </>
                  )}
                </p>
                {r.note && (
                  <p className="mt-3 text-sm">
                    <span className="font-semibold text-stok-blue">{t.messageToSeller}:</span> {r.note}
                  </p>
                )}
              </div>
              {r.original && (
                <div>
                  <h3 className="mb-2 text-lg">{t.changes}</h3>
                  <ChangesTable changes={r.changes} />
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-3xl bg-white p-8">{t.noRequests}</p>
      )}
    </>
  );
}

export default function RequestsPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<MinSideSkeleton />}>
      <Requests searchParams={searchParams} />
    </Suspense>
  );
}

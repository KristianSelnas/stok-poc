import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { MinSideSkeleton } from "@/components/shop/PageSkeleton";
import { SpecSummary } from "@/components/shop/SpecSummary";
import { buttonClasses } from "@/components/ui/Button";
import { t } from "@/shop/dictionary";
import { formatNok, formatNumber, formatShopDate } from "@/shop/format";
import { minSidePath, orderPath, variantPath } from "@/shop/paths";
import { getCustomPackagings } from "@/shop/recommendations";
import { requireSession } from "@/shop/session";

export const metadata: Metadata = { title: "Mine emballasjer" };

async function Packagings() {
  const session = await requireSession(minSidePath("/emballasjer"));
  const packagings = await getCustomPackagings(session.customer.id);
  return (
    <>
      <h1 className="text-4xl">{t.packagingsTitle}</h1>
      <p className="mt-2 mb-6 text-lg">{t.packagingsLead}</p>
      {packagings.length ? (
        <ul className="grid gap-6 lg:grid-cols-2">
          {packagings.map((p) => (
            <li key={p.name} className="flex flex-col rounded-3xl bg-white p-6 ring-1 ring-stok-blue/10">
              <h2 className="text-xl">{p.name}</h2>
              <p className="mt-1 text-sm">
                {t.timesOrdered(p.timesOrdered)} · {t.lastOrderedOn}{" "}
                <Link href={orderPath(p.lastOrderNumber)} className="text-stok-blue underline">
                  {formatShopDate(p.lastOrderedAt)}
                </Link>
              </p>
              <div className="mt-4">
                <SpecSummary spec={p.spec} />
              </div>
              <p className="mt-4 text-sm">
                {t.lastPrice}: <strong>{formatNok(p.lastUnitPrice)}</strong> {t.perUnit} ·{" "}
                {formatNumber(p.lastQuantity)} stk.
              </p>
              <div className="mt-auto flex flex-wrap gap-3 pt-5">
                <Link
                  href={variantPath(p.lastOrderNumber, p.lastLineId)}
                  aria-label={t.makeVariantFor(p.name)}
                  className={buttonClasses("primary", "px-5 py-2")}
                >
                  {t.makeVariant}
                </Link>
                <Link
                  href={variantPath(p.lastOrderNumber, p.lastLineId)}
                  className={buttonClasses("outline", "px-5 py-2")}
                >
                  {t.orderAgain}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-3xl bg-white p-8">{t.noPackagings}</p>
      )}
    </>
  );
}

export default function PackagingsPage() {
  return (
    <Suspense fallback={<MinSideSkeleton />}>
      <Packagings />
    </Suspense>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";

import { MinSideSkeleton } from "@/components/shop/PageSkeleton";
import { t } from "@/shop/dictionary";
import { formatNok } from "@/shop/format";
import { minSidePath } from "@/shop/paths";
import { getShopTaxonomy } from "@/shop/queries";
import { requireSession } from "@/shop/session";

export const metadata: Metadata = { title: "Firma og brukere" };

const cardClass = "rounded-3xl bg-white p-6 ring-1 ring-stok-blue/10";

async function Company() {
  const session = await requireSession(minSidePath("/firma"));
  const { customer } = session;
  const { groups } = await getShopTaxonomy();
  const groupTitle = new Map(groups.map((g) => [g.slug, g.title]));
  const agreement = customer.priceAgreement;
  const fixedCount = Object.keys(agreement.fixedPrices).length;

  return (
    <>
      <h1 className="text-4xl">{t.companyTitle}</h1>
      <p className="mt-2 mb-6 text-lg">
        {customer.name} · {t.orgNumber} {customer.orgNumber}
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="avtale" className={cardClass}>
          <h2 id="avtale" className="text-2xl">
            {t.priceAgreement}
          </h2>
          <p className="mt-1 font-semibold text-stok-blue">{agreement.name}</p>
          <h3 className="mt-4 text-base">{t.discounts}</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
            <li>
              {Object.keys(agreement.groupDiscounts).length
                ? t.discountOther(agreement.discountPercent)
                : t.discountAll(agreement.discountPercent)}
            </li>
            {Object.entries(agreement.groupDiscounts).map(([group, percent]) => (
              <li key={group}>{t.discountGroup(groupTitle.get(group) ?? group, percent)}</li>
            ))}
            {fixedCount > 0 && <li>{t.fixedPrices(fixedCount)}</li>}
          </ul>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="font-semibold text-stok-blue">{t.paymentTerms}</dt>
              <dd>{t.invoice(customer.paymentTermsDays)}</dd>
            </div>
            <div>
              <dt className="font-semibold text-stok-blue">{t.freeShippingLimit}</dt>
              <dd>
                {formatNok(customer.freeShippingThreshold)} {t.exVat}
              </dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="adresser" className={cardClass}>
          <h2 id="adresser" className="text-2xl">
            {t.addresses}
          </h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {customer.addresses.map((a) => (
              <li key={a.id} className="rounded-2xl bg-stok-light p-4 text-sm">
                <p className="font-semibold text-stok-blue">{a.label}</p>
                <p>{a.name}</p>
                <p>{a.street}</p>
                <p>
                  {a.postalCode} {a.city}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="brukere" className={`${cardClass} lg:col-span-2`}>
          <h2 id="brukere" className="text-2xl">
            {t.users}
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[30rem] text-left text-sm">
              <thead className="text-stok-blue">
                <tr className="border-b-2 border-stok-blue/15">
                  <th scope="col" className="py-2 pr-4">
                    {t.name}
                  </th>
                  <th scope="col" className="py-2 pr-4">
                    {t.email}
                  </th>
                  <th scope="col" className="py-2">
                    {t.role}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stok-blue/10">
                {customer.users.map((u) => (
                  <tr key={u.id}>
                    <td className="py-2 pr-4 font-semibold text-stok-blue">{u.name}</td>
                    <td className="py-2 pr-4">{u.email}</td>
                    <td className="py-2">{t.roles[u.role]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm">{t.companyEditNote}</p>
        </section>
      </div>
    </>
  );
}

export default function CompanyPage() {
  return (
    <Suspense fallback={<MinSideSkeleton />}>
      <Company />
    </Suspense>
  );
}

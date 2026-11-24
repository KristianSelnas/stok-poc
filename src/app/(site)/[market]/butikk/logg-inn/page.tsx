import type { Metadata } from "next";
import { Suspense } from "react";

import { buttonClasses } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { login, resetDemoData } from "@/shop/actions";
import { t } from "@/shop/dictionary";
import { canResetDemo, shop } from "@/shop/index";

export const metadata: Metadata = { title: "Logg inn", robots: { index: false } };

type Props = PageProps<"/[market]/butikk/logg-inn">;

async function CustomerList({ searchParams }: { searchParams: Props["searchParams"] }) {
  const params = await searchParams;
  const next = typeof params.neste === "string" ? params.neste : "";
  const { customers, orders } = shop();
  const list = await customers.listCustomers();
  const orderCounts = await Promise.all(list.map((c) => orders.listOrders(c.id).then((o) => o.length)));

  return (
    <>
      {params.nullstilt === "1" && (
        <p role="status" className="mb-6 rounded-2xl bg-stok-green/20 p-4 font-semibold text-stok-blue">
          {t.demoReset}
        </p>
      )}
      <ul className="grid gap-6 lg:grid-cols-3">
        {list.map((customer, i) => (
          <li key={customer.id} className="flex flex-col rounded-3xl bg-white p-6 ring-1 ring-stok-blue/10">
            <p className="font-meta text-xs font-medium tracking-wide text-stok-green-dark uppercase">
              {customer.industry}
            </p>
            <h2 className="mt-1 text-2xl">{customer.name}</h2>
            <p className="mt-3">{customer.description}</p>
            <dl className="mt-4 space-y-1 text-sm">
              <div>
                <dt className="inline font-semibold text-stok-blue">{t.priceAgreement}: </dt>
                <dd className="inline">{customer.priceAgreement.name}</dd>
              </div>
              <div>
                <dd>{t.orders(orderCounts[i])}</dd>
              </div>
            </dl>
            <div className="mt-auto space-y-2 pt-6">
              {customer.users.map((user) => (
                <form key={user.id} action={login}>
                  <input type="hidden" name="customerId" value={customer.id} />
                  <input type="hidden" name="userId" value={user.id} />
                  <input type="hidden" name="next" value={next} />
                  <button
                    type="submit"
                    className={buttonClasses(user.role === "admin" ? "primary" : "outline", "w-full")}
                  >
                    {t.loginAs(user.name)}
                  </button>
                </form>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

export default function LoginPage({ searchParams }: Props) {
  return (
    <section className="min-h-[60vh] bg-stok-light py-10 md:py-14">
      <Container>
        <h1 className="text-4xl">{t.loginTitle}</h1>
        <p className="mt-4 mb-10 max-w-3xl text-lg">{t.loginLead}</p>
        <Suspense fallback={<div aria-busy="true" className="h-96 animate-pulse rounded-3xl bg-white" />}>
          <CustomerList searchParams={searchParams} />
        </Suspense>
        {canResetDemo && (
          <form action={resetDemoData} className="mt-12 border-t border-stok-blue/10 pt-6">
            <button type="submit" className={buttonClasses("outline")}>
              {t.resetDemo}
            </button>
            <p className="mt-2 text-sm">{t.resetDemoHelp}</p>
          </form>
        )}
      </Container>
    </section>
  );
}

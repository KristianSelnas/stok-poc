import type { Metadata } from "next";
import { Suspense } from "react";

import { BoxConfigurator } from "@/components/shop/BoxConfigurator";
import { Container } from "@/components/ui/Container";
import { t } from "@/shop/dictionary";
import { shop } from "@/shop/index";
import { configuratorPath } from "@/shop/paths";
import { parseCustomBox, validateCustomBox } from "@/shop/specs";
import { getSession } from "@/shop/session";

export const metadata: Metadata = {
  title: "Skreddersydd eske",
  alternates: { canonical: configuratorPath() },
};

type Props = PageProps<"/[market]/butikk/konfigurator">;

async function Configurator({ searchParams }: { searchParams: Props["searchParams"] }) {
  const params = await searchParams;
  const { values, spec, quantity } = parseCustomBox((key) => {
    const value = params[key];
    return typeof value === "string" ? value : null;
  });
  const session = await getSession();
  const valid = Object.keys(validateCustomBox(spec, quantity)).length === 0;
  const estimate = valid ? await shop().quotes.estimate(session?.customer.id ?? null, spec, quantity) : null;

  // Ny key ved inn- og utlogging, så skjemaet starter på nytt med riktig pris.
  return (
    <BoxConfigurator
      key={session?.customer.id ?? "anonym"}
      initialValues={values}
      initialEstimate={estimate}
      loggedIn={!!session}
    />
  );
}

/**
 * Konfigurator for skreddersydd eske. Konfigurasjonen ligger i adressen,
 * f.eks. `?type=0201&l=400&b=300&h=200&kvalitet=B-bølge&antall=1000`.
 */
export default function ConfiguratorPage({ searchParams }: Props) {
  return (
    <section className="min-h-[60vh] bg-stok-light py-10 md:py-14">
      <Container>
        <p className="font-meta text-sm font-medium tracking-wide text-stok-green-dark uppercase">
          {t.configurator}
        </p>
        <h1 className="mt-2 mb-3 text-4xl">{t.configuratorTitle}</h1>
        <p className="mb-8 max-w-3xl text-lg">{t.configuratorLead}</p>
        <Suspense
          fallback={
            <div
              aria-busy="true"
              className="grid animate-pulse gap-6 motion-reduce:animate-none lg:grid-cols-2"
            >
              <div className="h-[32rem] rounded-3xl bg-white" />
              <div className="h-96 rounded-3xl bg-white" />
            </div>
          }
        >
          <Configurator searchParams={searchParams} />
        </Suspense>
      </Container>
    </section>
  );
}

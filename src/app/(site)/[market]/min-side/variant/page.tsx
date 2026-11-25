import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { CustomVariantForm } from "@/components/shop/CustomVariantForm";
import { MinSideSkeleton } from "@/components/shop/PageSkeleton";
import { SpecSummary } from "@/components/shop/SpecSummary";
import { buttonClasses } from "@/components/ui/Button";
import { FieldHelp, Input, Label } from "@/components/ui/Form";
import { addVariantToCart } from "@/shop/actions";
import { t } from "@/shop/dictionary";
import type { Order, OrderLine } from "@/shop/domain";
import { formatNok, formatNumber } from "@/shop/format";
import { shop } from "@/shop/index";
import { minSidePath, orderPath, variantPath } from "@/shop/paths";
import { requireSession, type Session } from "@/shop/session";
import { parseVariantSuggestion, type VariantFormValues } from "@/shop/specs";

export const metadata: Metadata = { title: "Lag variant" };

type Props = PageProps<"/[market]/min-side/variant">;

/** Variant av en katalogvare: velg en annen variant av samme produkt og antall. */
async function CatalogVariant({ session, line }: { session: Session; line: OrderLine }) {
  const entry = line.sku ? await shop().catalog.getVariant(line.sku) : null;
  if (!entry) notFound();
  const variants = entry.product.variants.filter((v) => v.salesMode !== "quote");
  const prices = await shop().pricing.getPrices(
    variants.map((v) => v.sku),
    session.customer.id,
  );

  return (
    <form
      action={addVariantToCart}
      className="max-w-3xl space-y-6 rounded-3xl bg-white p-6 ring-1 ring-stok-blue/10"
    >
      <p>{t.variantCatalogLead}</p>
      <fieldset>
        <legend className="mb-2 font-meta text-sm font-medium text-stok-blue">{t.chooseVariant}</legend>
        <div className="space-y-2">
          {variants.map((v) => (
            <label
              key={v.sku}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-transparent px-4 py-3 ring-1 ring-stok-blue/10 has-checked:border-stok-blue has-focus-visible:outline-3 has-focus-visible:outline-stok-green"
            >
              <input
                type="radio"
                name="sku"
                value={v.sku}
                defaultChecked={v.sku === line.sku}
                className="h-4 w-4 accent-stok-blue"
              />
              <span className="flex-1">
                <span className="block font-semibold text-stok-blue">
                  {v.name}
                  {v.sku === line.sku && (
                    <span className="font-normal text-stok-text"> ({t.original.toLowerCase()})</span>
                  )}
                </span>
                <span className="text-sm">
                  {t.sku} {v.sku}
                </span>
              </span>
              {prices[v.sku] && (
                <span className="text-sm font-semibold whitespace-nowrap text-stok-blue">
                  {formatNok(prices[v.sku].unitPrice)}
                </span>
              )}
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <Label htmlFor="quantity">{t.quantity}</Label>
        <Input
          shape="pill"
          id="quantity"
          name="quantity"
          type="number"
          inputMode="numeric"
          min={1}
          defaultValue={line.quantity}
          className="w-40"
        />
        <FieldHelp>
          {t.original}: {formatNumber(line.quantity)} stk. {line.name}
        </FieldHelp>
      </div>
      <button type="submit" className={buttonClasses("primary")}>
        {t.addToCart}
      </button>
    </form>
  );
}

function CustomVariant({
  order,
  line,
  suggested,
}: {
  order: Order;
  line: OrderLine & { customSpec: NonNullable<OrderLine["customSpec"]> };
  suggested: Partial<VariantFormValues>;
}) {
  const hasSuggestion = Object.keys(suggested).length > 0;
  return (
    <>
      <p className="mb-6 max-w-3xl">{t.variantLead}</p>
      {hasSuggestion && (
        <p className="mb-6 max-w-3xl rounded-2xl bg-stok-green/15 px-5 py-3 font-semibold text-stok-blue ring-1 ring-stok-green/40">
          {t.variantSuggested}
        </p>
      )}
      <details className="mb-6 max-w-3xl rounded-3xl bg-white p-5 ring-1 ring-stok-blue/10">
        <summary className="cursor-pointer font-semibold text-stok-blue">
          {t.original}: {line.name}, {formatNumber(line.quantity)} stk. à {formatNok(line.unitPrice)}
        </summary>
        <div className="mt-4">
          <SpecSummary spec={line.customSpec} />
        </div>
      </details>
      <CustomVariantForm
        original={{
          name: line.name,
          spec: line.customSpec,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
        }}
        orderNumber={order.orderNumber}
        lineId={line.id}
        suggested={suggested}
        key={JSON.stringify(suggested)}
      />
    </>
  );
}

async function VariantContent({ searchParams }: { searchParams: Props["searchParams"] }) {
  const params = await searchParams;
  const orderNumber = typeof params.ordre === "string" ? params.ordre : "";
  const lineId = typeof params.linje === "string" ? params.linje : "";
  const session = await requireSession(
    orderNumber ? variantPath(orderNumber, lineId) : minSidePath("/ordre"),
  );
  const order = orderNumber ? await shop().orders.getOrder(session.customer.id, orderNumber) : null;
  const line = order?.lines.find((l) => l.id === lineId);
  if (!order || !line) notFound();

  return (
    <>
      <Link href={orderPath(order.orderNumber)} className="font-semibold text-stok-blue underline">
        {t.backToOrder(order.orderNumber)}
      </Link>
      <h1 className="mt-4 mb-2 text-4xl">{t.variantTitle}</h1>
      <p className="mb-4 text-lg text-stok-blue">{line.name}</p>
      {line.customSpec ? (
        <CustomVariant
          order={order}
          line={{ ...line, customSpec: line.customSpec }}
          suggested={parseVariantSuggestion((key) => {
            const value = params[key];
            return typeof value === "string" ? value : null;
          })}
        />
      ) : (
        <CatalogVariant session={session} line={line} />
      )}
    </>
  );
}

/**
 * Variant av en ordrelinje: `?ordre=10329&linje=l3`. Endringer fra
 * emballasjeveilederen kan ligge i adressen, f.eks. `&h=200&antall=500`.
 */
export default function VariantPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<MinSideSkeleton />}>
      <VariantContent searchParams={searchParams} />
    </Suspense>
  );
}

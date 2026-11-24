"use client";

import Link from "next/link";
import { useActionState, useId, useState } from "react";

import { addToCart } from "@/shop/actions";
import { t } from "@/shop/dictionary";
import type { InventoryInfo, PriceInfo, Variant } from "@/shop/domain";
import { formatNok, formatNumber } from "@/shop/format";
import { roundToBundle, unitPriceFor } from "@/shop/mock/rules";

import { buttonClasses } from "../ui/Button";
import { StockBadge } from "./StockBadge";

type PurchaseVariant = Pick<Variant, "sku" | "name" | "salesMode" | "unitsPerBundle" | "unitsPerPallet">;

type Props = {
  variants: PurchaseVariant[];
  prices: Record<string, PriceInfo>;
  inventory: Record<string, InventoryInfo>;
  loggedIn: boolean;
  loginHref: string;
  cartHref: string;
  quoteHref: string;
};

/**
 * Variantvelger, pris med mengderabatt, lagerstatus og «Legg i handlekurven».
 * Antallet rundes opp til hele bunter både her og på serveren.
 */
export function VariantPurchase({
  variants,
  prices,
  inventory,
  loggedIn,
  loginHref,
  cartHref,
  quoteHref,
}: Props) {
  const firstOrderable = variants.find((v) => v.salesMode !== "quote") ?? variants[0];
  const [sku, setSku] = useState(firstOrderable.sku);
  const variant = variants.find((v) => v.sku === sku) ?? firstOrderable;
  const [quantityInput, setQuantityInput] = useState(String(variant.unitsPerBundle));
  const [state, formAction, pending] = useActionState(addToCart, null);
  const id = useId();

  const price = prices[variant.sku];
  const stock = inventory[variant.sku];
  const quantity = Number(quantityInput);
  const validQuantity = Number.isFinite(quantity) && quantity > 0;
  const rounded = validQuantity ? roundToBundle(quantity, variant.unitsPerBundle) : variant.unitsPerBundle;
  const unitPrice = price ? unitPriceFor(price, rounded) : null;

  function choose(next: PurchaseVariant) {
    setSku(next.sku);
    setQuantityInput(String(next.unitsPerBundle));
  }

  return (
    <div className="space-y-6">
      {variants.length > 1 && (
        <fieldset>
          <legend className="mb-2 font-meta text-sm font-medium text-stok-blue">{t.chooseVariant}</legend>
          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {variants.map((v) => {
              const checked = v.sku === variant.sku;
              const vStock = inventory[v.sku];
              return (
                <label
                  key={v.sku}
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 bg-white px-4 py-3 has-focus-visible:outline-3 has-focus-visible:outline-stok-green ${
                    checked ? "border-stok-blue" : "border-transparent ring-1 ring-stok-blue/10"
                  }`}
                >
                  <input
                    type="radio"
                    name={`${id}-variant`}
                    value={v.sku}
                    checked={checked}
                    onChange={() => choose(v)}
                    className="h-4 w-4 accent-stok-blue"
                  />
                  <span className="flex-1">
                    <span className="block font-semibold text-stok-blue">{v.name}</span>
                    <span className="text-sm">
                      {t.sku} {v.sku}
                      {vStock && <> · {t.stockStatus[vStock.status]}</>}
                    </span>
                  </span>
                  {prices[v.sku] && (
                    <span className="text-sm font-semibold whitespace-nowrap text-stok-blue">
                      {formatNok(prices[v.sku].unitPrice)}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="rounded-3xl bg-white p-6 ring-1 ring-stok-blue/10">
        <p className="text-sm">
          {variant.name} · {t.sku} {variant.sku}
        </p>

        {variant.salesMode === "quote" || !price ? (
          <div className="mt-3">
            <p className="font-heading text-2xl font-bold text-stok-blue">{t.priceOnRequest}</p>
            <p className="mt-2">{t.quoteHelp}</p>
            <Link href={quoteHref} className={buttonClasses("primary", "mt-5")}>
              {t.requestQuote}
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-3 flex flex-wrap items-baseline gap-x-3">
              <p className="font-heading text-3xl font-bold text-stok-blue">
                {formatNok(unitPrice ?? price.unitPrice)}
              </p>
              <p className="text-sm">
                {t.perUnit} {t.exVat}
              </p>
            </div>
            {loggedIn ? (
              <p className="mt-1 text-sm">
                {t.yourPrice}
                {price.agreement && (
                  <>
                    {" "}
                    ({t.agreement.toLowerCase()}: {price.agreement})
                  </>
                )}
                {price.listPrice !== price.unitPrice && (
                  <>
                    . {t.listPrice} <s>{formatNok(price.listPrice)}</s>
                  </>
                )}
              </p>
            ) : (
              <p className="mt-1 text-sm">
                {t.listPrice}.{" "}
                <Link href={loginHref} className="font-semibold text-stok-blue underline">
                  {t.loginForPrices}
                </Link>
              </p>
            )}

            {price.tiers.length > 1 && (
              <table className="mt-4 w-full text-sm">
                <caption className="mb-1 text-left font-meta font-medium text-stok-blue">
                  {t.priceTiers}
                </caption>
                <tbody className="divide-y divide-stok-blue/10">
                  {price.tiers.map((tier) => (
                    <tr
                      key={tier.minQuantity}
                      className={unitPrice === tier.unitPrice ? "font-semibold" : ""}
                    >
                      <th scope="row" className="py-1.5 text-left font-normal">
                        {tier.label}
                        {tier.minQuantity > variant.unitsPerBundle && (
                          <span className="text-stok-text"> ({formatNumber(tier.minQuantity)} stk.)</span>
                        )}
                      </th>
                      <td className="py-1.5 text-right">{formatNok(tier.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {stock && (
              <div className="mt-4">
                <StockBadge inventory={stock} detailed />
              </div>
            )}

            <form action={formAction} className="mt-5">
              <input type="hidden" name="sku" value={variant.sku} />
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label
                    htmlFor={`${id}-qty`}
                    className="mb-1 block font-meta text-sm font-medium text-stok-blue"
                  >
                    {t.quantity}
                  </label>
                  <input
                    id={`${id}-qty`}
                    name="quantity"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={quantityInput}
                    onChange={(e) => setQuantityInput(e.target.value)}
                    aria-describedby={`${id}-qty-help`}
                    className="w-32 rounded-full border-2 border-stok-blue/20 px-4 py-2.5 focus:border-stok-blue focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={pending}
                  className={buttonClasses("primary", "disabled:opacity-60")}
                >
                  {pending ? t.adding : t.addToCart}
                </button>
              </div>
              <p id={`${id}-qty-help`} className="mt-2 text-sm">
                {variant.unitsPerBundle > 1 && <>{t.quantityHelp(variant.unitsPerBundle)} </>}
                {validQuantity && rounded !== quantity && <>{t.willRoundUp(rounded)} </>}
                {variant.unitsPerPallet && (
                  <>
                    {t.perPallet}: {formatNumber(variant.unitsPerPallet)}.{" "}
                  </>
                )}
                {validQuantity && unitPrice !== null && (
                  <>
                    {t.lineTotal}: <strong>{formatNok(Math.round(unitPrice * rounded * 100) / 100)}</strong>{" "}
                    {t.exVat}
                  </>
                )}
              </p>
              <div aria-live="polite" className="mt-3 min-h-6">
                {state && (
                  <p className={state.ok ? "text-stok-green-dark" : "text-red-700"}>
                    {state.message}{" "}
                    {state.ok && (
                      <Link href={cartHref} className="font-semibold text-stok-blue underline">
                        {t.goToCart}
                      </Link>
                    )}
                  </p>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

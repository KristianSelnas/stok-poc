"use client";

import { useActionState } from "react";

import { placeOrder } from "@/shop/actions";
import { t } from "@/shop/dictionary";
import type { Address } from "@/shop/domain";

import { buttonClasses } from "../ui/Button";

const inputClass =
  "w-full rounded-2xl border-2 border-stok-blue/20 bg-white px-4 py-2.5 focus:border-stok-blue focus:outline-none";
const labelClass = "mb-1 block font-meta text-sm font-medium text-stok-blue";

/** Kasseskjemaet. Kunde og varer leses fra sesjon og kurv på serveren. */
export function CheckoutForm({
  addresses,
  paymentTermsDays,
  orderedBy,
  minDate,
}: {
  addresses: Address[];
  paymentTermsDays: number;
  orderedBy: string;
  minDate: string;
}) {
  const [state, formAction, pending] = useActionState(placeOrder, null);

  return (
    <form action={formAction} className="space-y-8">
      <fieldset className="rounded-3xl bg-white p-6 ring-1 ring-stok-blue/10">
        <legend className="float-left mb-4 w-full font-heading text-2xl font-bold text-stok-blue">
          {t.deliveryAddress}
        </legend>
        <div className="clear-both grid gap-3 sm:grid-cols-2">
          {addresses.map((address, i) => (
            <label
              key={address.id}
              className="flex cursor-pointer gap-3 rounded-2xl border-2 border-transparent p-4 ring-1 ring-stok-blue/10 has-checked:border-stok-blue has-focus-visible:outline-3 has-focus-visible:outline-stok-green"
            >
              <input
                type="radio"
                name="deliveryAddressId"
                value={address.id}
                defaultChecked={i === 0}
                className="mt-1 h-4 w-4 accent-stok-blue"
              />
              <span>
                <span className="block font-semibold text-stok-blue">{address.label}</span>
                <span className="block text-sm">{address.name}</span>
                <span className="block text-sm">{address.street}</span>
                <span className="block text-sm">
                  {address.postalCode} {address.city}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="rounded-3xl bg-white p-6 ring-1 ring-stok-blue/10">
        <legend className="float-left mb-4 w-full font-heading text-2xl font-bold text-stok-blue">
          {t.orderDetails}
        </legend>
        <div className="clear-both grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="poNumber" className={labelClass}>
              {t.poNumber}
            </label>
            <input
              id="poNumber"
              name="poNumber"
              maxLength={40}
              aria-describedby="poNumber-help"
              className={inputClass}
            />
            <p id="poNumber-help" className="mt-1 text-sm">
              {t.poNumberHelp}
            </p>
          </div>
          <div>
            <label htmlFor="requestedDeliveryDate" className={labelClass}>
              {t.requestedDate}
            </label>
            <input
              id="requestedDeliveryDate"
              name="requestedDeliveryDate"
              type="date"
              min={minDate}
              aria-describedby="date-help"
              className={inputClass}
            />
            <p id="date-help" className="mt-1 text-sm">
              {t.requestedDateHelp}
            </p>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="note" className={labelClass}>
              {t.note}
            </label>
            <textarea
              id="note"
              name="note"
              rows={3}
              maxLength={500}
              aria-describedby="note-help"
              className={inputClass}
            />
            <p id="note-help" className="mt-1 text-sm">
              {t.noteHelp}
            </p>
          </div>
        </div>
        <dl className="mt-6 grid gap-4 border-t border-stok-blue/10 pt-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-stok-blue">{t.payment}</dt>
            <dd>{t.invoice(paymentTermsDays)}</dd>
          </div>
          <div>
            <dt className="font-semibold text-stok-blue">{t.orderedBy}</dt>
            <dd>{orderedBy}</dd>
          </div>
        </dl>
      </fieldset>

      <div aria-live="polite">
        {state && !state.ok && <p className="mb-4 rounded-2xl bg-red-50 p-4 text-red-800">{state.message}</p>}
      </div>
      <button
        type="submit"
        disabled={pending}
        className={buttonClasses("primary", "w-full disabled:opacity-60 sm:w-auto")}
      >
        {pending ? t.placingOrder : t.placeOrder}
      </button>
    </form>
  );
}

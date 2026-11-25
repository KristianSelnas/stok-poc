"use client";

import { useActionState, useState } from "react";

import { createVariantRequest } from "@/shop/actions";
import { t } from "@/shop/dictionary";
import type { PackagingSpec } from "@/shop/domain";
import { formatNok } from "@/shop/format";
import { estimateVariantUnitPrice } from "@/shop/mock/rules";
import { boardOptions, colorOptions, diffSpec, specName, type VariantFormValues } from "@/shop/specs";

import { buttonClasses } from "../ui/Button";
import { FieldError, FieldHelp, Input, Label, Select, Textarea } from "../ui/Form";
import { ChangesTable } from "./SpecSummary";

type Original = { name: string; spec: PackagingSpec; quantity: number; unitPrice: number };

/**
 * Skjema for en variant av en skreddersydd ordrelinje. Feltene starter med
 * verdiene fra originalen, og endringene og foreløpig pris vises fortløpende.
 * Serveren regner ut diffen på nytt fra ordren, så det kunden ser her er bare en forhåndsvisning.
 */
export function CustomVariantForm({
  original,
  orderNumber,
  lineId,
  suggested,
}: {
  original: Original;
  orderNumber: string;
  lineId: string;
  /** Endringer fra emballasjeveilederen (fase D4). Overstyrer originalverdiene. */
  suggested?: Partial<VariantFormValues>;
}) {
  const [state, formAction, pending] = useActionState(createVariantRequest, null);
  const o = original.spec;
  const [values, setValues] = useState<VariantFormValues>(() => ({
    length: String(o.innerDimensionsMm.length),
    width: String(o.innerDimensionsMm.width),
    height: String(o.innerDimensionsMm.height),
    board: o.board,
    color: o.color,
    printColors: String(o.print?.colors ?? 0),
    printDescription: o.print?.description ?? "",
    notes: o.notes ?? "",
    quantity: String(original.quantity),
    ...suggested,
  }));
  const set = (key: keyof typeof values) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));
  const error = (key: string) => (state && !state.ok ? state.fields?.[key] : undefined);

  const num = (value: string, fallback: number) => {
    const n = Math.round(Number(value));
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };
  const colors = Math.max(0, Math.min(4, num(values.printColors, 0)));
  const spec: PackagingSpec = {
    style: o.style,
    innerDimensionsMm: {
      length: num(values.length, o.innerDimensionsMm.length),
      width: num(values.width, o.innerDimensionsMm.width),
      height: num(values.height, o.innerDimensionsMm.height),
    },
    board: values.board,
    color: values.color,
    print: colors > 0 ? { colors, description: values.printDescription || "Trykk" } : null,
    notes: values.notes || null,
  };
  const quantity = num(values.quantity, original.quantity);
  const changes = diffSpec(original, { spec, quantity });
  const unitPrice = estimateVariantUnitPrice(original, { spec, quantity });

  const field = (key: "length" | "width" | "height", label: string) => (
    <div>
      <Label htmlFor={key}>{label}</Label>
      <Input
        id={key}
        name={key}
        type="number"
        inputMode="numeric"
        min={30}
        max={2000}
        value={values[key]}
        onChange={set(key)}
        aria-invalid={!!error(key)}
        aria-describedby={error(key) ? `${key}-error` : undefined}
        className="w-full"
      />
      {error(key) && <FieldError id={`${key}-error`}>{error(key)}</FieldError>}
    </div>
  );

  return (
    <form action={formAction} className="grid gap-8 lg:grid-cols-[3fr_2fr] lg:items-start">
      <input type="hidden" name="orderNumber" value={orderNumber} />
      <input type="hidden" name="lineId" value={lineId} />

      <div className="space-y-6 rounded-3xl bg-white p-6 ring-1 ring-stok-blue/10">
        <fieldset>
          <legend className="mb-1 block font-meta text-base font-medium text-stok-blue">
            {t.dimensionsMm}
          </legend>
          <div className="grid grid-cols-3 gap-3">
            {field("length", t.length)}
            {field("width", t.width)}
            {field("height", t.height)}
          </div>
        </fieldset>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="board">{t.board}</Label>
            <Select id="board" name="board" value={values.board} onChange={set("board")}>
              {[...new Set([o.board, ...boardOptions])].map((b) => (
                <option key={b}>{b}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="color">{t.color}</Label>
            <Select id="color" name="color" value={values.color} onChange={set("color")}>
              {[...new Set([o.color, ...colorOptions])].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="printColors">{t.printColors}</Label>
            <Select
              id="printColors"
              name="printColors"
              value={values.printColors}
              onChange={set("printColors")}
            >
              {[0, 1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n === 0 ? "Uten trykk" : n}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="quantity">{t.quantity}</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              inputMode="numeric"
              min={100}
              value={values.quantity}
              onChange={set("quantity")}
              aria-invalid={!!error("quantity")}
              aria-describedby={error("quantity") ? "quantity-error" : undefined}
              className="w-full"
            />
            {error("quantity") && <FieldError id="quantity-error">{error("quantity")}</FieldError>}
          </div>
          {colors > 0 && (
            <div className="sm:col-span-2">
              <Label htmlFor="printDescription">{t.printDescription}</Label>
              <Input
                id="printDescription"
                name="printDescription"
                maxLength={200}
                value={values.printDescription}
                onChange={set("printDescription")}
                className="w-full"
              />
            </div>
          )}
          <div className="sm:col-span-2">
            <Label htmlFor="notes">{t.specNotes}</Label>
            <Input
              id="notes"
              name="notes"
              maxLength={300}
              value={values.notes}
              onChange={set("notes")}
              className="w-full"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="note">{t.messageToSeller}</Label>
            <Textarea id="note" name="note" rows={3} maxLength={500} aria-describedby="note-help" />
            <FieldHelp id="note-help">{t.messageToSellerHelp}</FieldHelp>
          </div>
        </div>
      </div>

      <aside className="space-y-5 rounded-3xl bg-white p-6 ring-1 ring-stok-blue/10 lg:sticky lg:top-6">
        <div>
          <p className="font-meta text-xs font-medium tracking-wide text-stok-green-dark uppercase">
            {t.newVariant}
          </p>
          <p className="font-heading text-xl font-bold text-stok-blue">{specName(original.name, spec)}</p>
        </div>
        <div aria-live="polite">
          <h2 className="mb-2 text-lg">{t.changes}</h2>
          <ChangesTable changes={changes} />
        </div>
        <dl className="space-y-1 border-t border-stok-blue/10 pt-4">
          <div className="flex justify-between gap-4">
            <dt>{t.estimatedPrice}</dt>
            <dd className="font-semibold text-stok-blue">
              {formatNok(unitPrice)} {t.perUnit}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>{t.estimatedTotal}</dt>
            <dd className="font-semibold text-stok-blue">{formatNok(Math.round(unitPrice * quantity))}</dd>
          </div>
        </dl>
        <p className="text-sm">
          {t.estimatedPriceHelp} {t.pricesExVat}
        </p>
        <div aria-live="polite">
          {state && !state.ok && (
            <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-800">{state.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={pending}
          className={buttonClasses("primary", "w-full disabled:opacity-60")}
        >
          {pending ? t.sendingRequest : t.sendRequest}
        </button>
      </aside>
    </form>
  );
}

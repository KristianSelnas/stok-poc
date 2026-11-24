"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";

import { createCustomRequest, estimateCustomBox } from "@/shop/actions";
import { t } from "@/shop/dictionary";
import type { QuoteEstimate } from "@/shop/domain";
import { formatNok, formatNumber } from "@/shop/format";
import { configuratorPath, loginPath } from "@/shop/paths";
import {
  boardDescriptions,
  boardOptions,
  colorOptions,
  customLimits,
  customQuantity,
  type CustomBoxValues,
  parseCustomBox,
  specName,
  styleLabels,
  styleOptions,
  validateCustomBox,
} from "@/shop/specs";

import { buttonClasses } from "../ui/Button";
import { BoxPreview } from "./BoxPreview";

const inputClass =
  "w-full rounded-2xl border-2 border-stok-blue/20 bg-white px-4 py-2.5 focus:border-stok-blue focus:outline-none aria-invalid:border-red-600";
const labelClass = "mb-1 block font-meta text-sm font-medium text-stok-blue";
const cardClass = "rounded-3xl bg-white p-6 ring-1 ring-stok-blue/10";

type Props = {
  initialValues: CustomBoxValues;
  initialEstimate: QuoteEstimate | null;
  loggedIn: boolean;
};

/**
 * Konfigurator for skreddersydd eske. Tegningen oppdateres med en gang, mens
 * pris og leveringstid hentes fra serveren (`QuoteService.estimate`) litt
 * etter siste endring. Feltene speiles i adressen, så konfigurasjonen kan
 * deles og overlever innlogging.
 */
export function BoxConfigurator({ initialValues, initialEstimate, loggedIn }: Props) {
  const [values, setValues] = useState(initialValues);
  const [view, setView] = useState<"3d" | "flat">("3d");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [estimate, setEstimate] = useState({ key: JSON.stringify(initialValues), value: initialEstimate });
  const [state, formAction, pending] = useActionState(createCustomRequest, null);
  const latestKey = useRef("");

  const { spec, quantity, name } = parseCustomBox((key) => values[key]);
  const errors = validateCustomBox(spec, quantity);
  const valid = Object.keys(errors).length === 0;
  const limits = customLimits[spec.style];
  const valuesKey = JSON.stringify(values);
  const estimating = valid && estimate.key !== valuesKey;

  // Adressen og estimatet følger feltene. Estimatet hentes 300 ms etter siste endring,
  // og svar som kommer etter et nyere kall, forkastes.
  useEffect(() => {
    window.history.replaceState(null, "", configuratorPath(values));
    if (!valid || estimate.key === valuesKey) return;
    latestKey.current = valuesKey;
    const timer = setTimeout(async () => {
      const result = await estimateCustomBox(values).catch(() => null);
      if (latestKey.current !== valuesKey) return;
      setEstimate({ key: valuesKey, value: result?.ok ? result.estimate : null });
    }, 300);
    return () => clearTimeout(timer);
  }, [values, valuesKey, valid, estimate.key]);

  const set = (key: keyof CustomBoxValues) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));
  const blur = (key: string) => () => setTouched((v) => ({ ...v, [key]: true }));

  /** Ved bytte av kassetype flyttes målene inn innenfor grensene til den nye typen. */
  const chooseStyle = (style: string) => {
    const next = customLimits[style];
    const clamp = (value: string, [min, max]: [number, number]) => {
      const n = Number(value);
      return String(Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min);
    };
    setValues((v) => ({
      ...v,
      type: style,
      l: clamp(v.l, next.length),
      b: clamp(v.b, next.width),
      h: clamp(v.h, next.height),
    }));
  };

  const fieldError = (key: "l" | "b" | "h" | "antall") => {
    const serverError = state && !state.ok ? state.fields?.[key] : undefined;
    return serverError ?? (touched[key] ? errors[key] : undefined);
  };

  const numberField = (key: "l" | "b" | "h", label: string, [min, max]: [number, number]) => {
    const error = fieldError(key);
    return (
      <div>
        <label htmlFor={key} className={labelClass}>
          {label}
        </label>
        <input
          id={key}
          name={key}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={values[key]}
          onChange={set(key)}
          onBlur={blur(key)}
          aria-invalid={!!error}
          aria-describedby={error ? `${key}-error` : "dimension-limits"}
          className={inputClass}
        />
        {error && (
          <p id={`${key}-error`} className="mt-1 text-sm text-red-700">
            {error}
          </p>
        )}
      </div>
    );
  };

  const colors = Number(values.trykk);
  const shownName = specName(name, spec);
  const range = ([min, max]: [number, number]) => `${formatNumber(min)}–${formatNumber(max)}`;

  return (
    <form
      action={formAction}
      className="grid gap-6 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:items-start lg:gap-8"
    >
      {/* Forhåndsvisning: øverst på mobil, øverst til høyre på store skjermer */}
      <section aria-labelledby="preview-title" className={`${cardClass} lg:col-start-2 lg:row-start-1`}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 id="preview-title" className="text-xl">
            {t.preview}
          </h2>
          <div role="group" aria-label={t.preview} className="flex rounded-full bg-stok-light p-1">
            {(["3d", "flat"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => setView(v)}
                className="rounded-full px-4 py-1.5 text-sm font-semibold text-stok-blue aria-pressed:bg-stok-blue aria-pressed:text-white"
              >
                {v === "3d" ? t.view3d : t.viewFlat}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-stok-light p-4">
          <BoxPreview spec={spec} view={view} />
        </div>
        <p className="mt-3 font-heading text-lg font-bold text-stok-blue">{shownName}</p>
        {view === "flat" && <p className="mt-1 text-sm">{t.previewNote}</p>}
      </section>

      {/* Feltene */}
      <div className="space-y-6 lg:col-start-1 lg:row-span-2 lg:row-start-1">
        <fieldset className={cardClass}>
          <legend className="sr-only">{t.boxType}</legend>
          <p aria-hidden className="mb-3 text-xl font-bold text-stok-blue">
            {t.boxType}
          </p>
          <input type="hidden" name="type" value={spec.style} />
          <div className="grid gap-3 sm:grid-cols-2">
            {styleOptions.map((style) => (
              <label
                key={style}
                className="flex cursor-pointer gap-3 rounded-2xl border-2 border-transparent p-4 ring-1 ring-stok-blue/10 has-checked:border-stok-blue has-focus-visible:outline-3 has-focus-visible:outline-stok-green"
              >
                <input
                  type="radio"
                  name="style-choice"
                  value={style}
                  checked={spec.style === style}
                  onChange={() => chooseStyle(style)}
                  className="mt-1 h-4 w-4 shrink-0 accent-stok-blue"
                />
                <span>
                  <span className="block font-semibold text-stok-blue">{styleLabels[style]}</span>
                  <span className="text-sm">{t.styleDescriptions[style]}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className={cardClass}>
          <legend className="sr-only">{t.sizeAndMaterial}</legend>
          <p aria-hidden className="mb-3 text-xl font-bold text-stok-blue">
            {t.sizeAndMaterial}
          </p>
          <p className={`${labelClass} text-base`}>{t.dimensionsMm}</p>
          <div className="grid grid-cols-3 gap-3">
            {numberField("l", t.length, limits.length)}
            {numberField("b", t.width, limits.width)}
            {numberField("h", t.height, limits.height)}
          </div>
          <p id="dimension-limits" className="mt-2 text-sm">
            {t.dimensionLimits(range(limits.length), range(limits.width), range(limits.height))}
          </p>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="kvalitet" className={labelClass}>
                {t.board}
              </label>
              <select
                id="kvalitet"
                name="kvalitet"
                value={values.kvalitet}
                onChange={set("kvalitet")}
                aria-describedby="kvalitet-help"
                className={inputClass}
              >
                {boardOptions.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
              <p id="kvalitet-help" className="mt-1 text-sm">
                {boardDescriptions[values.kvalitet]}
              </p>
            </div>
            <div>
              <label htmlFor="farge" className={labelClass}>
                {t.color}
              </label>
              <select
                id="farge"
                name="farge"
                value={values.farge}
                onChange={set("farge")}
                className={inputClass}
              >
                {colorOptions.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset className={cardClass}>
          <legend className="sr-only">{t.printAndQuantity}</legend>
          <p aria-hidden className="mb-3 text-xl font-bold text-stok-blue">
            {t.printAndQuantity}
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="trykk" className={labelClass}>
                {t.printColors}
              </label>
              <select
                id="trykk"
                name="trykk"
                value={values.trykk}
                onChange={set("trykk")}
                className={inputClass}
              >
                {[0, 1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n === 0 ? t.noPrint : n}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="antall" className={labelClass}>
                {t.quantity}
              </label>
              <input
                id="antall"
                name="antall"
                type="number"
                inputMode="numeric"
                min={customQuantity.min}
                max={customQuantity.max}
                step={50}
                value={values.antall}
                onChange={set("antall")}
                onBlur={blur("antall")}
                aria-invalid={!!fieldError("antall")}
                aria-describedby={fieldError("antall") ? "antall-error" : "antall-help"}
                className={inputClass}
              />
              {fieldError("antall") ? (
                <p id="antall-error" className="mt-1 text-sm text-red-700">
                  {fieldError("antall")}
                </p>
              ) : (
                <p id="antall-help" className="mt-1 text-sm">
                  {t.customQuantityHelp(formatNumber(customQuantity.min))}
                </p>
              )}
            </div>
            {colors > 0 && (
              <div className="sm:col-span-2">
                <label htmlFor="trykktekst" className={labelClass}>
                  {t.printDescription}
                </label>
                <input
                  id="trykktekst"
                  name="trykktekst"
                  maxLength={200}
                  value={values.trykktekst}
                  onChange={set("trykktekst")}
                  className={inputClass}
                />
              </div>
            )}
            <div className="sm:col-span-2">
              <label htmlFor="navn" className={labelClass}>
                {t.boxName}
              </label>
              <input
                id="navn"
                name="navn"
                maxLength={80}
                value={values.navn}
                onChange={set("navn")}
                aria-describedby="navn-help"
                className={inputClass}
              />
              <p id="navn-help" className="mt-1 text-sm">
                {t.boxNameHelp}
              </p>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="merknad" className={labelClass}>
                {t.specNotes}
              </label>
              <input
                id="merknad"
                name="merknad"
                maxLength={300}
                value={values.merknad}
                onChange={set("merknad")}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="note" className={labelClass}>
                {t.messageToSeller}
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
                {t.messageToSellerHelp}
              </p>
            </div>
          </div>
        </fieldset>
      </div>

      {/* Estimat og innsending */}
      <aside
        aria-labelledby="estimate-title"
        className={`${cardClass} space-y-4 lg:col-start-2 lg:row-start-2`}
      >
        <h2 id="estimate-title" className="text-xl">
          {t.estimate}
        </h2>
        <div aria-live="polite" aria-busy={estimating}>
          {!valid ? (
            <p className="text-sm">{t.estimateNeedsFix}</p>
          ) : estimate.value ? (
            <div className={estimating ? "opacity-60 transition-opacity" : undefined}>
              <dl className="space-y-1">
                <div className="flex justify-between gap-4">
                  <dt>{t.unitPrice}</dt>
                  <dd className="font-heading text-2xl font-bold text-stok-blue">
                    {formatNok(estimate.value.unitPrice)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>{t.toolingCost}</dt>
                  <dd className="font-semibold whitespace-nowrap text-stok-blue">
                    {estimate.value.toolingCost ? formatNok(estimate.value.toolingCost) : t.noTooling}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-stok-blue/10 pt-2">
                  <dt>{t.totalFor(formatNumber(quantity))}</dt>
                  <dd className="font-semibold whitespace-nowrap text-stok-blue">
                    {formatNok(estimate.value.total)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>{t.leadTimeLabel}</dt>
                  <dd className="text-right font-semibold text-stok-blue">
                    {t.leadTimeValue(estimate.value.leadTimeDays)}
                  </dd>
                </div>
              </dl>
              <p className="mt-2 text-sm">
                {estimate.value.agreement ? t.agreementPriceNote(estimate.value.agreement) : t.guidePriceNote}{" "}
                {t.pricesExVat}
              </p>
              <details className="mt-3 text-sm">
                <summary className="cursor-pointer font-semibold text-stok-blue">{t.priceBreakdown}</summary>
                <dl className="mt-2 space-y-1">
                  {estimate.value.parts.map((part) => (
                    <div key={part.label} className="flex justify-between gap-4">
                      <dt>{part.label}</dt>
                      <dd className="whitespace-nowrap">{formatNok(part.amount)}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            </div>
          ) : null}
          {estimating && <p className="sr-only">{t.updatingEstimate}</p>}
        </div>
        <p className="text-sm">{t.customEstimateHelp}</p>

        <div aria-live="polite">
          {state && !state.ok && (
            <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-800">{state.message}</p>
          )}
        </div>
        {loggedIn ? (
          <button
            type="submit"
            disabled={pending}
            className={buttonClasses("primary", "w-full disabled:opacity-60")}
          >
            {pending ? t.sendingRequest : t.sendRequest}
          </button>
        ) : (
          <Link href={loginPath(configuratorPath(values))} className={buttonClasses("primary", "w-full")}>
            {t.loginToSend}
          </Link>
        )}
      </aside>
    </form>
  );
}

const nok = new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK" });
const nokWhole = new Intl.NumberFormat("nb-NO", {
  style: "currency",
  currency: "NOK",
  maximumFractionDigits: 0,
});
const number = new Intl.NumberFormat("nb-NO");

/** «1 234,50 kr». Hele beløp over 1000 kr vises uten øre. */
export function formatNok(value: number): string {
  return value >= 1000 && Number.isInteger(value) ? nokWhole.format(value) : nok.format(value);
}

export function formatNumber(value: number): string {
  return number.format(value);
}

export function formatShopDate(iso: string): string {
  return new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(iso),
  );
}

/** Tidligste ønskede leveringsdato i kassen: tre dager fram i tid, som «2026-11-27». */
export function earliestDeliveryDate(): string {
  return new Date(Date.now() + 3 * 86_400_000).toISOString().slice(0, 10);
}

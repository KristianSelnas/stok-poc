import type { MarketId } from "./markets";

const locales: Record<MarketId, string> = { no: "nb-NO", is: "is-IS" };

/** «2026-02-25» blir «25. februar 2026» (norsk) eller «25. febrúar 2026» (islandsk). */
export function formatDate(date: string | null | undefined, market: MarketId): string | undefined {
  if (!date) return undefined;
  return new Intl.DateTimeFormat(locales[market], { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(`${date}T12:00:00Z`),
  );
}

/** Telefonnummer uten mellomrom, til `tel:`-lenker. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/** Initialer til personkort uten bilde: «Kari Nordmann» blir «KN». */
export function initials(name: string | null | undefined): string {
  return (name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

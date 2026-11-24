import type { ReactNode } from "react";

const tones = {
  green: "bg-stok-green/25 text-stok-blue",
  blue: "bg-stok-blue/10 text-stok-blue",
  amber: "bg-amber-100 text-amber-900",
  red: "bg-red-100 text-red-800",
  grey: "bg-stok-grey text-stok-text",
};

export type BadgeTone = keyof typeof tones;

/** Liten statusetikett, f.eks. for ordre, fakturaer og forespørsler. */
export function StatusBadge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export const orderTone = {
  received: "blue",
  confirmed: "blue",
  inProduction: "amber",
  shipped: "green",
  delivered: "grey",
  cancelled: "red",
} as const satisfies Record<string, BadgeTone>;

export const invoiceTone = { paid: "grey", open: "blue", overdue: "red" } as const satisfies Record<
  string,
  BadgeTone
>;

export const requestTone = {
  submitted: "blue",
  inReview: "amber",
  quoted: "green",
} as const satisfies Record<string, BadgeTone>;

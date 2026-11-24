/**
 * Forretningsregler i mocken: mengderabatt, avtalepris, frakt og mva.
 *
 * I en ekte løsning ligger disse reglene i ERP. Mock-tjenestene og skriptet
 * som lager ordrehistorikken (scripts/shop/generate-mock-data.mts) bruker
 * samme regler, så prisene henger sammen. Filen har ingen avhengigheter, så
 * den kan kjøres direkte med Node.
 */
import type { OrderTotals, PackagingSpec, PriceAgreement, PriceInfo, PriceTier, Variant } from "../domain.ts";

export const VAT_RATE = 0.25;
export const SHIPPING_FEE = 750;

/** Runder til hele kroner over 100 kr, ellers til nærmeste 10 øre. */
export function roundPrice(value: number): number {
  return value >= 100 ? Math.round(value) : Math.round(value * 10) / 10;
}

/** Mengderabatt i prosent fra et antall stk. */
export function tierRules(variant: Pick<Variant, "unitsPerBundle" | "unitsPerPallet">) {
  const bundle = variant.unitsPerBundle;
  if (variant.unitsPerPallet) {
    return [
      { minQuantity: bundle, discount: 0, label: "Per stk." },
      { minQuantity: variant.unitsPerPallet, discount: 6, label: "Fra 1 pall" },
      { minQuantity: variant.unitsPerPallet * 5, discount: 12, label: "Fra 5 paller" },
    ];
  }
  return [
    { minQuantity: bundle, discount: 0, label: "Per stk." },
    { minQuantity: bundle * 10, discount: 5, label: `Fra ${bundle * 10} stk.` },
  ];
}

/** Avtalerabatt i prosent for en produktgruppe. */
export function agreementDiscount(agreement: PriceAgreement, group: string): number {
  return agreement.groupDiscounts[group] ?? agreement.discountPercent;
}

/**
 * Kundens pris for en variant. Fastpris i avtalen gjelder som utgangspunkt,
 * ellers listepris minus avtalerabatt. Mengderabatten kommer i tillegg.
 */
export function computePrice(
  sku: string,
  listPrice: number,
  variant: Pick<Variant, "unitsPerBundle" | "unitsPerPallet">,
  group: string,
  agreement: PriceAgreement | null,
): PriceInfo {
  const fixed = agreement?.fixedPrices[sku];
  const base = fixed ?? (agreement ? listPrice * (1 - agreementDiscount(agreement, group) / 100) : listPrice);
  const tiers: PriceTier[] = tierRules(variant).map((rule) => ({
    minQuantity: rule.minQuantity,
    unitPrice: roundPrice(base * (1 - rule.discount / 100)),
    label: rule.label,
  }));
  return {
    sku,
    currency: "NOK",
    listPrice,
    unitPrice: tiers[0].unitPrice,
    tiers,
    agreement: agreement?.name ?? null,
  };
}

/** Prisen per stk. for et gitt antall, ut fra mengderabatten. */
export function unitPriceFor(price: PriceInfo, quantity: number): number {
  let unitPrice = price.tiers[0].unitPrice;
  for (const tier of price.tiers) if (quantity >= tier.minQuantity) unitPrice = tier.unitPrice;
  return unitPrice;
}

export function calculateTotals(net: number, freeShippingThreshold: number): OrderTotals {
  const shipping = net === 0 || net >= freeShippingThreshold ? 0 : SHIPPING_FEE;
  const vat = Math.round((net + shipping) * VAT_RATE * 100) / 100;
  return {
    net: Math.round(net * 100) / 100,
    shipping,
    vat,
    gross: Math.round((net + shipping + vat) * 100) / 100,
  };
}

/** Runder et antall opp til hele bunter. */
export function roundToBundle(quantity: number, unitsPerBundle: number): number {
  const bundle = Math.max(1, unitsPerBundle);
  return Math.max(bundle, Math.ceil(quantity / bundle) * bundle);
}

const boardFactor: Record<string, number> = {
  "E-bølge": 1,
  "B-bølge": 1.1,
  "C-bølge": 1.2,
  "BC dobbelbølge": 1.6,
};

function boxArea(spec: PackagingSpec): number {
  const { length: l, width: w, height: h } = spec.innerDimensionsMm;
  return 2 * (l * w + l * h + w * h);
}

/**
 * Foreløpig pris per stk. for en variant av en skreddersydd emballasje.
 * Tar utgangspunkt i prisen på originalen og justerer for areal, kvalitet,
 * antall trykkfarger og antall. Selger bekrefter prisen i tilbudet.
 */
export function estimateVariantUnitPrice(
  original: { spec: PackagingSpec; quantity: number; unitPrice: number },
  next: { spec: PackagingSpec; quantity: number },
): number {
  const area = boxArea(next.spec) / boxArea(original.spec);
  const board = (boardFactor[next.spec.board] ?? 1.1) / (boardFactor[original.spec.board] ?? 1.1);
  const colors = 1 + 0.04 * ((next.spec.print?.colors ?? 0) - (original.spec.print?.colors ?? 0));
  const volume =
    next.quantity < original.quantity * 0.5 ? 1.1 : next.quantity > original.quantity * 2 ? 0.95 : 1;
  return Math.max(0.5, Math.round(original.unitPrice * area * board * colors * volume * 10) / 10);
}

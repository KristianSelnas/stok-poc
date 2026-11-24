/**
 * Forretningsregler i mocken: mengderabatt, avtalepris, frakt, mva og kalkyle
 * for skreddersydde esker.
 *
 * I en ekte løsning ligger disse reglene i ERP. Mock-tjenestene og skriptet
 * som lager ordrehistorikken (scripts/shop/generate-mock-data.mts) bruker
 * samme regler, så prisene henger sammen. Filen har ingen avhengigheter, så
 * den kan kjøres direkte med Node.
 */
import { sheetAreaM2 } from "../dieline.ts";
import type {
  EstimatePart,
  OrderTotals,
  PackagingSpec,
  PriceAgreement,
  PriceInfo,
  PriceTier,
  QuoteEstimate,
  Variant,
} from "../domain.ts";

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

/** Avtalerabatt i prosent for en produkttype. */
export function agreementDiscount(agreement: PriceAgreement, type: string): number {
  return agreement.typeDiscounts[type] ?? agreement.discountPercent;
}

/**
 * Kundens pris for en variant. Fastpris i avtalen gjelder som utgangspunkt,
 * ellers listepris minus avtalerabatt. Mengderabatten kommer i tillegg.
 */
export function computePrice(
  sku: string,
  listPrice: number,
  variant: Pick<Variant, "unitsPerBundle" | "unitsPerPallet">,
  type: string,
  agreement: PriceAgreement | null,
): PriceInfo {
  const fixed = agreement?.fixedPrices[sku];
  const base = fixed ?? (agreement ? listPrice * (1 - agreementDiscount(agreement, type) / 100) : listPrice);
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

// ---------------------------------------------------------------------------
// Kalkyle for nye skreddersydde esker (fase C)
// ---------------------------------------------------------------------------

/** Papp-pris per m² ark, eks. mva. */
const boardPricePerM2: Record<string, number> = {
  "E-bølge": 7,
  "B-bølge": 10,
  "C-bølge": 11,
  "BC dobbelbølge": 16,
};

/** Påslag for hvit og sort papp. */
const colorFactor: Record<string, number> = { Brun: 1, Hvit: 1.15, Sort: 1.3 };

const PRINT_PER_COLOR = 0.6;
/** Omstilling av maskinene, fordelt på antallet. */
const SETUP_COST = 1500;
/** 0427 stanses og trenger en stansekniv. 0201 lages uten. */
const DIE_COST = 3500;
const PLATE_COST_PER_COLOR = 900;

const round2 = (value: number) => Math.round(value * 100) / 100;
const nbDecimal = new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 2 });

/** Mengderabatt i prosent på en skreddersydd eske. */
export function customVolumeDiscount(quantity: number): number {
  return quantity >= 10000 ? 12 : quantity >= 5000 ? 8 : 0;
}

/** Leveringstid i virkedager. */
export function customLeadTimeDays(spec: PackagingSpec, quantity: number): number {
  let days = 10;
  if (spec.style === "0427") days += 5;
  if (spec.print && spec.print.colors > 0) days += 3;
  if (spec.board === "BC dobbelbølge") days += 2;
  if (quantity > 10000) days += 5;
  return days;
}

/**
 * Estimert pris på en ny skreddersydd eske: papp ut fra arkarealet, trykk,
 * omstilling fordelt på antallet, mengderabatt og avtalerabatt. Stansekniv og
 * trykkplater er en engangskostnad. Selger bekrefter prisen i tilbudet.
 */
export function estimateCustomBox(
  spec: PackagingSpec,
  quantity: number,
  agreement: { name: string; discountPercent: number } | null = null,
): QuoteEstimate {
  const area = sheetAreaM2(spec);
  const colors = spec.print?.colors ?? 0;
  const parts: EstimatePart[] = [
    {
      label: `Papp ${spec.board}, ${spec.color.toLowerCase()} (${nbDecimal.format(round2(area))} m²)`,
      amount: round2(area * (boardPricePerM2[spec.board] ?? 10) * (colorFactor[spec.color] ?? 1)),
    },
  ];
  if (colors > 0) {
    parts.push({
      label: `Trykk, ${colors} ${colors === 1 ? "farge" : "farger"}`,
      amount: colors * PRINT_PER_COLOR,
    });
  }
  parts.push({ label: "Omstilling av produksjonen", amount: round2(SETUP_COST / quantity) });

  const subtotal = parts.reduce((sum, p) => sum + p.amount, 0);
  const volume = customVolumeDiscount(quantity);
  if (volume) parts.push({ label: `Mengderabatt (${volume} %)`, amount: -round2((subtotal * volume) / 100) });
  if (agreement && agreement.discountPercent) {
    const afterVolume = parts.reduce((sum, p) => sum + p.amount, 0);
    parts.push({
      label: `Avtalerabatt (${agreement.discountPercent} %)`,
      amount: -round2((afterVolume * agreement.discountPercent) / 100),
    });
  }

  const unitPrice = Math.max(0.5, roundPrice(parts.reduce((sum, p) => sum + p.amount, 0)));
  const toolingCost = (spec.style === "0427" ? DIE_COST : 0) + colors * PLATE_COST_PER_COLOR;
  return {
    unitPrice,
    toolingCost,
    total: Math.round(unitPrice * quantity + toolingCost),
    leadTimeDays: customLeadTimeDays(spec, quantity),
    parts,
    agreement: agreement?.name ?? null,
  };
}

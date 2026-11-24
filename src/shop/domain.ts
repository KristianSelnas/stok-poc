/**
 * Domenetypene i nettbutikken. De er uavhengige av mockene og av systemene
 * som skal levere dataene senere (produktkatalog, ERP og CRM). Tjenestene i
 * `services/` bruker bare disse typene.
 */

// ---------------------------------------------------------------------------
// Katalog (PIM)
// ---------------------------------------------------------------------------

export type Taxon = { slug: string; title: string };
export type ProductGroup = Taxon & { order: number };

export type DescriptionBlock =
  { type: "h"; text: string } | { type: "p"; text: string } | { type: "ul"; items: string[] };

export type ProductImage = { url: string; alt: string };

/** Mål i centimeter. `diameter` brukes for runde produkter som spann og kar. */
export type Dimensions = { length?: number; width?: number; height?: number; diameter?: number };

export type VariantAttribute = { key: string; label: string; value: string };

/**
 * Hvordan en variant selges:
 * - `stock`: lagervare, kan bestilles i nettbutikken
 * - `madeToOrder`: produseres ved bestilling, kan bestilles med lengre leveringstid
 * - `quote`: tilpasses kunden, krever tilbud fra selger
 */
export type SalesMode = "stock" | "madeToOrder" | "quote";

export type Variant = {
  /** Varenummer (art. nr.), f.eks. «0280-1». */
  sku: string;
  name: string;
  description: string | null;
  image: ProductImage | null;
  /** Egenskaper slik de vises i varianttabellen, f.eks. ytre mål og farge. */
  attributes: VariantAttribute[];
  outerDimensions: Dimensions | null;
  innerDimensions: Dimensions | null;
  weightKg: number | null;
  material: string | null;
  /** Antall stk. i en bunt eller kolli. Kunden bestiller i hele bunter. */
  unitsPerBundle: number;
  unitsPerPallet: number | null;
  salesMode: SalesMode;
};

export type Product = {
  slug: string;
  name: string;
  shortDescription: string | null;
  description: DescriptionBlock[];
  benefits: { title: string; text: string }[];
  images: ProductImage[];
  group: string;
  industries: string[];
  materials: string[];
  variants: Variant[];
  /** Merknad under varianttabellen, f.eks. «Andre farger på forespørsel». */
  note: string | null;
  datasheetUrl: string | null;
  /** Hvor produktdataene kommer fra, til sporing i demoen. */
  source: { name: string; url: string | null };
};

export type ProductSummary = Pick<Product, "slug" | "name" | "shortDescription" | "group" | "industries"> & {
  image: ProductImage | null;
  variantCount: number;
  skus: string[];
  /** `quote` hvis alle varianter krever tilbud. */
  salesMode: SalesMode;
};

export type ProductFilter = { group?: string; industry?: string; query?: string };

// ---------------------------------------------------------------------------
// Lager (ERP)
// ---------------------------------------------------------------------------

export type StockStatus = "inStock" | "lowStock" | "madeToOrder" | "onRequest";

export type InventoryInfo = {
  sku: string;
  status: StockStatus;
  /** Antall stk. tilgjengelig nå. 0 for bestillingsvarer. */
  available: number;
  /** Normal leveringstid i virkedager. */
  leadTimeDays: number;
};

// ---------------------------------------------------------------------------
// Pris (ERP)
// ---------------------------------------------------------------------------

export type PriceTier = { minQuantity: number; unitPrice: number; label: string };

/** Priser er i NOK per stk., eks. mva. */
export type PriceInfo = {
  sku: string;
  currency: "NOK";
  listPrice: number;
  /** Kundens pris per stk. ved minste antall, etter avtalerabatt. Lik listepris uten kunde. */
  unitPrice: number;
  /** Mengderabatt. Første trinn er alltid fra minste antall. */
  tiers: PriceTier[];
  /** Navnet på prisavtalen, når kunden har en. */
  agreement: string | null;
};

// ---------------------------------------------------------------------------
// Kunde (CRM)
// ---------------------------------------------------------------------------

export type Address = {
  id: string;
  label: string;
  name: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
};

export type CustomerUser = { id: string; name: string; email: string; role: "admin" | "buyer" };

export type PriceAgreement = {
  name: string;
  /** Rabatt i prosent på alle varer. */
  discountPercent: number;
  /** Rabatt i prosent per produktgruppe. Overstyrer `discountPercent`. */
  groupDiscounts: Record<string, number>;
  /** Fastpris per varenummer. Overstyrer rabattene. */
  fixedPrices: Record<string, number>;
};

export type Customer = {
  id: string;
  name: string;
  orgNumber: string;
  industry: string;
  description: string;
  addresses: Address[];
  users: CustomerUser[];
  priceAgreement: PriceAgreement;
  paymentTermsDays: number;
  /** Fraktfri levering over dette beløpet (eks. mva). */
  freeShippingThreshold: number;
};

// ---------------------------------------------------------------------------
// Ordre (ERP)
// ---------------------------------------------------------------------------

/** Spesifikasjon på en skreddersydd emballasje. Tas i bruk i fase B og C. */
export type PackagingSpec = {
  /** FEFCO-kode, f.eks. «0201» for standard bølgepappeske. */
  style: string;
  innerDimensionsMm: { length: number; width: number; height: number };
  /** Bølgetype og kvalitet, f.eks. «B-bølge» eller «BC dobbelbølge». */
  board: string;
  color: string;
  print: { colors: number; description: string } | null;
  notes: string | null;
};

export type OrderStatus = "received" | "confirmed" | "inProduction" | "shipped" | "delivered" | "cancelled";

export type OrderLine = {
  id: string;
  /** Varenummer for katalogvarer. Mangler for skreddersydde linjer. */
  sku: string | null;
  productSlug: string | null;
  name: string;
  quantity: number;
  unitPrice: number;
  /** Fylt ut for skreddersydde linjer. */
  customSpec: PackagingSpec | null;
};

export type OrderTotals = { net: number; shipping: number; vat: number; gross: number };

export type Order = {
  orderNumber: string;
  customerId: string;
  createdAt: string;
  status: OrderStatus;
  lines: OrderLine[];
  deliveryAddress: Address;
  poNumber: string | null;
  requestedDeliveryDate: string | null;
  note: string | null;
  orderedBy: string;
  totals: OrderTotals;
  /** Ordren denne er laget fra, ved gjenkjøp eller variant (fase B). */
  basedOn: { orderNumber: string; kind: "reorder" | "variant" } | null;
};

export type OrderSummary = Pick<
  Order,
  "orderNumber" | "createdAt" | "status" | "poNumber" | "totals" | "basedOn"
> & { lineCount: number; firstLineName: string };

export type PlaceOrderInput = {
  lines: { sku: string; quantity: number }[];
  deliveryAddressId: string;
  poNumber: string | null;
  requestedDeliveryDate: string | null;
  note: string | null;
  orderedBy: string;
  basedOn?: Order["basedOn"];
};

// ---------------------------------------------------------------------------
// Handlekurv (BFF)
// ---------------------------------------------------------------------------

export type CartLine = { sku: string; quantity: number };
export type Cart = { lines: CartLine[] };

/**
 * Domenetypene i nettbutikken. De er uavhengige av mockene og av systemene
 * som skal levere dataene senere (produktkatalog, ERP og CRM). Tjenestene i
 * `services/` bruker bare disse typene.
 */

// ---------------------------------------------------------------------------
// Katalog (PIM)
// ---------------------------------------------------------------------------

export type Taxon = { slug: string; title: string };

/**
 * Produktgruppe, f.eks. «Fisk og sjømat» eller «Mat», som på bewifood.com.
 * Et produkt kan være i flere. `industry` er sluggen til bransjesiden på
 * nettsiden som viser produktene i gruppen, når det finnes en.
 */
export type ProductGroup = Taxon & { order: number; industry: string | null };

/** Type, f.eks. «Eske» eller «Brett», som på bewifood.com. Et produkt har én type. */
export type ProductType = Taxon & { order: number };

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
  /** Sluggen til typen. */
  type: string;
  /** Sluggene til produktgruppene. */
  groups: string[];
  /** Sluggene til materialene. Materialet til hver variant står i `Variant.material`. */
  materials: string[];
  variants: Variant[];
  /** Merknad under varianttabellen, f.eks. «Andre farger på forespørsel». */
  note: string | null;
  datasheetUrl: string | null;
  /** Hvor produktdataene kommer fra, til sporing i demoen. */
  source: { name: string; url: string | null };
};

export type ProductSummary = Pick<
  Product,
  "slug" | "name" | "shortDescription" | "type" | "groups" | "materials"
> & {
  image: ProductImage | null;
  variantCount: number;
  skus: string[];
  /** `quote` hvis alle varianter krever tilbud. */
  salesMode: SalesMode;
};

export type ProductFilter = { group?: string; type?: string; material?: string; query?: string };

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
  /** Rabatt i prosent per produkttype (typens slug). Overstyrer `discountPercent`. */
  typeDiscounts: Record<string, number>;
  /** Fastpris per varenummer. Overstyrer rabattene. */
  fixedPrices: Record<string, number>;
};

export type Customer = {
  id: string;
  name: string;
  orgNumber: string;
  /** Bransjen slik den vises på innloggingssiden, f.eks. «Bakeri». */
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
// Faktura (ERP)
// ---------------------------------------------------------------------------

export type InvoiceStatus = "paid" | "open" | "overdue";

export type Invoice = {
  invoiceNumber: string;
  orderNumber: string;
  issuedAt: string;
  dueAt: string;
  /** Beløp inkl. mva. */
  amount: number;
  status: InvoiceStatus;
};

// ---------------------------------------------------------------------------
// Forespørsler på skreddersydd emballasje (CRM)
// ---------------------------------------------------------------------------

/** Én endring mellom originalen og varianten, f.eks. høyde fra 150 til 200 mm. */
export type SpecChange = { field: string; label: string; from: string; to: string };

export type QuoteRequestStatus = "submitted" | "inReview" | "quoted";

/**
 * Forespørsel på en skreddersydd emballasje. En variant lagres som originalen
 * (`original`) pluss endringene (`changes`), så samme diff kan vises både når
 * kunden fyller ut skjemaet (fase B) og når AI-en lager varianten (fase D).
 */
export type QuoteRequest = {
  id: string;
  customerId: string;
  createdAt: string;
  status: QuoteRequestStatus;
  requestedBy: string;
  name: string;
  spec: PackagingSpec;
  quantity: number;
  /** Ordrelinjen varianten er laget fra. Mangler for nye forespørsler (fase C). */
  basedOn: { orderNumber: string; lineId: string } | null;
  original: { spec: PackagingSpec; quantity: number; unitPrice: number } | null;
  changes: SpecChange[];
  /** Foreløpig pris per stk. eks. mva. Selger bekrefter i tilbudet. */
  estimatedUnitPrice: number | null;
  /** Engangskostnad for stansekniv og trykkplater, eks. mva. Bare for nye esker fra konfiguratoren. */
  estimatedToolingCost: number | null;
  /** Foreløpig leveringstid i virkedager. Bare for nye esker fra konfiguratoren. */
  estimatedLeadTimeDays: number | null;
  note: string | null;
};

/** Én del av en estimert pris per stk., f.eks. papp eller trykk. Rabatter er negative. */
export type EstimatePart = { label: string; amount: number };

/** Estimert pris og leveringstid på en skreddersydd eske (fase C). Beløp i NOK eks. mva. */
export type QuoteEstimate = {
  unitPrice: number;
  /** Engangskostnad for stansekniv og trykkplater. */
  toolingCost: number;
  /** Pris per stk. ganger antall, pluss engangskostnaden. */
  total: number;
  leadTimeDays: number;
  /** Hva prisen per stk. består av. Summen er lik `unitPrice` før avrunding. */
  parts: EstimatePart[];
  /** Navnet på prisavtalen som er brukt, når kunden har en. */
  agreement: string | null;
};

export type QuoteRequestInput = {
  name: string;
  spec: PackagingSpec;
  quantity: number;
  basedOn: QuoteRequest["basedOn"];
  note: string | null;
  requestedBy: string;
};

// ---------------------------------------------------------------------------
// Handlekurv (BFF)
// ---------------------------------------------------------------------------

export type CartLine = { sku: string; quantity: number };
export type Cart = { lines: CartLine[] };

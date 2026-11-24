/**
 * Lager mock-katalogen fra rådataene fra bewifood.com.
 *
 * Kjør: node scripts/shop/build-catalog.mts
 *
 * Leser scripts/shop/data/bewifood-raw.json (fra fetch-bewifood.mts) og
 * skriver src/shop/mock/data/catalog.json. Skriptet gjør dette:
 *
 * - Radene i varianttabellen blir varianter med varenummer, mål, vekt og stk. per pall.
 * - «Lager» gir lagervare, «Forespørsel» gir bestillingsvare. Produkter uten
 *   varianttabell (kundetilpassede kartonger, sekker osv.) krever tilbud.
 * - De 18 produktene som finnes på nettsiden, beholder sluggene sine fra Sanity.
 * - Et lite tillegg (nederst) gir bølgepappesker, som bewifood.com ikke har,
 *   og konkrete varianter av noen forbruksvarer. Tillegget er merket med
 *   `source.name` = «STOK (tillegg for demo)».
 *
 * Buntstørrelser er laget av oss, ut fra vekt og stk. per pall.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

import type {
  Dimensions,
  Product,
  ProductGroup,
  ProductImage,
  SalesMode,
  Taxon,
  Variant,
  VariantAttribute,
} from "../../src/shop/domain.ts";
import type { RawProduct } from "./fetch-bewifood.mts";

const ROOT = path.resolve(import.meta.dirname, "../..");
const RAW_FILE = path.join(ROOT, "scripts/shop/data/bewifood-raw.json");
const SANITY_CATALOG = path.join(ROOT, "scripts/content/catalog-no.json");
const OUT_FILE = path.join(ROOT, "src/shop/mock/data/catalog.json");

// ---------------------------------------------------------------------------
// Grupper, bransjer og materialer
// ---------------------------------------------------------------------------

const groups: ProductGroup[] = [
  { slug: "eske", title: "Esker og kasser", order: 1 },
  { slug: "kar-og-spann", title: "Kar og spann", order: 2 },
  { slug: "brett", title: "Brett", order: 3 },
  { slug: "sekker-og-film", title: "Sekker og film", order: 4 },
  { slug: "ark-og-beskyttelse", title: "Ark og beskyttelse", order: 5 },
  { slug: "transport-og-temperatur", title: "Transport og temperatur", order: 6 },
  { slug: "tilbehor-og-maskiner", title: "Tilbehør og maskiner", order: 7 },
];

/**
 * Overskriften i produktlisten på bewifood.com → produktgruppe. bewifood.com
 * har 16 overskrifter, og mange har bare ett eller to produkter. Vi slår dem
 * sammen til sju grupper med minst fem produkter i hver.
 */
const groupByListHeading: Record<string, string> = {
  Eske: "eske",
  Tub: "kar-og-spann",
  Pail: "kar-og-spann",
  "Bin & Drum": "kar-og-spann",
  Waste: "kar-og-spann",
  Brett: "brett",
  Sekk: "sekker-og-film",
  Wrap: "sekker-og-film",
  Ark: "ark-og-beskyttelse",
  Honeycomb: "ark-og-beskyttelse",
  Transportere: "transport-og-temperatur",
  Temperaturkontrollerede: "transport-og-temperatur",
  Pakkemaskin: "tilbehor-og-maskiner",
  Tilbehør: "tilbehor-og-maskiner",
  "HVAC Caps": "tilbehor-og-maskiner",
  Annen: "tilbehor-og-maskiner",
};

/** Bransjene bruker samme slugger som bransjesidene på nettsiden der de finnes. */
const industries: Taxon[] = [
  { slug: "fisk-og-sjomat", title: "Fisk og sjømat" },
  { slug: "naeringsmiddel", title: "Næringsmiddel" },
  { slug: "beskyttende-emballasje", title: "Beskyttende emballasje" },
  { slug: "transport-og-lagring", title: "Transport og lagring" },
  { slug: "landbruk-og-industri", title: "Landbruk og industri" },
  { slug: "e-handel", title: "E-handel" },
  { slug: "medisinsk", title: "Medisinsk" },
  { slug: "handel", title: "Handel" },
  { slug: "tekniske-komponenter", title: "Tekniske komponenter" },
];

/** WordPress-kategori på bewifood.com → bransje. */
const industryByCategory: Record<string, string> = {
  "fisk-og-sjomat": "fisk-og-sjomat",
  mat: "naeringsmiddel",
  "beskyttende-emballasje": "beskyttende-emballasje",
  "transport-og-lagring": "transport-og-lagring",
  "agri-industry": "landbruk-og-industri",
  "horticulture-no": "landbruk-og-industri",
  medisinsk: "medisinsk",
  "retail-no": "handel",
  "technical-components-no": "tekniske-komponenter",
};

const knownMaterials: Record<string, string> = {
  hdpe: "HDPE",
  pp: "PP",
  lldpe: "LLDPE",
  pe: "PE",
  eps: "EPS",
  kartong: "Kartong",
  bølgepapp: "Bølgepapp",
  jute: "Jute",
};

// ---------------------------------------------------------------------------
// Hjelpefunksjoner
// ---------------------------------------------------------------------------

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toNumber(value: string): number | null {
  const n = parseFloat(value.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Tolker mål som «74 x 44 x 17.3», «60 x 40 x 28.5 cm», «nd 56 h 35» eller
 * «h 23, nd bunn/topp 29,5/25,1». Mål i mm regnes om til cm.
 */
function parseDimensions(value: string, unit: "cm" | "mm"): Dimensions | null {
  const factor = unit === "mm" ? 0.1 : 1;
  const clean = value.toLowerCase().replace(/cm|mm/g, "").trim();
  const box = /^(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)(?:\s*[x×]\s*(\d+(?:[.,]\d+)?))?/.exec(clean);
  if (box) {
    const [length, width, height] = box.slice(1).map((v) => (v ? toNumber(v) : null));
    return {
      length: length !== null ? round1(length * factor) : undefined,
      width: width !== null ? round1(width * factor) : undefined,
      height: height !== null && height !== undefined ? round1(height * factor) : undefined,
    };
  }
  const height = /\bh\s*(\d+(?:[.,]\d+)?)/.exec(clean);
  const diameter = /\bnd[^\d]*(\d+(?:[.,]\d+)?)/.exec(clean);
  if (height || diameter) {
    return {
      height: height ? round1(toNumber(height[1])! * factor) : undefined,
      diameter: diameter ? round1(toNumber(diameter[1])! * factor) : undefined,
    };
  }
  return null;
}

function parseWeightKg(value: string, label: string): number | null {
  const n = toNumber(value);
  if (n === null) return null;
  return /gram/.test(label) ? n / 1000 : n;
}

function parseCount(value: string): number | null {
  const n = parseInt(value.replace(/\s/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

type Column =
  | "sku"
  | "name"
  | "stock"
  | "outer"
  | "inner"
  | "weight"
  | "material"
  | "pallet"
  | "bundle"
  | "color"
  | "other";

function classifyColumn(label: string): Column {
  const l = label.toLowerCase();
  if (/^(art\.?\s*(no|nr)\.?|artikelnr)/.test(l)) return "sku";
  if (/produkt\s*navn|product name|^description$|payload size/.test(l)) return "name";
  if (/lager|stock/.test(l)) return "stock";
  if (/ytre|ekst|ext|utvendig|utvändigt|exterior/.test(l)) return "outer";
  if (/inv\.|indre|innvendig|interior/.test(l)) return "inner";
  if (/vekt|weight|vikt/.test(l)) return "weight";
  if (/materi/.test(l)) return "material";
  if (/pall/.test(l)) return "pallet";
  if (/kolli/.test(l)) return "bundle";
  if (/farge/.test(l)) return "color";
  return "other";
}

/** Penere etiketter for kolonnene i varianttabellen. */
const columnLabels: Partial<Record<Column, string>> = {
  outer: "Ytre mål (cm)",
  inner: "Innvendige mål (cm)",
  weight: "Vekt",
  material: "Materiale",
  pallet: "Stk. per pall",
  bundle: "Stk. per kolli",
  color: "Farge",
};

const otherLabels: Record<string, string> = {
  "temperature range": "Temperaturområde",
  volume: "Volum",
  duration: "Varighet",
  insulation: "Isolasjon",
};

function formatDimensions(d: Dimensions): string {
  if (d.length !== undefined) {
    return [d.length, d.width, d.height]
      .filter((v) => v !== undefined)
      .map((v) => String(v).replace(".", ","))
      .join(" x ");
  }
  return [
    d.diameter !== undefined ? `Ø ${String(d.diameter).replace(".", ",")}` : null,
    d.height !== undefined ? `h ${String(d.height).replace(".", ",")}` : null,
  ]
    .filter(Boolean)
    .join(", ");
}

/** Buntstørrelse ut fra vekt, og slik at den går opp i antall per pall. */
function bundleSize(weightKg: number | null, unitsPerPallet: number | null): number {
  const wanted =
    weightKg === null ? 10 : weightKg >= 1.5 ? 1 : weightKg >= 0.3 ? 5 : weightKg >= 0.05 ? 20 : 50;
  if (!unitsPerPallet) return wanted;
  for (const candidate of [wanted, 25, 20, 10, 5, 4, 2, 1].filter((c) => c <= wanted)) {
    if (unitsPerPallet % candidate === 0) return candidate;
  }
  return 1;
}

function normalizeMaterial(value: string | null | undefined): string | null {
  if (!value) return null;
  return knownMaterials[value.trim().toLowerCase()] ?? null;
}

// ---------------------------------------------------------------------------
// Bygging av produkter fra bewifood.com
// ---------------------------------------------------------------------------

let generatedSku = 8000;
const nextSku = () => `${++generatedSku}-0`;

function buildVariants(raw: RawProduct, images: Map<string, ProductImage>): Variant[] {
  const boxBySku = new Map(raw.variantBoxes.filter((b) => b.sku).map((b) => [b.sku!, b]));
  const table = raw.specTable;

  if (!table || !table.rows.length) {
    // Ingen varianttabell: kundetilpasset produkt som krever tilbud.
    return [
      {
        sku: nextSku(),
        name: raw.name,
        description: raw.shortDescription,
        image: images.values().next().value ?? null,
        attributes: [],
        outerDimensions: null,
        innerDimensions: null,
        weightKg: null,
        material: null,
        unitsPerBundle: 1,
        unitsPerPallet: null,
        salesMode: "quote",
      },
    ];
  }

  const columns = table.columns.map((label) => ({ label, kind: classifyColumn(label) }));
  const hasStockColumn = columns.some((c) => c.kind === "stock");
  const seen = new Set<string>();

  // Noen tabeller gjentar overskriftsraden eller har like rader.
  const headerKey = table.columns.join("|").toLowerCase();
  const uniqueRows = table.rows.filter(
    (row, i, rows) =>
      row.join("|").toLowerCase() !== headerKey &&
      rows.findIndex((other) => other.join("|") === row.join("|")) === i,
  );

  const variants = uniqueRows.map((row) => {
    const cell = (kind: Column) => {
      const i = columns.findIndex((c) => c.kind === kind);
      const value = i >= 0 ? (row[i] ?? "").trim() : "";
      return value && !["-", "?"].includes(value) ? value : null;
    };
    const unitOf = (kind: Column) =>
      /mm/i.test(columns.find((c) => c.kind === kind)?.label ?? "") ? "mm" : "cm";

    let sku = cell("sku");
    if (!sku || seen.has(sku)) sku = nextSku();
    seen.add(sku);

    const box = boxBySku.get(sku);
    const nameCell = cell("name");
    const name =
      columns.find((c) => c.kind === "name")?.label.toLowerCase() === "payload size" && nameCell
        ? `${raw.name} ${nameCell}`
        : (box?.name ?? nameCell ?? raw.name);

    const outerRaw = cell("outer");
    const innerRaw = cell("inner");
    const outerDimensions = outerRaw ? parseDimensions(outerRaw, unitOf("outer")) : null;
    const innerDimensions = innerRaw ? parseDimensions(innerRaw, unitOf("inner")) : null;
    const weightLabel = columns.find((c) => c.kind === "weight")?.label.toLowerCase() ?? "";
    const weightRaw = cell("weight");
    const weightKg = weightRaw ? parseWeightKg(weightRaw, weightLabel) : null;
    const unitsPerPallet = cell("pallet") ? parseCount(cell("pallet")!) : null;
    const bundleCell = cell("bundle");
    const material = normalizeMaterial(cell("material"));

    const stock = cell("stock")?.toLowerCase();
    const salesMode: SalesMode = hasStockColumn
      ? stock === "lager"
        ? "stock"
        : "madeToOrder"
      : cell("sku")
        ? "madeToOrder"
        : "quote";

    const attributes: VariantAttribute[] = [];
    columns.forEach((column, i) => {
      const value = (row[i] ?? "").trim();
      if (!value || ["-", "?"].includes(value)) return;
      if (["sku", "name", "stock"].includes(column.kind)) return;
      let display = value;
      if (column.kind === "outer" && outerDimensions) display = formatDimensions(outerDimensions);
      if (column.kind === "inner" && innerDimensions) display = formatDimensions(innerDimensions);
      if (column.kind === "weight" && weightKg !== null)
        display = `${String(round1(weightKg * 100) / 100).replace(".", ",")} kg`;
      if (column.kind === "pallet" && unitsPerPallet) display = String(unitsPerPallet);
      if (column.kind === "bundle") display = String(parseCount(value) ?? value);
      const label =
        columnLabels[column.kind] ?? otherLabels[column.label.toLowerCase()] ?? column.label.trim();
      attributes.push({
        key: column.kind === "other" ? slugify(column.label) : column.kind,
        label,
        value: display,
      });
    });

    const imageUrl = box?.image;
    return {
      sku,
      name,
      description: box?.text && box.text !== raw.shortDescription ? box.text : null,
      image: (imageUrl && images.get(imageUrl)) || null,
      attributes,
      outerDimensions,
      innerDimensions,
      weightKg,
      material,
      unitsPerBundle: bundleCell ? (parseCount(bundleCell) ?? 1) : bundleSize(weightKg, unitsPerPallet),
      unitsPerPallet,
      salesMode,
    } satisfies Variant;
  });

  // Varianter med samme navn får med egenskapene som skiller dem.
  for (const v of variants) {
    const same = variants.filter((other) => other.name === v.name);
    if (same.length < 2) continue;
    const differing = v.attributes.filter((a) =>
      same.some((other) => other.attributes.find((b) => b.key === a.key)?.value !== a.value),
    );
    if (differing.length) v.name = `${v.name}, ${differing.map((a) => a.value).join(", ")}`;
  }
  return variants;
}

function buildProduct(raw: RawProduct, slug: string): Product {
  const images = new Map<string, ProductImage>();
  for (const image of raw.images) {
    if (image.local) images.set(image.url, { url: image.local, alt: raw.name });
  }
  const variants = buildVariants(raw, images);

  const materials = new Set<string>();
  for (const v of variants) if (v.material) materials.add(v.material);
  for (const c of raw.categories) {
    const m = normalizeMaterial(c.name);
    if (m) materials.add(m);
  }

  const industrySlugs = new Set<string>();
  for (const c of raw.categories) {
    const industry = industryByCategory[c.slug];
    if (industry) industrySlugs.add(industry);
  }

  const datasheet = raw.downloads.find((d) => !/product overview/i.test(d.label));

  return {
    slug,
    name: raw.name,
    shortDescription: raw.shortDescription,
    description: raw.description,
    benefits: raw.benefits,
    images: [...images.values()],
    group: groupByListHeading[raw.listGroup] ?? "tilbehor-og-maskiner",
    industries: [...industrySlugs],
    materials: [...materials],
    variants,
    note: raw.specNote,
    datasheetUrl: datasheet?.url ?? null,
    source: { name: "bewifood.com", url: raw.url },
  };
}

// ---------------------------------------------------------------------------
// Tillegg for demoen
// ---------------------------------------------------------------------------

const SUPPLEMENT_SOURCE = { name: "STOK (tillegg for demo)", url: null };

type VariantInput = Partial<Variant> & Pick<Variant, "sku" | "name">;

function variant(input: VariantInput): Variant {
  return {
    description: null,
    image: null,
    attributes: [],
    outerDimensions: null,
    innerDimensions: null,
    weightKg: null,
    material: null,
    unitsPerBundle: 1,
    unitsPerPallet: null,
    salesMode: "stock",
    ...input,
  };
}

/** Bølgepappeske med innvendige mål i mm, som i STOKs sortiment på stok.dk. */
function boxVariant(
  sku: string,
  prefix: string,
  [l, w, h]: [number, number, number],
  board: string,
  unitsPerBundle: number,
  unitsPerPallet: number,
  salesMode: SalesMode = "stock",
): Variant {
  return variant({
    sku,
    name: `${prefix} ${l} x ${w} x ${h} mm`,
    attributes: [
      { key: "inner", label: "Innvendige mål (mm)", value: `${l} x ${w} x ${h}` },
      { key: "board", label: "Kvalitet", value: board },
      { key: "color", label: "Farge", value: "Brun" },
      { key: "pallet", label: "Stk. per pall", value: String(unitsPerPallet) },
    ],
    innerDimensions: { length: l / 10, width: w / 10, height: h / 10 },
    material: "Bølgepapp",
    unitsPerBundle,
    unitsPerPallet,
    salesMode,
  });
}

const supplementProducts: Product[] = [
  {
    slug: "bolgepappeske",
    name: "Bølgepappeske",
    shortDescription: "Standard amerikanereske (FEFCO 0201) i brun bølgepapp for forsendelse og lagring.",
    description: [
      { type: "h", text: "Allsidig eske for forsendelse og lager" },
      {
        type: "p",
        text: "Amerikanereske med fire klaffer i topp og bunn. Esken leveres flatpakket og settes opp med tape. Velg B-bølge for lette varer og BC dobbelbølge for tunge eller ømfintlige varer.",
      },
      {
        type: "p",
        text: "Trenger du andre mål, en annen kvalitet eller trykk med logo, kan vi lage esken etter mål.",
      },
    ],
    benefits: [
      { title: "Flatpakket", text: "Tar liten plass på lager" },
      { title: "Resirkulerbar", text: "Laget av fornybar fiber" },
      { title: "Etter mål", text: "Kan lages i dine mål og med trykk" },
    ],
    images: [],
    group: "eske",
    industries: ["e-handel", "transport-og-lagring", "handel"],
    materials: ["Bølgepapp"],
    variants: [
      boxVariant("5201-1", "Bølgepappeske", [200, 150, 100], "B-bølge", 25, 1500),
      boxVariant("5201-2", "Bølgepappeske", [300, 200, 150], "B-bølge", 25, 1000),
      boxVariant("5201-3", "Bølgepappeske", [400, 300, 200], "B-bølge", 20, 600),
      boxVariant("5201-4", "Bølgepappeske", [500, 400, 300], "BC dobbelbølge", 10, 300),
      boxVariant("5201-5", "Bølgepappeske", [600, 400, 400], "BC dobbelbølge", 10, 200),
    ],
    note: "Andre mål, kvaliteter og trykk på forespørsel.",
    datasheetUrl: null,
    source: SUPPLEMENT_SOURCE,
  },
  {
    slug: "postboks",
    name: "Postboks",
    shortDescription: "Lettvint forsendelseseske med lokk (FEFCO 0427) for netthandel. Passer i postkassen.",
    description: [
      {
        type: "p",
        text: "Stansede esker som brettes uten tape og lukkes med lokk. Gir et ryddig førsteinntrykk når kunden åpner pakken. De to minste størrelsene passer gjennom de fleste postkasser.",
      },
    ],
    benefits: [
      { title: "Uten tape", text: "Brettes og lukkes på sekunder" },
      { title: "Postkassevennlig", text: "A5 og A4 passer i postkassen" },
    ],
    images: [],
    group: "eske",
    industries: ["e-handel", "handel"],
    materials: ["Bølgepapp"],
    variants: [
      boxVariant("5427-1", "Postboks A5", [220, 160, 50], "E-bølge", 50, 2500),
      boxVariant("5427-2", "Postboks A4", [310, 220, 60], "E-bølge", 50, 1800),
      boxVariant("5427-3", "Postboks", [350, 250, 100], "B-bølge", 25, 1000),
      boxVariant("5427-4", "Postboks", [400, 300, 150], "B-bølge", 25, 600),
    ],
    note: null,
    datasheetUrl: null,
    source: SUPPLEMENT_SOURCE,
  },
  {
    slug: "flaskeeske",
    name: "Flaskeeske",
    shortDescription: "Forsendelseseske med innredning for vin og andre flasker på 0,75 l.",
    description: [
      {
        type: "p",
        text: "Esken har innredning i bølgepapp som holder flaskene på plass under transport. Godkjent for sending med Posten og Bring.",
      },
    ],
    benefits: [{ title: "Trygg frakt", text: "Innredning holder flaskene adskilt" }],
    images: [],
    group: "eske",
    industries: ["e-handel", "naeringsmiddel"],
    materials: ["Bølgepapp"],
    variants: [
      boxVariant("5450-1", "Flaskeeske 1 flaske", [95, 95, 360], "B-bølge", 25, 1200),
      boxVariant("5450-3", "Flaskeeske 3 flasker", [280, 95, 360], "B-bølge", 25, 600),
      boxVariant("5450-6", "Flaskeeske 6 flasker", [280, 190, 360], "BC dobbelbølge", 10, 300),
    ],
    note: "Flaskeesker for magnum og andre formater på forespørsel.",
    datasheetUrl: null,
    source: SUPPLEMENT_SOURCE,
  },
];

/** Konkrete varianter av forbruksvarer som bare har en generell side på bewifood.com. */
const variantOverrides: Record<string, Variant[]> = {
  tape: [
    variant({
      sku: "9101-1",
      name: "Pakketape PP 48 mm x 66 m, brun",
      unitsPerBundle: 36,
      unitsPerPallet: 2160,
    }),
    variant({
      sku: "9101-2",
      name: "Pakketape PP 48 mm x 66 m, klar",
      unitsPerBundle: 36,
      unitsPerPallet: 2160,
    }),
    variant({
      sku: "9102-1",
      name: "Pakketape PP 75 mm x 66 m, brun",
      unitsPerBundle: 24,
      unitsPerPallet: 1440,
    }),
  ],
  strekkfilm: [
    variant({
      sku: "9110-1",
      name: "Strekkfilm manuell 500 mm, 17 my, 300 m",
      unitsPerBundle: 6,
      unitsPerPallet: 240,
    }),
    variant({
      sku: "9110-2",
      name: "Strekkfilm manuell 500 mm, 23 my, 300 m",
      unitsPerBundle: 6,
      unitsPerPallet: 240,
    }),
    variant({
      sku: "9111-1",
      name: "Maskinstrekkfilm 500 mm, 23 my, 1500 m",
      unitsPerBundle: 1,
      unitsPerPallet: 40,
    }),
  ],
  strammeband: [
    variant({ sku: "9120-1", name: "PP-bånd 12 mm x 3000 m", unitsPerBundle: 1, unitsPerPallet: 48 }),
    variant({ sku: "9120-2", name: "PP-bånd 16 mm x 2000 m", unitsPerBundle: 1, unitsPerPallet: 48 }),
  ],
  polybags: [
    variant({
      sku: "9130-1",
      name: "Polybag 600 x 400 mm for isoporkasse",
      unitsPerBundle: 500,
      unitsPerPallet: 40000,
    }),
    variant({
      sku: "9130-2",
      name: "Polybag 800 x 600 mm for isoporkasse",
      unitsPerBundle: 250,
      unitsPerPallet: 20000,
    }),
  ],
  palleark: [
    variant({
      sku: "9140-1",
      name: "Palleark bølgepapp 1200 x 800 mm",
      unitsPerBundle: 50,
      unitsPerPallet: 1000,
    }),
    variant({
      sku: "9140-2",
      name: "Palleark bølgepapp 1200 x 1000 mm",
      unitsPerBundle: 50,
      unitsPerPallet: 800,
    }),
  ],
  pallehetter: [
    variant({
      sku: "9150-1",
      name: "Pallehette PE 1200 x 800 x 1500 mm",
      unitsPerBundle: 50,
      unitsPerPallet: 2000,
    }),
  ],
};

// ---------------------------------------------------------------------------

async function main() {
  const raw = JSON.parse(await readFile(RAW_FILE, "utf8")) as { products: RawProduct[] };
  const sanity = JSON.parse(await readFile(SANITY_CATALOG, "utf8")) as {
    products: { slug: string; sourceUrl: string }[];
  };
  const sanitySlugs = new Map(
    sanity.products.map((p) => [new URL(p.sourceUrl).pathname.replace(/\/$/, "").split("/").pop()!, p.slug]),
  );

  const used = new Set<string>();
  const products: Product[] = [];
  for (const item of raw.products) {
    let slug = sanitySlugs.get(item.bewifoodSlug) ?? slugify(item.name);
    if (used.has(slug)) slug = slugify(item.bewifoodSlug);
    used.add(slug);
    const product = buildProduct(item, slug);
    const override = variantOverrides[item.bewifoodSlug];
    if (override) {
      const image = product.images[0] ?? null;
      product.variants = override.map((v) => ({ ...v, image: v.image ?? image }));
    }
    products.push(product);
  }
  for (const product of supplementProducts) {
    if (used.has(product.slug)) throw new Error(`Slug finnes fra før: ${product.slug}`);
    used.add(product.slug);
    products.push(product);
  }

  products.sort((a, b) => a.name.localeCompare(b.name, "nb"));
  const usedMaterials = new Set(products.flatMap((p) => p.materials));
  const materials: Taxon[] = Object.values(knownMaterials)
    .filter((m) => usedMaterials.has(m))
    .map((title) => ({ slug: slugify(title), title }));

  await mkdir(path.dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify({ groups, industries, materials, products }, null, 2) + "\n");

  const variantCount = products.reduce((n, p) => n + p.variants.length, 0);
  const byMode = products
    .flatMap((p) => p.variants)
    .reduce<Record<string, number>>((acc, v) => ({ ...acc, [v.salesMode]: (acc[v.salesMode] ?? 0) + 1 }), {});
  console.log(
    `Skrev ${products.length} produkter og ${variantCount} varianter til ${path.relative(ROOT, OUT_FILE)}`,
  );
  console.log(byMode);
}

await main();

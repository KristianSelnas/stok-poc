import "server-only";

import type { PackagingSpec } from "../domain";
import { shop } from "../index";
import { estimateVariantUnitPrice, roundToBundle, unitPriceFor } from "../mock/rules";
import { configuratorPath, variantPath } from "../paths";
import {
  boardOptions,
  colorOptions,
  customBoxValues,
  customQuantity,
  diffSpec,
  specName,
  styleOptions,
  validateCustomBox,
} from "../specs";
import type { CartProposalLine, Proposal } from "./types";

/*
 * Verktøyene assistenten kan bruke (prinsipp 1 i docs/nettbutikk/04-ai.md).
 * Lesverktøyene går mot de samme tjenestene som resten av butikken. Forslags-
 * verktøyene endrer ingenting: de sjekker input, legger på pris fra tjenestelaget
 * og gir et forslag som chatpanelet viser som et kort. Kunde-ID kommer fra
 * sesjonen, aldri fra modellen.
 */

export type ToolContext = {
  customerId: string | null;
  /** Sender et forslag til nettleseren. */
  propose: (proposal: Proposal) => void;
};

export type ToolOutcome = { text: string; isError?: boolean };

/** JSON-skjema for et verktøy, i formatet til Anthropic Messages API. */
export type ToolDefinition = {
  name: string;
  description: string;
  input_schema: { type: "object"; properties: Record<string, unknown>; required?: string[] };
};

/** Teksten chatpanelet viser mens verktøyet kjører. */
export const TOOL_LABELS: Record<string, string> = {
  searchProducts: "Søker i katalogen",
  getProduct: "Henter produktet",
  listOrders: "Ser på ordrehistorikken",
  getOrder: "Henter ordren",
  estimateCustomPackaging: "Regner ut pris",
  proposeSpec: "Lager spesifikasjon",
  proposeCart: "Lager forslag til kurv",
  proposeVariant: "Lager varianten",
};

const specSchema = {
  type: "object",
  description: "Spesifikasjon på en skreddersydd eske i bølgepapp. Innvendige mål i millimeter.",
  properties: {
    style: {
      type: "string",
      enum: [...styleOptions],
      description:
        "FEFCO-kode. 0201 er amerikanereske (forsendelse, store esker), 0427 er postboks med lokk.",
    },
    length: { type: "integer", description: "Innvendig lengde i mm" },
    width: { type: "integer", description: "Innvendig bredde i mm" },
    height: { type: "integer", description: "Innvendig høyde (dybde) i mm" },
    board: { type: "string", enum: boardOptions },
    color: { type: "string", enum: colorOptions },
    printColors: {
      type: "integer",
      minimum: 0,
      maximum: 4,
      description: "Antall trykkfarger, 0 = uten trykk",
    },
    printDescription: { type: "string", description: "Hva som trykkes, f.eks. «Logo på to sider»" },
    notes: { type: "string", description: "Innredning, fuktbestandighet og andre krav" },
  },
  required: ["style", "length", "width", "height", "board", "color"],
};

export const TOOLS: ToolDefinition[] = [
  {
    name: "searchProducts",
    description:
      "Søker i STOKs produktkatalog. Gir produkter med slug, navn, type og om de krever tilbud. Bruk korte søkeord, f.eks. «fiskekasse» eller «tape».",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Søkeord" },
        type: { type: "string", description: "Slug for produkttype, f.eks. «eske» eller «brett»" },
      },
    },
  },
  {
    name: "getProduct",
    description:
      "Henter et produkt med varianter, mål, antall per bunt, lagerstatus og kundens pris per stk.",
    input_schema: {
      type: "object",
      properties: { slug: { type: "string" } },
      required: ["slug"],
    },
  },
  {
    name: "listOrders",
    description: "Lister kundens ordre, nyeste først. Krever innlogget kunde.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "getOrder",
    description:
      "Henter en av kundens ordre med linjer. Skreddersydde linjer har `customSpec` og en linje-ID til `proposeVariant`.",
    input_schema: {
      type: "object",
      properties: { orderNumber: { type: "string" } },
      required: ["orderNumber"],
    },
  },
  {
    name: "estimateCustomPackaging",
    description:
      "Estimert pris per stk., engangskostnad og leveringstid for en skreddersydd eske, med kundens avtalerabatt.",
    input_schema: {
      type: "object",
      properties: { spec: specSchema, quantity: { type: "integer" } },
      required: ["spec", "quantity"],
    },
  },
  {
    name: "proposeSpec",
    description:
      "Viser kunden et forslag til skreddersydd eske, med pris og en knapp som åpner konfiguratoren ferdig utfylt. Endrer ingenting.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Kort navn uten mål, f.eks. «Vineske for 6 flasker»" },
        spec: specSchema,
        quantity: { type: "integer", minimum: customQuantity.min },
        reason: { type: "string", description: "Én setning om hvorfor dette passer" },
      },
      required: ["name", "spec", "quantity", "reason"],
    },
  },
  {
    name: "proposeCart",
    description:
      "Viser kunden katalogvarer med pris og en knapp som legger dem i kurven. Antall rundes opp til hele bunter. Endrer ingenting.",
    input_schema: {
      type: "object",
      properties: {
        lines: {
          type: "array",
          items: {
            type: "object",
            properties: { sku: { type: "string" }, quantity: { type: "integer", minimum: 1 } },
            required: ["sku", "quantity"],
          },
        },
        reason: { type: "string" },
      },
      required: ["lines", "reason"],
    },
  },
  {
    name: "proposeVariant",
    description:
      "Viser kunden en variant av en skreddersydd ordrelinje med endringene mot originalen, og en knapp som åpner variantskjemaet. Ta bare med feltene som endres. Endrer ingenting.",
    input_schema: {
      type: "object",
      properties: {
        orderNumber: { type: "string" },
        lineId: { type: "string" },
        changes: {
          type: "object",
          properties: {
            length: { type: "integer" },
            width: { type: "integer" },
            height: { type: "integer" },
            board: { type: "string", enum: boardOptions },
            color: { type: "string", enum: colorOptions },
            printColors: { type: "integer", minimum: 0, maximum: 4 },
            printDescription: { type: "string" },
            notes: { type: "string" },
            quantity: { type: "integer", minimum: 100 },
          },
        },
        reason: { type: "string" },
      },
      required: ["orderNumber", "lineId", "changes", "reason"],
    },
  },
];

// ---------------------------------------------------------------------------
// Hjelpere
// ---------------------------------------------------------------------------

type Input = Record<string, unknown>;

const str = (value: unknown, max = 300) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const int = (value: unknown) => (typeof value === "number" ? Math.round(value) : Math.round(Number(value)));
const json = (value: unknown) => JSON.stringify(value);

class ToolInputError extends Error {}

/** Spesifikasjon fra modellen. Ukjente valg avvises, så modellen kan rette seg. */
function parseSpec(raw: unknown): PackagingSpec {
  const s = (raw ?? {}) as Input;
  const style = str(s.style);
  if (!(styleOptions as readonly string[]).includes(style)) {
    throw new ToolInputError(`Ukjent style «${style}». Gyldige: ${styleOptions.join(", ")}.`);
  }
  const board = str(s.board);
  if (!boardOptions.includes(board)) {
    throw new ToolInputError(`Ukjent board «${board}». Gyldige: ${boardOptions.join(", ")}.`);
  }
  const color = str(s.color);
  if (!colorOptions.includes(color)) {
    throw new ToolInputError(`Ukjent color «${color}». Gyldige: ${colorOptions.join(", ")}.`);
  }
  const colors = Math.max(0, Math.min(4, int(s.printColors) || 0));
  return {
    style,
    innerDimensionsMm: { length: int(s.length), width: int(s.width), height: int(s.height) },
    board,
    color,
    print: colors > 0 ? { colors, description: str(s.printDescription, 200) || "Trykk" } : null,
    notes: str(s.notes) || null,
  };
}

/** Samme grenser som konfiguratoren. Feilene går tilbake til modellen. */
function checkCustomBox(spec: PackagingSpec, quantity: number) {
  const errors = validateCustomBox(spec, quantity);
  const names = { l: "length", b: "width", h: "height", antall: "quantity" } as const;
  const problems = Object.entries(errors).map(
    ([key, message]) => `${names[key as keyof typeof names]}: ${message}`,
  );
  if (problems.length) throw new ToolInputError(`Utenfor det vi kan lage: ${problems.join("; ")}`);
}

function requireCustomer(ctx: ToolContext): string {
  if (!ctx.customerId)
    throw new ToolInputError("Kunden er ikke logget inn. Be kunden logge inn for å se ordre.");
  return ctx.customerId;
}

// ---------------------------------------------------------------------------
// Verktøyene
// ---------------------------------------------------------------------------

type Handler = (input: Input, ctx: ToolContext) => Promise<string>;

const handlers: Record<string, Handler> = {
  async searchProducts(input) {
    const products = await shop().catalog.listProducts({
      query: str(input.query, 100) || undefined,
      type: str(input.type, 50) || undefined,
    });
    return json(
      products.slice(0, 12).map((p) => ({
        slug: p.slug,
        name: p.name,
        type: p.type,
        description: p.shortDescription,
        variants: p.variantCount,
        requiresQuote: p.salesMode === "quote",
      })),
    );
  },

  async getProduct(input, ctx) {
    const product = await shop().catalog.getProduct(str(input.slug, 100));
    if (!product)
      throw new ToolInputError("Fant ikke produktet. Bruk searchProducts for å finne riktig slug.");
    const skus = product.variants.map((v) => v.sku);
    const [prices, inventory] = await Promise.all([
      shop().pricing.getPrices(skus, ctx.customerId ?? undefined),
      shop().inventory.getInventory(skus),
    ]);
    return json({
      slug: product.slug,
      name: product.name,
      description: product.shortDescription,
      note: product.note,
      variants: product.variants.map((v) => ({
        sku: v.sku,
        name: v.name,
        attributes: Object.fromEntries(v.attributes.map((a) => [a.label, a.value])),
        unitsPerBundle: v.unitsPerBundle,
        unitsPerPallet: v.unitsPerPallet,
        requiresQuote: v.salesMode === "quote",
        stock: inventory[v.sku]?.status ?? null,
        leadTimeDays: inventory[v.sku]?.leadTimeDays ?? null,
        unitPriceNok: prices[v.sku]?.unitPrice ?? null,
      })),
    });
  },

  async listOrders(_input, ctx) {
    const orders = await shop().orders.listOrders(requireCustomer(ctx));
    return json(
      orders.slice(0, 20).map((o) => ({
        orderNumber: o.orderNumber,
        date: o.createdAt.slice(0, 10),
        firstLine: o.firstLineName,
        lines: o.lineCount,
      })),
    );
  },

  async getOrder(input, ctx) {
    const order = await shop().orders.getOrder(requireCustomer(ctx), str(input.orderNumber, 20));
    if (!order) throw new ToolInputError("Fant ikke ordren hos denne kunden.");
    return json({
      orderNumber: order.orderNumber,
      date: order.createdAt.slice(0, 10),
      lines: order.lines.map((l) => ({
        lineId: l.id,
        sku: l.sku,
        name: l.name,
        quantity: l.quantity,
        unitPriceNok: l.unitPrice,
        customSpec: l.customSpec,
      })),
    });
  },

  async estimateCustomPackaging(input, ctx) {
    const spec = parseSpec(input.spec);
    const quantity = int(input.quantity);
    checkCustomBox(spec, quantity);
    const estimate = await shop().quotes.estimate(ctx.customerId, spec, quantity);
    return json({ ...estimate, parts: undefined });
  },

  async proposeSpec(input, ctx) {
    const spec = parseSpec(input.spec);
    const quantity = int(input.quantity);
    checkCustomBox(spec, quantity);
    const name = str(input.name, 80) || "Skreddersydd eske";
    const estimate = await shop().quotes.estimate(ctx.customerId, spec, quantity);
    ctx.propose({
      kind: "spec",
      name,
      spec,
      quantity,
      reason: str(input.reason),
      estimate,
      href: configuratorPath({ ...customBoxValues(spec, quantity, name) }),
    });
    return `Forslaget vises for kunden med knappen «Åpne i konfiguratoren». Estimat: ${json({
      unitPriceNok: estimate.unitPrice,
      toolingCostNok: estimate.toolingCost,
      totalNok: estimate.total,
      leadTimeDays: estimate.leadTimeDays,
    })}`;
  },

  async proposeCart(input, ctx) {
    const raw = Array.isArray(input.lines) ? (input.lines as Input[]) : [];
    if (!raw.length) throw new ToolInputError("Forslaget har ingen linjer.");
    const lines: CartProposalLine[] = [];
    for (const item of raw.slice(0, 10)) {
      const entry = await shop().catalog.getVariant(str(item.sku, 30));
      if (!entry) throw new ToolInputError(`Ukjent varenummer «${str(item.sku, 30)}».`);
      const { product, variant } = entry;
      if (variant.salesMode === "quote") {
        throw new ToolInputError(`${variant.sku} krever tilbud og kan ikke legges i kurven.`);
      }
      const quantity = roundToBundle(Math.max(1, int(item.quantity) || 1), variant.unitsPerBundle);
      const price = (await shop().pricing.getPrices([variant.sku], ctx.customerId ?? undefined))[variant.sku];
      lines.push({
        sku: variant.sku,
        productSlug: product.slug,
        name: product.name,
        variantName: variant.name,
        quantity,
        unitPrice: price ? unitPriceFor(price, quantity) : null,
        imageUrl: variant.image?.url ?? product.images[0]?.url ?? null,
      });
    }
    ctx.propose({ kind: "cart", lines, reason: str(input.reason) });
    return `Forslaget vises for kunden med knappen «Legg i kurv». Antall etter avrunding til hele bunter: ${lines
      .map((l) => `${l.sku}: ${l.quantity}`)
      .join(", ")}.`;
  },

  async proposeVariant(input, ctx) {
    const customerId = requireCustomer(ctx);
    const order = await shop().orders.getOrder(customerId, str(input.orderNumber, 20));
    const line = order?.lines.find((l) => l.id === str(input.lineId, 20));
    if (!order || !line) throw new ToolInputError("Fant ikke ordrelinjen. Bruk getOrder for å finne lineId.");
    if (!line.customSpec) {
      throw new ToolInputError(
        "Linjen er en katalogvare. Varianter av katalogvarer foreslås med proposeCart.",
      );
    }
    const o = line.customSpec;
    const c = (input.changes ?? {}) as Input;
    const has = (key: string) => c[key] !== undefined && c[key] !== null;
    const colors = has("printColors") ? Math.max(0, Math.min(4, int(c.printColors))) : (o.print?.colors ?? 0);
    const spec: PackagingSpec = {
      style: o.style,
      innerDimensionsMm: {
        length: has("length") ? int(c.length) : o.innerDimensionsMm.length,
        width: has("width") ? int(c.width) : o.innerDimensionsMm.width,
        height: has("height") ? int(c.height) : o.innerDimensionsMm.height,
      },
      board: has("board") && boardOptions.includes(str(c.board)) ? str(c.board) : o.board,
      color: has("color") && colorOptions.includes(str(c.color)) ? str(c.color) : o.color,
      print:
        colors > 0
          ? { colors, description: str(c.printDescription, 200) || o.print?.description || "Trykk" }
          : null,
      notes: has("notes") ? str(c.notes) || null : o.notes,
    };
    const quantity = has("quantity") ? int(c.quantity) : line.quantity;
    // Samme grenser som variantskjemaet (createVariantRequest).
    const dims = Object.values(spec.innerDimensionsMm);
    if (dims.some((d) => !Number.isFinite(d) || d < 30 || d > 2000)) {
      throw new ToolInputError("Mål må være mellom 30 og 2000 mm.");
    }
    if (!Number.isFinite(quantity) || quantity < 100) throw new ToolInputError("Minste antall er 100 stk.");

    const original = { spec: o, quantity: line.quantity, unitPrice: line.unitPrice };
    const next = { spec, quantity };
    const changes = diffSpec(original, next);
    if (!changes.length) throw new ToolInputError("Varianten er lik originalen. Hva skal endres?");
    const values = customBoxValues(spec, quantity);
    const unitPrice = estimateVariantUnitPrice(original, next);
    ctx.propose({
      kind: "variant",
      orderNumber: order.orderNumber,
      lineId: line.id,
      originalName: line.name,
      name: specName(line.name, spec),
      spec,
      quantity,
      changes,
      estimatedUnitPrice: unitPrice,
      reason: str(input.reason),
      href: variantPath(order.orderNumber, line.id, { ...values, type: undefined, navn: undefined }),
    });
    const list = changes.map((ch) => `${ch.label} ${ch.from} → ${ch.to}`).join("; ");
    return `Varianten vises for kunden med endringene: ${list}. Foreløpig pris ${unitPrice} kr per stk. (originalen ${line.unitPrice} kr). Selger bekrefter prisen.`;
  },
};

/** Kjører et verktøy. Alle feil blir et verktøysvar, så modellen kan rette seg. */
export async function runTool(name: string, input: unknown, ctx: ToolContext): Promise<ToolOutcome> {
  const handler = handlers[name];
  if (!handler) return { text: `Verktøyet ${name} finnes ikke.`, isError: true };
  try {
    return { text: await handler((input ?? {}) as Input, ctx) };
  } catch (error) {
    if (error instanceof ToolInputError) return { text: error.message, isError: true };
    console.error(`Verktøyet ${name} feilet:`, error);
    return {
      text: `Verktøyet ${name} feilet. Prøv igjen eller be kunden kontakte kundeservice.`,
      isError: true,
    };
  }
}

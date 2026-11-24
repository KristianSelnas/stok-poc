import type { PackagingSpec, QuoteEstimate, SpecChange } from "../domain";

/*
 * Typene for assistenten som både serveren og nettleseren bruker: meldingene i
 * samtalen, hendelsene som strømmes fra `/api/butikk/assistent`, og forslagene
 * som vises som kort i chatpanelet.
 */

/**
 * En melding i Anthropic Messages API. Nettleseren lagrer historikken og sender
 * den tilbake uendret, med verktøykall og verktøysvar.
 */
export type ChatMessage = {
  role: "user" | "assistant";
  content: string | Record<string, unknown>[];
};

/** En skreddersydd eske assistenten foreslår. Åpnes i konfiguratoren. */
export type SpecProposal = {
  kind: "spec";
  name: string;
  spec: PackagingSpec;
  quantity: number;
  /** Én setning om hvorfor, skrevet av assistenten. */
  reason: string;
  /** Pris og leveringstid fra `QuoteService.estimate`, med kundens avtalerabatt. */
  estimate: QuoteEstimate;
  /** Konfiguratoren ferdig utfylt. */
  href: string;
};

export type CartProposalLine = {
  sku: string;
  productSlug: string;
  name: string;
  variantName: string;
  /** Rundet opp til hele bunter. */
  quantity: number;
  /** Kundens pris per stk. ved dette antallet. Mangler for varer som krever tilbud. */
  unitPrice: number | null;
  imageUrl: string | null;
};

/** Katalogvarer assistenten foreslår. Kunden legger dem i kurven selv. */
export type CartProposal = {
  kind: "cart";
  lines: CartProposalLine[];
  reason: string;
};

/** En variant av en skreddersydd ordrelinje. Åpnes i variantskjemaet på Min side. */
export type VariantProposal = {
  kind: "variant";
  orderNumber: string;
  lineId: string;
  originalName: string;
  name: string;
  spec: PackagingSpec;
  quantity: number;
  changes: SpecChange[];
  estimatedUnitPrice: number;
  reason: string;
  /** Variantskjemaet med endringene fylt ut. */
  href: string;
};

export type Proposal = SpecProposal | CartProposal | VariantProposal;

/** Hendelsene i svaret fra `/api/butikk/assistent`, én JSON-linje per hendelse. */
export type AssistantEvent =
  | { type: "text"; text: string }
  /** Assistenten kjører et verktøy, f.eks. «Søker i katalogen». */
  | { type: "tool"; name: string; label: string }
  | { type: "proposal"; proposal: Proposal }
  /** Hele historikken etter turen. Nettleseren sender den med neste gang. */
  | { type: "messages"; messages: ChatMessage[] }
  | { type: "error"; message: string }
  | { type: "done" };

/** Hvor kunden bruker assistenten. Gir litt ulik systemprompt. */
export type AssistantContext =
  | { kind: "chat"; path: string }
  /** Feltet i konfiguratoren (D3): én tur som skal ende med `proposeSpec`. */
  | { kind: "configurator" }
  /** «Beskriv endringen» på ordresiden (D4): én tur som skal ende med `proposeVariant`. */
  | { kind: "variant"; orderNumber: string; lineId: string };

import { assistantMode } from "@/shop/assistant";
import { t } from "@/shop/dictionary";
import { getCustomPackagings } from "@/shop/recommendations";
import { getSession } from "@/shop/session";

import { AssistantPanel } from "./AssistantPanel";

/** Forslag til spørsmål: ett behov for bransjen, en variant av emballasjen kunden bestiller oftest, og ett fra katalogen. */
async function suggestionsFor(customerId: string | null, industry: string | null): Promise<string[]> {
  const needs = t.assistantNeedSuggestions[industry ?? ""] ?? t.assistantNeedSuggestions.default;
  const suggestions = [...needs];
  if (customerId) {
    const packagings = await getCustomPackagings(customerId);
    const favourite = [...packagings].sort((a, b) => b.timesOrdered - a.timesOrdered)[0];
    if (favourite) {
      const heightCm = Math.round((favourite.spec.innerDimensionsMm.height + 50) / 10);
      suggestions.push(t.assistantVariantSuggestion(favourite.lastOrderNumber, heightCm));
    }
  }
  suggestions.push(t.assistantCatalogSuggestion);
  return suggestions;
}

/**
 * Emballasjeveilederen i butikken og på Min side (fase D2). Leser sesjonen på
 * serveren, så panelet vet hvem som er logget inn. Selve samtalen går via
 * `/api/butikk/assistent`, som leser sesjonen på nytt.
 */
export async function ShopAssistant() {
  const session = await getSession();
  const customerId = session?.customer.id ?? null;
  const suggestions = await suggestionsFor(customerId, session?.customer.industry ?? null);
  return (
    <AssistantPanel
      storageKey={`stok-assistent:${customerId ?? "gjest"}:${session?.user.id ?? ""}`}
      loggedIn={!!session}
      scripted={assistantMode() === "scripted"}
      suggestions={suggestions}
    />
  );
}

import "server-only";

import { createLlmAssistant } from "./llm";
import { createScriptedAssistant } from "./scripted";
import { TurnError, type AssistantService } from "./service";

export type { AssistantService, TurnInput } from "./service";
export { TurnError } from "./service";

/*
 * Velger assistent (reserveplanen i docs/nettbutikk/04-ai.md):
 *
 * - `SHOP_ASSISTANT=llm` bruker Claude via LLMProxy. Krever `KANTEGA_LLMPROXY_KEY`.
 * - `SHOP_ASSISTANT=scripted` bruker de forhåndslagde svarene.
 * - Uten `SHOP_ASSISTANT` brukes `llm` når nøkkelen finnes, ellers `scripted`.
 *
 * Med `llm` tar `scripted` over hvis LLMProxy feiler før assistenten har sagt noe,
 * så demoen fungerer også når proxyen er nede.
 */

const DEFAULT_BASE_URL = "https://llmproxy.kantega.no";
const DEFAULT_MODEL = "vertex_ai/claude-opus-5-5";

/** Med reserve: hvis LLM-en feiler før første svar, kjører `fallback` samme tur. */
function withFallback(primary: AssistantService, fallback: AssistantService): AssistantService {
  return {
    async runTurn(input) {
      let emitted = false;
      try {
        return await primary.runTurn({
          ...input,
          emit: (event) => {
            if (event.type === "text" || event.type === "proposal") emitted = true;
            input.emit(event);
          },
        });
      } catch (error) {
        if (emitted || input.signal?.aborted || !(error instanceof TurnError) || error.step > 0) throw error;
        console.warn(`LLMProxy feilet, bruker forhåndslagde svar: ${error.message}`);
        return fallback.runTurn(input);
      }
    },
  };
}

function createAssistant(): { service: AssistantService; mode: "llm" | "scripted" } {
  const key = process.env.KANTEGA_LLMPROXY_KEY?.trim();
  const mode = process.env.SHOP_ASSISTANT ?? (key ? "llm" : "scripted");
  const scripted = createScriptedAssistant();
  switch (mode) {
    case "scripted":
      return { service: scripted, mode };
    case "llm":
      if (!key) {
        console.warn("SHOP_ASSISTANT=llm, men KANTEGA_LLMPROXY_KEY mangler. Bruker forhåndslagde svar.");
        return { service: scripted, mode: "scripted" };
      }
      return {
        service: withFallback(
          createLlmAssistant({
            apiKey: key,
            baseURL: process.env.SHOP_ASSISTANT_BASE_URL || DEFAULT_BASE_URL,
            model: process.env.SHOP_ASSISTANT_MODEL || DEFAULT_MODEL,
          }),
          scripted,
        ),
        mode,
      };
    default:
      throw new Error(`Ukjent SHOP_ASSISTANT: «${mode}». Gyldige verdier: llm, scripted.`);
  }
}

let cached: ReturnType<typeof createAssistant> | undefined;

/** Leses ved første kall, så `next build` virker uten nøkkel. */
export function assistant(): AssistantService {
  cached ??= createAssistant();
  return cached.service;
}

export function assistantMode(): "llm" | "scripted" {
  cached ??= createAssistant();
  return cached.mode;
}

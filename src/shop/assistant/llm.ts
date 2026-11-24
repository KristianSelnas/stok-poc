import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam, Tool, ToolResultBlockParam } from "@anthropic-ai/sdk/resources/messages";

import type { AssistantService, TurnInput } from "./service";
import { TurnError } from "./service";
import { systemPrompt } from "./prompt";
import { runTool, TOOL_LABELS, TOOLS, type ToolContext } from "./tools";
import type { ChatMessage } from "./types";

/** Øvre grense for modellkall i én tur, så en forvirret modell ikke går i løkke. */
const MAX_STEPS = 10;
const MAX_TOKENS = 4000;

export type LlmConfig = { apiKey: string; baseURL: string; model: string };

/**
 * Assistenten med Claude via Kantegas LLMProxy (beslutning N6 og N9).
 * `authToken: null` hindrer SDK-et i å lese ANTHROPIC_AUTH_TOKEN fra miljøet og
 * sende den som Bearer-token, som LiteLLM foretrekker framfor `x-api-key`.
 */
export function createLlmAssistant(config: LlmConfig): AssistantService {
  const anthropic = new Anthropic({ apiKey: config.apiKey, authToken: null, baseURL: config.baseURL });

  return {
    async runTurn(input: TurnInput): Promise<ChatMessage[]> {
      const system = await systemPrompt(input.session, input.context);
      const messages = [...input.messages] as MessageParam[];
      const toolContext: ToolContext = {
        customerId: input.session?.customer.id ?? null,
        propose: (proposal) => input.emit({ type: "proposal", proposal }),
      };

      for (let step = 0; step < MAX_STEPS; step++) {
        if (step > 0) input.emit({ type: "text", text: "\n\n" });
        let message;
        try {
          const stream = anthropic.messages.stream(
            { model: config.model, max_tokens: MAX_TOKENS, system, tools: TOOLS as Tool[], messages },
            { signal: input.signal },
          );
          stream.on("text", (text) => input.emit({ type: "text", text }));
          message = await stream.finalMessage();
        } catch (error) {
          throw new TurnError(
            error instanceof Error ? error.message : String(error),
            messages as ChatMessage[],
            step,
          );
        }

        if (message.stop_reason !== "tool_use") {
          // Et verktøykall som ble kuttet av max_tokens har ikke noe svar, og neste kall ville blitt avvist.
          const content = message.content.filter((b) => b.type !== "tool_use");
          messages.push({
            role: "assistant",
            content: content.length ? content : [{ type: "text", text: "…" }],
          });
          return messages as ChatMessage[];
        }
        messages.push({ role: "assistant", content: message.content });

        const results: ToolResultBlockParam[] = [];
        for (const block of message.content) {
          if (block.type !== "tool_use") continue;
          input.emit({ type: "tool", name: block.name, label: TOOL_LABELS[block.name] ?? block.name });
          const outcome = await runTool(block.name, block.input, toolContext);
          results.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: outcome.text,
            ...(outcome.isError ? { is_error: true } : {}),
          });
        }
        messages.push({ role: "user", content: results });
      }
      throw new TurnError(
        "Assistenten brukte for mange steg. Prøv å omformulere.",
        messages as ChatMessage[],
        MAX_STEPS,
      );
    },
  };
}

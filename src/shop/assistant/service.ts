import "server-only";

import type { Session } from "../session";
import type { AssistantContext, AssistantEvent, ChatMessage } from "./types";

export type TurnInput = {
  /** Historikken med kundens nye melding sist. */
  messages: ChatMessage[];
  /** Innlogget kunde, fra cookien. Verktøyene ser bare denne kundens ordre og priser. */
  session: Session | null;
  context: AssistantContext;
  emit: (event: AssistantEvent) => void;
  signal?: AbortSignal;
};

/**
 * Assistenten bak emballasjeveilederen, fritekst i konfiguratoren og varianter
 * med naturlig språk. `src/shop/assistant/index.ts` velger implementasjon.
 */
export interface AssistantService {
  /** Kjører én tur og gir hele historikken tilbake. Kaster `TurnError` hvis turen stopper. */
  runTurn(input: TurnInput): Promise<ChatMessage[]>;
}

/** En tur som stoppet. `messages` er historikken fram til siste hele steg. */
export class TurnError extends Error {
  constructor(
    message: string,
    readonly messages: ChatMessage[],
    /** Antall fullførte modellkall før feilen. 0 betyr at ingenting ble sendt. */
    readonly step: number,
  ) {
    super(message);
    this.name = "TurnError";
  }
}

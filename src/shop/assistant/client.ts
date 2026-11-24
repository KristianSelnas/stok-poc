import type { AssistantContext, AssistantEvent, ChatMessage } from "./types";

/*
 * Kall til assistenten fra nettleseren. Brukes av chatpanelet (D2), feltet i
 * konfiguratoren (D3) og «Beskriv endringen» på ordresiden (D4).
 */

export const ASSISTANT_API = "/api/butikk/assistent";

/** Sender historikken med kundens nye melding sist, og kaller `onEvent` for hver hendelse i svaret. */
export async function streamAssistant(
  body: { messages: ChatMessage[]; context: AssistantContext },
  onEvent: (event: AssistantEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(ASSISTANT_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!response.ok || !response.body) {
    const message = await response
      .json()
      .then((j: { message?: string }) => j.message)
      .catch(() => undefined);
    throw new Error(message ?? `HTTP ${response.status}`);
  }
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    let newline: number;
    while ((newline = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      if (line) onEvent(JSON.parse(line) as AssistantEvent);
    }
  }
}

import { assistant, TurnError } from "@/shop/assistant";
import type { AssistantContext, AssistantEvent, ChatMessage } from "@/shop/assistant/types";
import { getSession } from "@/shop/session";

/*
 * Assistenten i nettbutikken (fase D). Tar imot historikken og kundens nye
 * melding, og strømmer svaret som NDJSON: én `AssistantEvent` per linje.
 * Samtalen ligger i nettleseren. Kunden kommer fra cookien, aldri fra forespørselen.
 */

const MAX_MESSAGES = 60;
const MAX_BODY_BYTES = 300_000;
const MAX_USER_TEXT = 2000;

function badRequest(message: string) {
  return Response.json({ message }, { status: 400 });
}

function parseContext(raw: unknown): AssistantContext | null {
  const c = (raw ?? {}) as Record<string, unknown>;
  const text = (value: unknown, max: number) =>
    typeof value === "string" && value.length <= max ? value : null;
  switch (c.kind) {
    case "chat":
      return { kind: "chat", path: text(c.path, 300) ?? "" };
    case "configurator":
      return { kind: "configurator" };
    case "variant": {
      const orderNumber = text(c.orderNumber, 20);
      const lineId = text(c.lineId, 20);
      return orderNumber && lineId ? { kind: "variant", orderNumber, lineId } : null;
    }
    default:
      return null;
  }
}

/** Historikken slik nettleseren sender den. Siste melding må være kundens tekst. */
function parseMessages(raw: unknown): ChatMessage[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_MESSAGES) return null;
  const messages: ChatMessage[] = [];
  for (const m of raw as Record<string, unknown>[]) {
    if (m?.role !== "user" && m?.role !== "assistant") return null;
    if (typeof m.content !== "string" && !Array.isArray(m.content)) return null;
    messages.push({ role: m.role, content: m.content as ChatMessage["content"] });
  }
  const last = messages.at(-1)!;
  if (last.role !== "user" || typeof last.content !== "string") return null;
  const text = last.content.trim();
  if (!text || text.length > MAX_USER_TEXT) return null;
  messages[messages.length - 1] = { role: "user", content: text };
  return messages;
}

export async function POST(request: Request) {
  const body = await request.text();
  if (body.length > MAX_BODY_BYTES) return badRequest("Samtalen er for lang. Start en ny samtale.");
  let json: Record<string, unknown>;
  try {
    json = JSON.parse(body);
  } catch {
    return badRequest("Ugyldig JSON.");
  }
  const messages = parseMessages(json.messages);
  const context = parseContext(json.context);
  if (!messages || !context) return badRequest("Ugyldig forespørsel.");

  const session = await getSession();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const emit = (event: AssistantEvent) => {
        if (!closed) controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };
      try {
        const history = await assistant().runTurn({
          messages,
          session,
          context,
          emit,
          signal: request.signal,
        });
        emit({ type: "messages", messages: history });
      } catch (error) {
        if (!request.signal.aborted) {
          console.error("Assistenten feilet:", error);
          emit({
            type: "error",
            message:
              "Assistenten svarer ikke akkurat nå. Prøv igjen om litt, eller bruk konfiguratoren direkte.",
          });
          // Ta vare på det som ble gjort, så kunden kan fortsette samtalen.
          if (error instanceof TurnError) emit({ type: "messages", messages: error.messages });
        }
      }
      emit({ type: "done" });
      closed = true;
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}

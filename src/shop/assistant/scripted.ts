import "server-only";

import { shop } from "../index";
import type { AssistantService, TurnInput } from "./service";
import { runTool, TOOL_LABELS, type ToolContext } from "./tools";
import type { ChatMessage } from "./types";

/*
 * Reserveplanen for demoen (docs/nettbutikk/04-ai.md). Assistenten kjenner igjen
 * setningene i demomanuset og noen enkle varianter av dem, og kaller de samme
 * verktøyene som `LlmAssistant`. Da får kunden de samme kortene med de samme
 * prisene, også når LLMProxy er nede eller det ikke finnes noen nøkkel.
 */

const WORD_DELAY_MS = 18;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Teksten i en melding. Verktøysvar og andre blokker hoppes over. */
function textOf(message: ChatMessage): string {
  if (typeof message.content === "string") return message.content;
  return message.content
    .filter((b) => b.type === "text" && typeof b.text === "string")
    .map((b) => b.text as string)
    .join("\n");
}

const userTexts = (messages: ChatMessage[]) =>
  messages
    .filter((m) => m.role === "user")
    .map(textOf)
    .filter(Boolean);

/** Tall i teksten, med «20 cm» regnet om til millimeter. */
function measure(text: string, words: RegExp): number | null {
  const pattern = new RegExp(`(\\d+(?:[.,]\\d+)?)\\s*(mm|cm)\\s*(?:${words.source})`, "i");
  const match = text.match(pattern);
  if (!match) return null;
  const value = Number(match[1].replace(",", "."));
  return Math.round(match[2].toLowerCase() === "cm" ? value * 10 : value);
}

function quantityIn(text: string): number | null {
  const match = text.replace(/(\d)\s(\d{3})/g, "$1$2").match(/(\d+)\s*(stk|esker|eksemplarer|pakker)/i);
  return match ? Number(match[1]) : null;
}

/** «400 x 300 x 200 mm» eller «40 x 30 x 20 cm». */
function dimensionsIn(text: string): { length: number; width: number; height: number } | null {
  const match = text.match(/(\d+)\s*[x×*]\s*(\d+)\s*[x×*]\s*(\d+)\s*(mm|cm)?/i);
  if (!match) return null;
  const factor = match[4]?.toLowerCase() === "cm" ? 10 : 1;
  return { length: +match[1] * factor, width: +match[2] * factor, height: +match[3] * factor };
}

const isWine = (text: string) => /vin|flask/i.test(text);

export function createScriptedAssistant(): AssistantService {
  return {
    async runTurn(input: TurnInput): Promise<ChatMessage[]> {
      const reply: string[] = [];
      const say = async (text: string) => {
        const prefix = reply.length ? "\n\n" : "";
        reply.push(text);
        const words = `${prefix}${text}`.split(/(?<=\s)/);
        for (const word of words) {
          if (input.signal?.aborted) return;
          input.emit({ type: "text", text: word });
          await sleep(WORD_DELAY_MS);
        }
      };
      const ctx: ToolContext = {
        customerId: input.session?.customer.id ?? null,
        propose: (proposal) => input.emit({ type: "proposal", proposal }),
      };
      const tool = async (name: string, args: unknown) => {
        input.emit({ type: "tool", name, label: TOOL_LABELS[name] ?? name });
        return runTool(name, args, ctx);
      };

      const texts = userTexts(input.messages);
      const last = texts.at(-1) ?? "";
      const { context } = input;

      if (context.kind === "variant") {
        await variant(context.orderNumber, context.lineId, last);
      } else if (context.kind === "configurator") {
        await customBox(last, last, true);
      } else if (/ordre\s*\d{5}/i.test(last)) {
        const orderNumber = last.match(/ordre\s*(\d{5})/i)![1];
        await variant(orderNumber, null, last);
      } else {
        // Vinflaskene går over to turer: først oppfølgingsspørsmål, så forslaget.
        const wineStart = texts.findIndex(isWine);
        if (wineStart === texts.length - 1) await askAboutWine();
        else if (wineStart >= 0) await customBox(texts.slice(wineStart).join("\n"), last, false);
        else await searchOrBox(last);
      }

      return [...input.messages, { role: "assistant", content: reply.join("\n\n") || "…" }];

      async function askAboutWine() {
        await say(
          "En amerikanereske i BC dobbelbølge med innredning for 6 flasker tåler posten godt, og fuktbestandig papp tåler litt regn.",
        );
        await say("Hvor mange esker trenger dere, og skal esken ha trykk, f.eks. logoen deres?");
      }

      /** Skreddersydd eske ut fra beskrivelsen. Vinflasker gir en eske med innredning for 6 flasker. */
      async function customBox(allText: string, answer: string, configurator: boolean) {
        const quantity = quantityIn(answer) ?? quantityIn(allText) ?? (isWine(allText) ? 500 : 1000);
        const noPrint = /uten (logo|trykk)|nei/i.test(answer);
        const print = /logo|trykk/i.test(allText) && !noPrint;
        const moisture = /fukt|regn|våt|vann/i.test(allText);

        if (isWine(allText)) {
          const notes = ["Innredning for 6 flasker à 0,75 l"];
          if (moisture) notes.push("Fuktbestandig papp til postforsendelse");
          const result = await tool("proposeSpec", {
            name: "Vineske for 6 flasker",
            spec: {
              style: "0201",
              length: 280,
              width: 190,
              height: 360,
              board: "BC dobbelbølge",
              color: "Brun",
              printColors: print ? 1 : 0,
              printDescription: print ? "Logo på to sider" : "",
              notes: notes.join(". "),
            },
            quantity: Math.max(250, quantity),
            reason: moisture
              ? "Dobbelbølge og innredning beskytter flaskene, og fuktbestandig papp tåler litt regn."
              : "Dobbelbølge og innredning beskytter flaskene i posten.",
          });
          if (result.isError) return say(`Jeg fikk ikke laget forslaget: ${result.text}`);
          return say(
            "Her er et forslag. Åpne det i konfiguratoren for å se tegningen og justere før dere sender forespørselen.",
          );
        }

        const dims = dimensionsIn(allText);
        if (!dims) {
          return say(
            configurator
              ? "Skriv gjerne innvendige mål, f.eks. «400 x 300 x 200 mm, 1000 stk., med logo», så fyller jeg ut skjemaet."
              : "Hvilke innvendige mål trenger dere, og hvor mange? For eksempel «400 x 300 x 200 mm, 1000 stk.».",
          );
        }
        const low = dims.height <= 120 && /gave|lokk|post/i.test(allText);
        const heavy = /tung|skjør|glass/i.test(allText);
        const result = await tool("proposeSpec", {
          name: low ? "Postboks med lokk" : "Forsendelseseske",
          spec: {
            style: low ? "0427" : "0201",
            ...dims,
            board: heavy ? "BC dobbelbølge" : low ? "E-bølge" : "B-bølge",
            color: /hvit/i.test(allText) ? "Hvit" : /sort|svart/i.test(allText) ? "Sort" : "Brun",
            printColors: print ? 1 : 0,
            printDescription: print ? "Logo" : "",
            notes: moisture ? "Fuktbestandig papp" : "",
          },
          quantity: Math.max(250, quantity),
          reason: heavy
            ? "Dobbelbølge gir ekstra styrke til tunge eller skjøre varer."
            : "B-bølge er det vanlige valget til forsendelse.",
        });
        if (result.isError) return say(`Jeg fikk ikke laget forslaget: ${result.text}`);
        return say(
          configurator
            ? "Jeg har fylt ut skjemaet. Se over valgene og juster det som ikke stemmer."
            : "Her er et forslag. Åpne det i konfiguratoren for å se tegningen og justere.",
        );
      }

      /** «Samme som ordre 10329, men 20 cm dype og 500 stk.» */
      async function variant(orderNumber: string, lineId: string | null, text: string) {
        if (!input.session) return say("Logg inn, så kan jeg lage en variant av en tidligere ordre.");
        const result = await tool("getOrder", { orderNumber });
        if (result.isError) return say(`Jeg fant ikke ordre ${orderNumber} hos dere.`);
        const order = await shop().orders.getOrder(input.session.customer.id, orderNumber);
        const line = order?.lines.find((l) => (lineId ? l.id === lineId : l.customSpec));
        if (!line?.customSpec) {
          return say(`Ordre ${orderNumber} har ingen skreddersydd emballasje jeg kan lage en variant av.`);
        }

        const changes: Record<string, number> = {};
        const height = measure(text, /dyp|dybde|høy|høyde/);
        const length = measure(text, /lang|lengde/);
        const width = measure(text, /bred|bredde/);
        const quantity = quantityIn(text);
        if (height) changes.height = height;
        if (length) changes.length = length;
        if (width) changes.width = width;
        if (quantity) changes.quantity = quantity;
        if (!Object.keys(changes).length) {
          return say(`Hva skal endres på «${line.name}»? Skriv for eksempel «20 cm dyp og 500 stk.».`);
        }
        const proposal = await tool("proposeVariant", {
          orderNumber,
          lineId: line.id,
          changes,
          reason: "Endringene du beskrev, med resten som i originalen.",
        });
        if (proposal.isError) return say(`Jeg fikk ikke laget varianten: ${proposal.text}`);
        return say(
          `Her er varianten av «${line.name}». Se over endringene og send forespørselen fra variantskjemaet.`,
        );
      }

      /** Søk i katalogen og foreslå den første varen som kan bestilles. */
      async function searchOrBox(text: string) {
        if (dimensionsIn(text)) return customBox(text, text, false);
        const query = text
          .toLowerCase()
          .replace(/[^\p{L}\d\s]/gu, " ")
          .split(/\s+/)
          .filter((w) => w.length > 3 && !STOP_WORDS.has(w))
          .slice(0, 3);
        for (const word of query) {
          const result = await tool("searchProducts", { query: word.replace(/(er|ene|en|et)$/, "") });
          const products = result.isError
            ? []
            : (JSON.parse(result.text) as { slug: string; name: string }[]);
          if (!products.length) continue;
          const product = await shop().catalog.getProduct(products[0].slug);
          const variant = product?.variants.find((v) => v.salesMode !== "quote");
          if (product && variant) {
            await tool("proposeCart", {
              lines: [{ sku: variant.sku, quantity: quantityIn(text) ?? variant.unitsPerBundle }],
              reason: `${product.name} passer til det du beskriver.`,
            });
            const others = products.slice(1, 4).map((p) => p.name);
            return say(
              `Jeg fant ${product.name}. ${others.length ? `Andre som kan passe: ${others.join(", ")}.` : ""}`.trim(),
            );
          }
        }
        return say(
          "Denne demoen kjører uten AI-tilkobling, så jeg forstår bare noen få setninger. Prøv for eksempel «Jeg skal sende 6 vinflasker med post» eller «Samme som ordre 10329, men 20 cm dype og 500 stk.».",
        );
      }
    },
  };
}

const STOP_WORDS = new Set([
  "jeg",
  "skal",
  "trenger",
  "sende",
  "noen",
  "til",
  "som",
  "med",
  "har",
  "dere",
  "hvor",
  "mange",
  "finne",
  "kjøpe",
  "bestille",
]);

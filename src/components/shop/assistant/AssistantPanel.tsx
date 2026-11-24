"use client";

import { usePathname } from "next/navigation";
import { Fragment, useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";

import { streamAssistant } from "@/shop/assistant/client";
import type { AssistantEvent, ChatMessage, Proposal } from "@/shop/assistant/types";
import { t } from "@/shop/dictionary";

import { buttonClasses } from "../../ui/Button";
import { ProposalCard } from "./ProposalCard";

/** Det kunden ser av samtalen. Historikken til modellen ligger i `history`. */
type Turn = {
  id: string;
  role: "user" | "assistant";
  text: string;
  proposals: Proposal[];
  error?: string;
};

type Conversation = { history: ChatMessage[]; turns: Turn[] };

const EMPTY: Conversation = { history: [], turns: [] };

/** Samtalen tas vare på mens kunden går mellom sidene, per kunde. */
function load(key: string): Conversation {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Conversation) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function save(key: string, conversation: Conversation) {
  try {
    sessionStorage.setItem(key, JSON.stringify(conversation));
  } catch {
    // Full eller sperret lagring. Samtalen virker fortsatt til siden lastes på nytt.
  }
}

/** Fet skrift med **…**. Modellen bruker ikke annen formatering (se systemprompten). */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-stok-blue">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

const BULLET = /^\s*[-*•]\s+/;
const NUMBERED = /^\s*\d+[.)]\s+/;

type Group = { kind: "p" | "ul" | "ol"; lines: string[] };

/** Avsnitt og lister fra modellens tekst. Linjer som starter med «- » eller «1. » blir lister. */
function Paragraphs({ text }: { text: string }) {
  const groups: Group[] = [];
  for (const block of text.trim().split(/\n{2,}/)) {
    let previous: Group | null = null;
    for (const line of block.split("\n")) {
      const kind = BULLET.test(line) ? "ul" : NUMBERED.test(line) ? "ol" : "p";
      if (!previous || previous.kind !== kind) {
        previous = { kind, lines: [] };
        groups.push(previous);
      }
      previous.lines.push(line.replace(kind === "ul" ? BULLET : kind === "ol" ? NUMBERED : /^/, ""));
    }
  }
  return (
    <>
      {groups.map((group, i) => {
        if (group.kind === "p") {
          return (
            <p key={i} className="my-2 first:mt-0 last:mb-0">
              {group.lines.map((l, j) => (
                <Fragment key={j}>
                  {j > 0 && <br />}
                  {inline(l)}
                </Fragment>
              ))}
            </p>
          );
        }
        const List = group.kind;
        return (
          <List key={i} className={`my-2 space-y-1 pl-5 ${List === "ul" ? "list-disc" : "list-decimal"}`}>
            {group.lines.map((l, j) => (
              <li key={j}>{inline(l)}</li>
            ))}
          </List>
        );
      })}
    </>
  );
}

function ChatIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4A2.5 2.5 0 0 1 4 13.5v-8Z" />
      <path d="M8.5 8.5h7M8.5 11.5h4.5" />
    </svg>
  );
}

/**
 * Emballasjeveilederen (fase D2). En knapp nede til høyre åpner et panel der
 * kunden skriver med assistenten. Svaret strømmes, og forslag vises som kort
 * med en knapp kunden trykker på selv.
 */
export function AssistantPanel({
  storageKey,
  loggedIn,
  scripted,
  suggestions,
}: {
  storageKey: string;
  loggedIn: boolean;
  scripted: boolean;
  suggestions: string[];
}) {
  const pathname = usePathname();
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const current = conversation ?? EMPTY;

  // Ny innlogging gir ny samtale.
  const [loadedKey, setLoadedKey] = useState(storageKey);
  if (loadedKey !== storageKey) {
    setLoadedKey(storageKey);
    setConversation(null);
  }

  useEffect(() => {
    if (conversation) save(storageKey, conversation);
  }, [conversation, storageKey]);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [current.turns, status]);

  // Fokus til tekstfeltet når panelet åpnes, og tilbake til knappen når det lukkes.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) inputRef.current?.focus();
    else if (wasOpen.current) launcherRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  useEffect(() => () => abortRef.current?.abort(), []);

  function show() {
    // Samtalen leses fra sessionStorage først når panelet åpnes, så server og nettleser rendrer det samme.
    if (!conversation) setConversation(load(storageKey));
    setOpen(true);
  }

  function hide() {
    setOpen(false);
  }

  /** Lenker i kortene lukker panelet, så kunden ser siden. Samtalen er der når panelet åpnes igjen. */
  function onNavigate() {
    setOpen(false);
  }

  function reset() {
    abortRef.current?.abort();
    setConversation(EMPTY);
    setStatus(null);
    inputRef.current?.focus();
  }

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    const base = conversation ?? load(storageKey);
    const history: ChatMessage[] = [...base.history, { role: "user", content: message }];
    const reply: Turn = { id: crypto.randomUUID(), role: "assistant", text: "", proposals: [] };
    const userTurn: Turn = { id: crypto.randomUUID(), role: "user", text: message, proposals: [] };
    let next: Conversation = { history: base.history, turns: [...base.turns, userTurn, reply] };
    setConversation(next);
    setInput("");
    setBusy(true);
    setStatus(t.assistantThinking);

    const updateReply = (change: (turn: Turn) => Turn) => {
      next = { ...next, turns: next.turns.map((turn) => (turn.id === reply.id ? change(turn) : turn)) };
      setConversation(next);
    };
    const controller = new AbortController();
    abortRef.current = controller;

    const onEvent = (event: AssistantEvent) => {
      switch (event.type) {
        case "text":
          setStatus(null);
          updateReply((turn) => ({ ...turn, text: turn.text + event.text }));
          break;
        case "tool":
          setStatus(`${event.label} …`);
          break;
        case "proposal":
          setStatus(null);
          updateReply((turn) => ({ ...turn, proposals: [...turn.proposals, event.proposal] }));
          break;
        case "messages":
          next = { ...next, history: event.messages };
          setConversation(next);
          break;
        case "error":
          updateReply((turn) => ({ ...turn, error: event.message }));
          break;
      }
    };

    try {
      await streamAssistant(
        { messages: history, context: { kind: "chat", path: pathname } },
        onEvent,
        controller.signal,
      );
    } catch (error) {
      if (!controller.signal.aborted) {
        updateReply((turn) => ({
          ...turn,
          error: error instanceof Error && error.message ? error.message : t.assistantError,
        }));
      }
    } finally {
      // Uten «messages» fra serveren (avbrutt eller feil) beholdes historikken fra før turen.
      setBusy(false);
      setStatus(null);
      if (abortRef.current === controller) abortRef.current = null;
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void send(input);
  }

  if (!open) {
    return (
      <button
        ref={launcherRef}
        type="button"
        onClick={show}
        aria-haspopup="dialog"
        className="fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-full bg-stok-blue px-5 py-3.5 font-meta font-medium text-white shadow-lg ring-2 ring-white transition-colors hover:bg-stok-blue-dark md:right-6 md:bottom-6"
      >
        <ChatIcon />
        {t.assistantOpen}
      </button>
    );
  }

  return (
    <section
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      onKeyDown={(e) => {
        if (e.key === "Escape") hide();
      }}
      className="fixed inset-0 z-50 flex flex-col bg-stok-light shadow-2xl sm:inset-auto sm:right-4 sm:bottom-4 sm:h-[min(44rem,calc(100vh-2rem))] sm:w-[26rem] sm:rounded-3xl sm:ring-1 sm:ring-stok-blue/15 md:right-6 md:bottom-6"
    >
      <header className="flex items-center gap-2 bg-stok-blue px-4 py-3 text-white sm:rounded-t-3xl">
        <ChatIcon className="h-5 w-5" />
        <h2 id={titleId} className="flex-1 font-heading text-lg font-bold text-white">
          {t.assistantTitle}
        </h2>
        {current.turns.length > 0 && (
          <button
            type="button"
            onClick={reset}
            className="rounded-full px-3 py-1 text-sm font-semibold text-white hover:bg-white/10"
          >
            {t.assistantNew}
          </button>
        )}
        <button
          type="button"
          onClick={hide}
          aria-label={t.assistantClose}
          className="flex h-9 w-9 items-center justify-center rounded-full text-2xl leading-none hover:bg-white/10"
        >
          <span aria-hidden="true">×</span>
        </button>
      </header>

      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        aria-busy={busy}
        className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
      >
        {current.turns.length === 0 && (
          <div>
            <p className="rounded-2xl bg-white p-4 ring-1 ring-stok-blue/10">{t.assistantIntro}</p>
            {suggestions.length > 0 && (
              <>
                <p className="mt-5 mb-2 font-meta text-sm font-medium text-stok-blue">
                  {t.assistantSuggestions}
                </p>
                <ul className="space-y-2">
                  {suggestions.map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        onClick={() => void send(s)}
                        className="w-full rounded-2xl border-2 border-stok-blue/15 bg-white px-4 py-2.5 text-left text-sm text-stok-blue hover:border-stok-blue"
                      >
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {scripted && <p className="mt-4 text-xs">{t.assistantScripted}</p>}
          </div>
        )}

        {current.turns.map((turn) =>
          turn.role === "user" ? (
            <div key={turn.id} className="flex justify-end">
              <p className="max-w-[85%] rounded-2xl rounded-br-md bg-stok-blue px-4 py-2.5 whitespace-pre-wrap text-white">
                <span className="sr-only">{t.assistantYou}: </span>
                {turn.text}
              </p>
            </div>
          ) : (
            <div key={turn.id} className="space-y-3">
              {turn.text.trim() && (
                <div className="max-w-[95%] rounded-2xl rounded-bl-md bg-white px-4 py-2.5 ring-1 ring-stok-blue/10">
                  <span className="sr-only">{t.assistantTitle}: </span>
                  <Paragraphs text={turn.text} />
                </div>
              )}
              {turn.proposals.map((proposal, i) => (
                <ProposalCard key={i} proposal={proposal} loggedIn={loggedIn} onNavigate={onNavigate} />
              ))}
              {turn.error && (
                <p className="rounded-2xl bg-red-50 px-4 py-2.5 text-sm text-red-800 ring-1 ring-red-200">
                  {turn.error}
                </p>
              )}
            </div>
          ),
        )}

        {status && (
          <p className="flex items-center gap-2 text-sm text-stok-blue">
            <span aria-hidden="true" className="h-2 w-2 animate-pulse rounded-full bg-stok-green" />
            {status}
          </p>
        )}
      </div>

      <form
        onSubmit={onSubmit}
        className="border-t border-stok-blue/10 bg-white px-4 pt-3 pb-4 sm:rounded-b-3xl"
      >
        <label htmlFor={`${titleId}-input`} className="sr-only">
          {t.assistantInputLabel}
        </label>
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            id={`${titleId}-input`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                void send(input);
              }
            }}
            rows={2}
            maxLength={2000}
            placeholder={t.assistantPlaceholder}
            className="max-h-40 min-h-12 flex-1 resize-none rounded-2xl border-2 border-stok-blue/20 px-3 py-2 text-base focus:border-stok-blue focus:outline-none"
          />
          {busy ? (
            <button
              type="button"
              onClick={() => abortRef.current?.abort()}
              className={buttonClasses("outline", "px-4 py-2.5 text-sm")}
            >
              {t.assistantStop}
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className={buttonClasses("primary", "px-4 py-2.5 text-sm disabled:opacity-50")}
            >
              {t.assistantSend}
            </button>
          )}
        </div>
        <p className="mt-2 text-xs">{t.assistantDisclaimer}</p>
      </form>
    </section>
  );
}

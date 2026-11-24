"use client";

import { useId, useRef, useState } from "react";

import { streamAssistant } from "@/shop/assistant/client";
import type { SpecProposal } from "@/shop/assistant/types";
import { t } from "@/shop/dictionary";

import { buttonClasses } from "../../ui/Button";

type Result = { kind: "filled" | "undone" | "error"; message: string };

/**
 * Fritekst til spesifikasjon (fase D3). Kunden beskriver behovet, og assistenten
 * svarer med `proposeSpec` i én tur. `onSpec` fyller ut konfiguratoren, og
 * `onUndo` setter tilbake verdiene fra før. Ligger inne i konfiguratorens
 * skjema, så den bruker ikke et eget `<form>`.
 */
export function DescribeBox({
  onSpec,
  onUndo,
}: {
  onSpec: (proposal: SpecProposal) => void;
  onUndo: () => void;
}) {
  const id = useId();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [explanation, setExplanation] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function run() {
    const message = text.trim();
    if (!message || busy) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setBusy(true);
    setStatus(t.describeWorking);
    setExplanation("");
    setResult(null);

    let proposal: SpecProposal | null = null;
    let error: string | null = null;
    try {
      await streamAssistant(
        { messages: [{ role: "user", content: message }], context: { kind: "configurator" } },
        (event) => {
          if (event.type === "text") setExplanation((value) => value + event.text);
          else if (event.type === "tool") setStatus(`${event.label} …`);
          else if (event.type === "proposal" && event.proposal.kind === "spec") {
            proposal = event.proposal;
            onSpec(event.proposal);
          } else if (event.type === "error") error = event.message;
        },
        controller.signal,
      );
    } catch (e) {
      if (!controller.signal.aborted) error = e instanceof Error && e.message ? e.message : t.assistantError;
    } finally {
      setBusy(false);
      setStatus(null);
    }
    if (controller.signal.aborted) return;
    if (proposal) setResult({ kind: "filled", message: t.describeFilled });
    else setResult({ kind: "error", message: error ?? t.describeNoSpec });
  }

  function undo() {
    onUndo();
    setResult({ kind: "undone", message: t.describeUndone });
  }

  return (
    <section aria-labelledby={`${id}-title`} className="rounded-3xl bg-stok-blue p-6 text-white">
      <h2 id={`${id}-title`} className="text-xl text-white">
        {t.describeTitle}
      </h2>
      <p className="mt-1 mb-4 text-sm text-white/85">{t.describeLead}</p>
      <label htmlFor={`${id}-text`} className="sr-only">
        {t.describeLabel}
      </label>
      <textarea
        id={`${id}-text`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            void run();
          }
        }}
        rows={3}
        maxLength={2000}
        placeholder={t.describePlaceholder}
        className="w-full resize-y rounded-2xl border-2 border-transparent bg-white px-4 py-2.5 text-stok-text focus:border-stok-green focus:outline-none"
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void run()}
          disabled={busy || !text.trim()}
          className={buttonClasses("primary", "px-5 py-2.5 text-sm hover:bg-white disabled:opacity-60")}
        >
          {t.describeButton}
        </button>
        {result?.kind === "filled" && (
          <button
            type="button"
            onClick={undo}
            className="rounded-full px-4 py-2 text-sm font-semibold text-white underline underline-offset-2 hover:bg-white/10"
          >
            {t.describeUndo}
          </button>
        )}
      </div>
      <div role="status" aria-live="polite" className="mt-3 space-y-2 text-sm">
        {status && (
          <p className="flex items-center gap-2">
            <span aria-hidden="true" className="h-2 w-2 animate-pulse rounded-full bg-stok-green" />
            {status}
          </p>
        )}
        {result && (
          <p className={`font-semibold ${result.kind === "error" ? "text-red-200" : "text-stok-green"}`}>
            {result.message}
          </p>
        )}
        {explanation.trim() && !busy && <p className="text-white/90">{explanation.trim()}</p>}
      </div>
    </section>
  );
}

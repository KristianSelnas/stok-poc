"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState, type FormEvent } from "react";

import { streamAssistant } from "@/shop/assistant/client";
import { t } from "@/shop/dictionary";

import { buttonClasses } from "../../ui/Button";
import { Input } from "../../ui/Form";

/**
 * «Beskriv endringen» på en skreddersydd ordrelinje (fase D4). Assistenten
 * henter ordren, tolker endringen og svarer med `proposeVariant`. Forslaget
 * åpner variantskjemaet med endringene fylt ut, så kunden ser over og sender.
 */
export function DescribeVariant({
  orderNumber,
  lineId,
  lineName,
}: {
  orderNumber: string;
  lineId: string;
  lineName: string;
}) {
  const id = useId();
  const router = useRouter();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const message = text.trim();
    if (!message || busy) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setBusy(true);
    setError(null);
    setStatus(t.describeChangeWorking);

    const result: { href: string | null; failure: string | null } = { href: null, failure: null };
    try {
      await streamAssistant(
        { messages: [{ role: "user", content: message }], context: { kind: "variant", orderNumber, lineId } },
        (e) => {
          if (e.type === "tool") setStatus(`${e.label} …`);
          else if (e.type === "proposal" && e.proposal.kind === "variant") result.href = e.proposal.href;
          else if (e.type === "error") result.failure = e.message;
        },
        controller.signal,
      );
    } catch (e) {
      if (!controller.signal.aborted)
        result.failure = e instanceof Error && e.message ? e.message : t.assistantError;
    }
    if (controller.signal.aborted) return;
    if (result.href) {
      router.push(result.href);
      return;
    }
    setBusy(false);
    setStatus(null);
    setError(result.failure ?? t.describeChangeNoVariant);
  }

  return (
    <details className="mt-4 rounded-2xl bg-stok-light px-4 py-3">
      <summary className="cursor-pointer text-sm font-semibold text-stok-blue">
        {t.describeChangeSummary}
      </summary>
      <form onSubmit={onSubmit} className="mt-3">
        <label htmlFor={`${id}-text`} className="sr-only">
          {t.describeChangeLabel(lineName)}
        </label>
        <div className="flex flex-wrap gap-2">
          <Input
            shape="pill"
            id={`${id}-text`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={500}
            placeholder={t.describeChangePlaceholder}
            className="min-w-0 flex-1"
          />
          <button
            type="submit"
            disabled={busy || !text.trim()}
            className={buttonClasses("primary", "px-5 py-2 text-sm disabled:opacity-60")}
          >
            {t.describeChangeButton}
          </button>
        </div>
        <div role="status" aria-live="polite" className="mt-2 text-sm">
          {status && (
            <p className="flex items-center gap-2 text-stok-blue">
              <span aria-hidden="true" className="h-2 w-2 animate-pulse rounded-full bg-stok-green" />
              {status}
            </p>
          )}
          {error && <p className="font-semibold text-red-700">{error}</p>}
        </div>
      </form>
    </details>
  );
}

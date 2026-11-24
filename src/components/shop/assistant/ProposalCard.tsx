"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";

import { addLinesToCart } from "@/shop/actions";
import type { CartProposal, Proposal, SpecProposal, VariantProposal } from "@/shop/assistant/types";
import { t } from "@/shop/dictionary";
import { formatNok, formatNumber } from "@/shop/format";
import { shopPath } from "@/shop/paths";
import { formatDimensions, formatPrint, styleShortLabels } from "@/shop/specs";

import { buttonClasses } from "../../ui/Button";
import { ChangesTable } from "../SpecSummary";

const cardClass = "rounded-2xl bg-white p-4 ring-1 ring-stok-blue/15";
const kickerClass = "mb-1 font-meta text-xs font-medium tracking-wide text-stok-green-dark uppercase";
const smallButton = "px-5 py-2 text-sm";

type CardProps<P> = { proposal: P; loggedIn: boolean; onNavigate: () => void };

function SpecCard({ proposal: p, loggedIn, onNavigate }: CardProps<SpecProposal>) {
  const { spec, estimate } = p;
  return (
    <div className={cardClass}>
      <p className={kickerClass}>{t.assistantSuggestedBox}</p>
      <h3 className="text-lg leading-snug">{p.name}</h3>
      <p className="mt-1 text-sm">
        {styleShortLabels[spec.style] ?? spec.style}, {formatDimensions(spec)}, {spec.board},{" "}
        {spec.color.toLowerCase()}. {formatPrint(spec.print)}.
      </p>
      {spec.notes && <p className="mt-1 text-sm">{spec.notes}</p>}
      {p.reason && <p className="mt-2 text-sm italic">{p.reason}</p>}
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 text-sm">
        <dt>{t.quantity}</dt>
        <dd className="text-right font-semibold text-stok-blue">{formatNumber(p.quantity)} stk.</dd>
        <dt>{t.estimatedPrice}</dt>
        <dd className="text-right font-semibold text-stok-blue">
          {formatNok(estimate.unitPrice)} {t.perUnit}
        </dd>
        {estimate.toolingCost > 0 && (
          <>
            <dt>{t.toolingCostShort}</dt>
            <dd className="text-right text-stok-blue">{formatNok(estimate.toolingCost)}</dd>
          </>
        )}
        <dt>{t.estimatedTotal}</dt>
        <dd className="text-right text-stok-blue">{formatNok(estimate.total)}</dd>
        <dt>{t.leadTimeLabel}</dt>
        <dd className="text-right text-stok-blue">{t.leadTimeValue(estimate.leadTimeDays)}</dd>
      </dl>
      {!loggedIn && <p className="mt-2 text-xs">{t.assistantGuidePrice}</p>}
      <Link href={p.href} onClick={onNavigate} className={buttonClasses("primary", `mt-4 ${smallButton}`)}>
        {t.assistantOpenConfigurator}
      </Link>
    </div>
  );
}

function CartCard({ proposal: p, loggedIn, onNavigate }: CardProps<CartProposal>) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const add = () =>
    startTransition(async () => {
      setResult(await addLinesToCart(p.lines.map((l) => ({ sku: l.sku, quantity: l.quantity }))));
    });

  return (
    <div className={cardClass}>
      <p className={kickerClass}>{t.assistantSuggestedProducts}</p>
      <ul className="divide-y divide-stok-blue/10">
        {p.lines.map((line) => (
          <li key={line.sku} className="flex items-center gap-3 py-2">
            {line.imageUrl ? (
              <Image
                src={line.imageUrl}
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 shrink-0 rounded-lg bg-stok-grey object-contain"
              />
            ) : (
              <span className="h-12 w-12 shrink-0 rounded-lg bg-stok-grey" />
            )}
            <span className="min-w-0 flex-1 text-sm">
              <Link
                href={shopPath(`/produkter/${line.productSlug}`)}
                onClick={onNavigate}
                className="block font-semibold text-stok-blue underline-offset-2 hover:underline"
              >
                {line.variantName}
              </Link>
              <span>
                {t.sku} {line.sku} · {formatNumber(line.quantity)} stk.
              </span>
            </span>
            <span className="text-right text-sm font-semibold whitespace-nowrap text-stok-blue">
              {line.unitPrice !== null ? `${formatNok(line.unitPrice)}` : t.assistantPriceOnRequest}
            </span>
          </li>
        ))}
      </ul>
      {p.reason && <p className="mt-1 text-sm italic">{p.reason}</p>}
      {!loggedIn && <p className="mt-2 text-xs">{t.assistantGuidePrice}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        {result?.ok ? (
          <Link
            href={shopPath("/handlekurv")}
            onClick={onNavigate}
            className={buttonClasses("secondary", smallButton)}
          >
            {t.assistantGoToCart}
          </Link>
        ) : (
          <button
            type="button"
            onClick={add}
            disabled={pending}
            className={buttonClasses("primary", `${smallButton} disabled:opacity-60`)}
          >
            {t.assistantAddToCart}
          </button>
        )}
        <p role="status" className="text-sm font-semibold text-stok-blue">
          {result?.message}
        </p>
      </div>
    </div>
  );
}

function VariantCard({ proposal: p, onNavigate }: CardProps<VariantProposal>) {
  return (
    <div className={cardClass}>
      <p className={kickerClass}>{t.assistantSuggestedVariant(p.orderNumber)}</p>
      <h3 className="text-lg leading-snug">{p.name}</h3>
      <p className="mt-1 mb-2 text-sm">
        {t.original}: {p.originalName}
      </p>
      <ChangesTable changes={p.changes} />
      {p.reason && <p className="mt-2 text-sm italic">{p.reason}</p>}
      <p className="mt-2 text-sm">
        {t.estimatedPrice}:{" "}
        <span className="font-semibold text-stok-blue">
          {formatNok(p.estimatedUnitPrice)} {t.perUnit}
        </span>
      </p>
      <Link href={p.href} onClick={onNavigate} className={buttonClasses("primary", `mt-4 ${smallButton}`)}>
        {t.assistantReviewVariant}
      </Link>
    </div>
  );
}

/** Et forslag fra assistenten. Kunden bekrefter alltid selv (prinsipp 3 i docs/nettbutikk/04-ai.md). */
export function ProposalCard(props: CardProps<Proposal>) {
  const { proposal } = props;
  switch (proposal.kind) {
    case "spec":
      return <SpecCard {...props} proposal={proposal} />;
    case "cart":
      return <CartCard {...props} proposal={proposal} />;
    case "variant":
      return <VariantCard {...props} proposal={proposal} />;
  }
}

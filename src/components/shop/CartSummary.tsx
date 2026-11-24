import type { OrderTotals } from "@/shop/domain";
import { t } from "@/shop/dictionary";
import { formatNok } from "@/shop/format";

/** Summer for kurv, kasse og ordre: varer, frakt, mva og totalt. */
export function CartSummary({
  totals,
  freeShippingThreshold,
}: {
  totals: OrderTotals;
  freeShippingThreshold?: number;
}) {
  return (
    <div>
      <dl className="space-y-2">
        <div className="flex justify-between gap-4">
          <dt>{t.subtotal}</dt>
          <dd>{formatNok(totals.net)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>{t.shipping}</dt>
          <dd>{totals.shipping ? formatNok(totals.shipping) : t.freeShipping}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>{t.vat}</dt>
          <dd>{formatNok(totals.vat)}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-stok-blue/15 pt-3 text-lg font-bold text-stok-blue">
          <dt>{t.total}</dt>
          <dd>{formatNok(totals.gross)}</dd>
        </div>
      </dl>
      {freeShippingThreshold && totals.shipping > 0 ? (
        <p className="mt-3 text-sm">{t.freeShippingFrom(formatNok(freeShippingThreshold))}</p>
      ) : null}
    </div>
  );
}

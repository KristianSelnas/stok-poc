import type { InventoryInfo } from "@/shop/domain";
import { t } from "@/shop/dictionary";
import { formatNumber } from "@/shop/format";

const dot: Record<InventoryInfo["status"], string> = {
  inStock: "bg-stok-green-dark",
  lowStock: "bg-amber-500",
  madeToOrder: "bg-stok-blue",
  onRequest: "bg-stok-blue/40",
};

/** Lagerstatus med farget prikk, antall og leveringstid. */
export function StockBadge({
  inventory,
  detailed = false,
}: {
  inventory: InventoryInfo;
  detailed?: boolean;
}) {
  return (
    <div className="text-sm">
      <p className="flex items-center gap-2 font-semibold text-stok-blue">
        <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${dot[inventory.status]}`} />
        {t.stockStatus[inventory.status]}
      </p>
      {detailed && (
        <p className="mt-1 pl-4.5 text-stok-text">
          {inventory.available > 0 && <>{t.available(formatNumber(inventory.available))}. </>}
          {t.leadTime(inventory.leadTimeDays)}
        </p>
      )}
    </div>
  );
}

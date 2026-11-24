import Link from "next/link";

import type { ProductSummary } from "@/shop/domain";
import { t } from "@/shop/dictionary";
import { formatNok } from "@/shop/format";
import { productPath } from "@/shop/paths";

import { ProductImageBox } from "./ProductImageBox";

/** Produktkort i butikken. Hele kortet er klikkbart. `fromPrice` vises når den er kjent. */
export function ShopProductCard({
  product,
  typeTitle,
  fromPrice,
  headingLevel = "h3",
}: {
  product: ProductSummary;
  typeTitle?: string;
  fromPrice?: number | null;
  /** `h4` når kortene står under en overskrift på nivå 3, f.eks. i katalogen gruppert etter type. */
  headingLevel?: "h3" | "h4";
}) {
  const Heading = headingLevel;
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-stok-blue/10 transition-shadow hover:shadow-lg">
      <ProductImageBox
        image={product.image}
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        className="aspect-[4/3]"
      />
      <div className="flex flex-1 flex-col p-5">
        {typeTitle && (
          <p className="font-meta text-xs font-medium tracking-wide text-stok-green-dark uppercase">
            {typeTitle}
          </p>
        )}
        <Heading className="mt-1 text-lg">
          <Link href={productPath(product.slug)} className="after:absolute after:inset-0">
            {product.name}
          </Link>
        </Heading>
        {product.shortDescription && <p className="mt-2 line-clamp-2 text-sm">{product.shortDescription}</p>}
        <div className="mt-auto flex items-end justify-between gap-3 pt-4 text-sm">
          <span className="text-stok-text">
            {product.salesMode === "quote" ? t.priceOnRequest : t.variants(product.variantCount)}
          </span>
          {fromPrice != null && product.salesMode !== "quote" && (
            <span className="font-semibold text-stok-blue">
              {t.fromPrice} {formatNok(fromPrice)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

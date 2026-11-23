import Link from "next/link";

import { documentHref } from "@/lib/links";
import type { MarketId } from "@/lib/markets";
import type { ProductCard as ProductCardData } from "@/sanity/types";

import { ContentImage } from "./ContentImage";

/** Produktkort med bilde, gruppe, navn og kort beskrivelse. Hele kortet er klikkbart. */
export function ProductCard({ product, market }: { product: ProductCardData; market: MarketId }) {
  const href = documentHref("product", product.slug, market);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-stok-blue/10 transition-shadow hover:shadow-lg">
      <div className="relative aspect-square bg-stok-grey">
        {product.image?.url ? (
          <ContentImage
            image={product.image}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center text-stok-blue/20"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-16 w-16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
            >
              <path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5v-9Z" />
              <path d="M3.5 7.5 12 12l8.5-4.5M12 12v9" />
            </svg>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {product.group && (
          <p className="font-meta text-xs font-medium tracking-wide text-stok-green-dark uppercase">
            {product.group}
          </p>
        )}
        <h3 className="mt-1 text-lg">
          {href ? (
            <Link href={href} className="after:absolute after:inset-0">
              {product.title}
            </Link>
          ) : (
            product.title
          )}
        </h3>
        {product.shortDescription && <p className="mt-2 line-clamp-3 text-sm">{product.shortDescription}</p>}
      </div>
    </article>
  );
}

export function ProductCardGrid({
  products,
  market,
  columns = 4,
}: {
  products: ProductCardData[];
  market: MarketId;
  columns?: 3 | 4;
}) {
  return (
    <ul className={`grid gap-6 sm:grid-cols-2 ${columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
      {products.map((product) => (
        <li key={product._id}>
          <ProductCard product={product} market={market} />
        </li>
      ))}
    </ul>
  );
}

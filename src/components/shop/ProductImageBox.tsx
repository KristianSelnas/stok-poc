import Image from "next/image";

import type { ProductImage } from "@/shop/domain";

/** Produktbilde med lys bakgrunn, eller en eske-ikon når bildet mangler. */
export function ProductImageBox({
  image,
  sizes,
  className = "",
  preload = false,
}: {
  image: ProductImage | null;
  sizes: string;
  className?: string;
  preload?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden bg-stok-grey ${className}`}>
      {image ? (
        <Image
          src={image.url}
          alt={image.alt}
          fill
          sizes={sizes}
          preload={preload}
          className="object-contain p-4"
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center text-stok-blue/25"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-1/3 w-1/3"
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
  );
}

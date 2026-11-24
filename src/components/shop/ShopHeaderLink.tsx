import Link from "next/link";

import { t } from "@/shop/dictionary";
import { shopPath } from "@/shop/paths";

function StoreIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinejoin="round"
    >
      <path d="M4 9.5 5.5 4h13L20 9.5" />
      <path d="M4 9.5a2.67 2.67 0 0 0 5.33 0 2.67 2.67 0 0 0 5.34 0 2.67 2.67 0 0 0 5.33 0" />
      <path d="M5.5 12v8h13v-8" />
      <path d="M10 20v-4.5h4V20" />
    </svg>
  );
}

/** Lenke til forsiden av nettbutikken i headeren. Handlekurven nås fra butikkmenyen. */
export function ShopHeaderLink() {
  return (
    <Link
      href={shopPath()}
      className="flex shrink-0 items-center gap-2 rounded-full border-2 border-stok-blue/15 px-3 py-1.5 font-semibold text-stok-blue hover:border-stok-blue hover:bg-stok-light"
    >
      <StoreIcon />
      <span className="sr-only sm:not-sr-only">{t.shop}</span>
    </Link>
  );
}

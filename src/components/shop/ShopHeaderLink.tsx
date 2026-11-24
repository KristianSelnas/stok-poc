import Link from "next/link";

import { getCartCount } from "@/shop/cart-view";
import { t } from "@/shop/dictionary";
import { shopPath } from "@/shop/paths";

function CartIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path d="M3 4h2l2.2 10.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 8H6.2" />
      <circle cx="9.5" cy="19.5" r="1.25" />
      <circle cx="17" cy="19.5" r="1.25" />
    </svg>
  );
}

function ShopLink({ count }: { count: number | null }) {
  return (
    <Link
      href={count ? shopPath("/handlekurv") : shopPath()}
      className="relative flex shrink-0 items-center gap-2 rounded-full border-2 border-stok-blue/15 px-3 py-1.5 font-semibold text-stok-blue hover:border-stok-blue hover:bg-stok-light"
    >
      <CartIcon />
      <span className="hidden sm:inline">{t.shop}</span>
      {count ? (
        <>
          <span
            aria-hidden="true"
            className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-stok-green px-1 text-xs font-bold text-stok-blue"
          >
            {count}
          </span>
          <span className="sr-only">, {t.cartWithCount(count)}</span>
        </>
      ) : null}
    </Link>
  );
}

/** Lenke til nettbutikken i headeren, med antall varer i kurven. */
export async function ShopHeaderLink() {
  return <ShopLink count={await getCartCount()} />;
}

/** Vises mens kurven lastes, og i det statiske skallet. */
export function ShopHeaderLinkFallback() {
  return <ShopLink count={null} />;
}

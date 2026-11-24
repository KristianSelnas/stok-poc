import Link from "next/link";
import { Suspense } from "react";

import { logout } from "@/shop/actions";
import { getCartCount } from "@/shop/cart-view";
import { t } from "@/shop/dictionary";
import { configuratorPath, minSidePath, shopPath } from "@/shop/paths";
import { getSession } from "@/shop/session";

const linkClass = "rounded-full px-3 py-1.5 font-semibold text-white hover:bg-white/10";

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

/** Handlekurven ligger først i høyre del av menyen, med antall varer når kurven ikke er tom. */
function CartLink({ count }: { count: number | null }) {
  return (
    <li className="sm:ml-auto">
      <Link href={shopPath("/handlekurv")} className={`${linkClass} flex items-center gap-2`}>
        <CartIcon />
        {t.cart}
        {count ? (
          <>
            <span
              aria-hidden="true"
              className="flex h-5 min-w-5 items-center justify-center rounded-full bg-stok-green px-1.5 text-xs font-bold text-stok-blue"
            >
              {count}
            </span>
            <span className="sr-only">, {t.itemCount(count)}</span>
          </>
        ) : null}
      </Link>
    </li>
  );
}

async function SessionStatus() {
  const [session, count] = await Promise.all([getSession(), getCartCount()]);
  return (
    <>
      {session && (
        <li>
          <Link href={minSidePath()} className={linkClass}>
            {t.minSide}
          </Link>
        </li>
      )}
      <CartLink count={count} />
      {session ? (
        <li className="flex items-center gap-2">
          <span className="text-sm text-white/80">
            <span className="sr-only">{t.loggedInAs} </span>
            {session.user.name}, <span className="font-semibold text-white">{session.customer.name}</span>
          </span>
          <form action={logout}>
            <button type="submit" className={`${linkClass} border border-white/30 text-sm`}>
              {t.logout}
            </button>
          </form>
        </li>
      ) : (
        <li>
          <Link
            href={shopPath("/logg-inn")}
            className={`${linkClass} bg-stok-green text-stok-blue hover:bg-white`}
          >
            {t.login}
          </Link>
        </li>
      )}
    </>
  );
}

/** Mørk linje under headeren med butikkens egne lenker og innloggingsstatus. */
export function ShopBar() {
  return (
    <nav aria-label={t.shopNavigation} className="bg-stok-blue">
      <ul className="mx-auto flex min-h-14 max-w-page flex-wrap items-center gap-x-1 gap-y-2 px-5 py-2 md:px-8">
        <li className="mr-2">
          <Link href={shopPath()} className="font-heading text-lg font-bold text-white">
            {t.shopHome}
          </Link>
        </li>
        <li>
          <Link href={configuratorPath()} className={linkClass}>
            {t.configurator}
          </Link>
        </li>
        <Suspense fallback={<CartLink count={null} />}>
          <SessionStatus />
        </Suspense>
      </ul>
    </nav>
  );
}

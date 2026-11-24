import Link from "next/link";
import { Suspense } from "react";

import { logout } from "@/shop/actions";
import { getCartCount } from "@/shop/cart-view";
import { t } from "@/shop/dictionary";
import { shopPath } from "@/shop/paths";
import { getSession } from "@/shop/session";

const linkClass = "rounded-full px-3 py-1.5 font-semibold text-white hover:bg-white/10";

async function SessionStatus() {
  const [session, count] = await Promise.all([getSession(), getCartCount()]);
  return (
    <>
      <li>
        <Link href={shopPath("/handlekurv")} className={linkClass}>
          {t.cart}
          {count > 0 && (
            <span className="ml-1.5 rounded-full bg-stok-green px-2 py-0.5 text-xs font-bold text-stok-blue">
              <span className="sr-only">(</span>
              {count}
              <span className="sr-only"> varer)</span>
            </span>
          )}
        </Link>
      </li>
      {session ? (
        <li className="flex items-center gap-2 sm:ml-auto">
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
        <li className="sm:ml-auto">
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
        <Suspense
          fallback={
            <li>
              <Link href={shopPath("/handlekurv")} className={linkClass}>
                {t.cart}
              </Link>
            </li>
          }
        >
          <SessionStatus />
        </Suspense>
      </ul>
    </nav>
  );
}

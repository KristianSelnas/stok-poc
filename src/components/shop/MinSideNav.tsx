"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { t } from "@/shop/dictionary";
import { minSidePath } from "@/shop/paths";

const items = [
  { path: "", label: t.overview },
  { path: "/ordre", label: t.ordersTitle },
  { path: "/emballasjer", label: t.packagingsTitle },
  { path: "/foresporsler", label: t.requestsTitle },
  { path: "/fakturaer", label: t.invoicesTitle },
  { path: "/firma", label: t.companyTitle },
];

/** Faner på Min side. Variantskjemaet hører til «Ordre». */
export function MinSideNav() {
  const pathname = usePathname();
  const isCurrent = (path: string) => {
    const href = minSidePath(path);
    if (!path) return pathname === href;
    if (path === "/ordre") return pathname.startsWith(href) || pathname.startsWith(minSidePath("/variant"));
    return pathname.startsWith(href);
  };

  return (
    <nav aria-label={t.minSideNav} className="mb-8">
      <ul className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {items.map((item) => {
          const current = isCurrent(item.path);
          return (
            <li key={item.path}>
              <Link
                href={minSidePath(item.path)}
                aria-current={current ? "page" : undefined}
                className={`inline-block rounded-full border-2 px-4 py-1.5 font-semibold whitespace-nowrap ${
                  current
                    ? "border-stok-blue bg-stok-blue text-white"
                    : "border-stok-blue/15 bg-white text-stok-blue hover:border-stok-blue"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

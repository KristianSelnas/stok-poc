import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { market as getMarketParam } from "next/root-params";

import { ShopBar } from "@/components/shop/ShopBar";
import { SHOP_MARKET } from "@/shop/paths";

export const metadata: Metadata = {
  title: { default: "Nettbutikk", template: "%s | Nettbutikk | STOK Emballage" },
};

/** Nettbutikken finnes bare i det norske markedet (beslutning N5). */
export default async function ShopLayout({ children }: LayoutProps<"/[market]/butikk">) {
  if ((await getMarketParam()) !== SHOP_MARKET) notFound();
  return (
    <>
      <ShopBar />
      {children}
    </>
  );
}

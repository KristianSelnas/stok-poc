import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { market as getMarketParam } from "next/root-params";
import { Suspense } from "react";

import { MinSideNav } from "@/components/shop/MinSideNav";
import { ShopAssistant } from "@/components/shop/assistant/ShopAssistant";
import { ShopBar } from "@/components/shop/ShopBar";
import { Container } from "@/components/ui/Container";
import { SHOP_MARKET } from "@/shop/paths";

export const metadata: Metadata = {
  title: { default: "Min side", template: "%s | Min side | STOK Emballage" },
  robots: { index: false },
};

/** Min side hører til nettbutikken og finnes bare i det norske markedet. */
export default async function MinSideLayout({ children }: LayoutProps<"/[market]/min-side">) {
  if ((await getMarketParam()) !== SHOP_MARKET) notFound();
  return (
    <>
      <ShopBar />
      <section className="min-h-[60vh] bg-stok-light py-10 md:py-14">
        <Container>
          <MinSideNav />
          {children}
        </Container>
      </section>
      <Suspense>
        <ShopAssistant />
      </Suspense>
    </>
  );
}

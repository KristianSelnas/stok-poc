import type { Metadata } from "next";
import { Nunito, Poppins } from "next/font/google";
import { notFound } from "next/navigation";
import { market as getMarketParam } from "next/root-params";
import { stegaClean } from "next-sanity";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { LivePreview } from "@/components/preview/LivePreview";
import { getSiteSettings } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { isMarket, marketIds, markets } from "@/lib/markets";
import { allowIndexing, siteUrl } from "@/lib/site";

import "../../globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "600", "700", "800"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
});

export function generateStaticParams() {
  return marketIds.map((market) => ({ market }));
}

export async function generateMetadata(): Promise<Metadata> {
  const market = await getMarketParam();
  if (!isMarket(market)) return {};
  const settings = stegaClean(await getSiteSettings(market));
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: settings.title ?? "STOK Emballage",
      template: `%s | ${settings.title ?? "STOK Emballage"}`,
    },
    description: settings.description ?? undefined,
    // PoC-en skal ikke indekseres (se `allowIndexing` i lib/site.ts).
    robots: allowIndexing ? undefined : { index: false, follow: false },
  };
}

export default async function SiteLayout({ children }: LayoutProps<"/[market]">) {
  const market = await getMarketParam();
  if (!isMarket(market)) notFound();
  const t = getDictionary(market);

  return (
    <html lang={markets[market].language} className={`${nunito.variable} ${poppins.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#innhold"
          className="sr-only z-50 rounded-full bg-stok-blue px-5 py-3 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          {t.skipToContent}
        </a>
        <Header market={market} />
        <main id="innhold" className="flex-1">
          {children}
        </main>
        <Footer market={market} />
        <LivePreview />
      </body>
    </html>
  );
}

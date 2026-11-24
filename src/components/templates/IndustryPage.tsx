import Link from "next/link";

import { getDictionary } from "@/lib/dictionaries";
import { marketPath, type MarketId } from "@/lib/markets";
import { getSiteCatalog, productsForIndustry, toCards } from "@/lib/products";
import { documentPath, routePrefixes } from "@/lib/routes";
import type { Industry } from "@/sanity/types";

import { Hero } from "../modules/Hero";
import { Modules } from "../modules/Modules";
import { buttonClasses } from "../ui/Button";
import { Container } from "../ui/Container";
import { ProductCardGrid } from "../ui/ProductCard";

/**
 * Bransjeside: hero fra bransjens egne felt, deretter modulene redaktøren
 * har lagt til, og til slutt produkter for bransjen. Produktene kommer fra
 * produktkatalogen: produktgruppene som peker på bransjesiden (fase N).
 */
export async function IndustryPage({ industry, market }: { industry: Industry; market: MarketId }) {
  const t = getDictionary(market);
  const catalog = await getSiteCatalog(market);
  const all = industry.slug ? productsForIndustry(catalog, industry.slug) : [];
  const products = toCards(catalog, all.slice(0, 8));
  const group = catalog.groups.find((g) => g.industry === industry.slug);
  const catalogHref = marketPath(
    market,
    `/${routePrefixes.product[market]}${group ? `?gruppe=${group.slug}` : ""}`,
  );

  return (
    <>
      <Hero
        module={{
          _type: "hero",
          _key: "industry-hero",
          eyebrow: t.industry,
          title: industry.heroTitle || industry.title || "",
          lead: industry.lead,
          image: industry.image,
          ctas: null,
        }}
        market={market}
        isFirst
      />
      <Modules
        modules={industry.modules}
        market={market}
        path={marketPath(market, documentPath("industry", industry.slug, market))}
        hasHeading
      />
      {products.length > 0 && (
        <section className="py-14 md:py-20">
          <Container>
            <h2 className="mb-10 text-3xl md:text-4xl">
              {t.productsFor} {industry.title?.toLowerCase()}
            </h2>
            <ProductCardGrid products={products} market={market} />
            {all.length > products.length && (
              <Link href={catalogHref} className={buttonClasses("outline", "mt-10")}>
                {t.seeAllProducts}
              </Link>
            )}
          </Container>
        </section>
      )}
    </>
  );
}

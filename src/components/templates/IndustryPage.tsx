import { getDictionary } from "@/lib/dictionaries";
import { marketPath, type MarketId } from "@/lib/markets";
import { documentPath } from "@/lib/routes";
import type { Industry } from "@/sanity/types";

import { Hero } from "../modules/Hero";
import { Modules } from "../modules/Modules";
import { Container } from "../ui/Container";
import { ProductCardGrid } from "../ui/ProductCard";

/**
 * Bransjeside: hero fra bransjens egne felt, deretter modulene redaktøren
 * har lagt til, og til slutt produkter for bransjen.
 */
export function IndustryPage({ industry, market }: { industry: Industry; market: MarketId }) {
  const t = getDictionary(market);
  const featured = (industry.featuredProducts ?? []).filter(Boolean);
  const products = (featured.length ? featured : (industry.industryProducts ?? [])).slice(0, 8);

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
          </Container>
        </section>
      )}
    </>
  );
}

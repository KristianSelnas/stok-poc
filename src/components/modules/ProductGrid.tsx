import type { MarketId } from "@/lib/markets";
import { getSiteCatalog, productsForIndustry, toCards } from "@/lib/products";
import type { ModuleOf } from "@/sanity/types";

import { buttonClasses } from "../ui/Button";
import { CmsLink } from "../ui/CmsLink";
import { Container } from "../ui/Container";
import { ProductCardGrid } from "../ui/ProductCard";
import { SectionHeader } from "./SectionHeader";

/** Utvalg av produkter fra produktkatalogen: av en type, i en produktgruppe eller for en bransje. */
export async function ProductGrid({ module, market }: { module: ModuleOf<"productGrid">; market: MarketId }) {
  const catalog = await getSiteCatalog(market);
  const source = module.source ?? "type";
  const selected =
    source === "industry"
      ? module.industry
        ? productsForIndustry(catalog, module.industry)
        : []
      : source === "group"
        ? catalog.products.filter((p) => !!module.productGroup && p.groups.includes(module.productGroup))
        : catalog.products.filter((p) => p.type === module.productType);
  const products = toCards(catalog, selected.slice(0, module.limit ?? 4));
  if (!products.length) return null;

  return (
    <section className="py-14 md:py-20">
      <Container>
        <SectionHeader eyebrow={module.eyebrow} title={module.title} intro={module.intro} />
        <ProductCardGrid products={products} market={market} />
        {module.cta && (
          <CmsLink link={module.cta} market={market} className={buttonClasses("outline", "mt-10")} />
        )}
      </Container>
    </section>
  );
}

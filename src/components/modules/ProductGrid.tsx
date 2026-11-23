import type { MarketId } from "@/lib/markets";
import type { ModuleOf } from "@/sanity/types";

import { buttonClasses } from "../ui/Button";
import { CmsLink } from "../ui/CmsLink";
import { Container } from "../ui/Container";
import { ProductCardGrid } from "../ui/ProductCard";
import { SectionHeader } from "./SectionHeader";

/** Utvalg av produkter: valgt manuelt, fra en gruppe eller fra en bransje. */
export function ProductGrid({ module, market }: { module: ModuleOf<"productGrid">; market: MarketId }) {
  const products = (module.products ?? []).slice(0, module.limit ?? 4);
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

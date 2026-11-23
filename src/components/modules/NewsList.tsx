import { getDictionary } from "@/lib/dictionaries";
import type { MarketId } from "@/lib/markets";
import type { ModuleOf } from "@/sanity/types";

import { buttonClasses } from "../ui/Button";
import { CmsLink } from "../ui/CmsLink";
import { Container } from "../ui/Container";
import { NewsCardGrid } from "../ui/NewsCard";
import { SectionHeader } from "./SectionHeader";

/** Nyhetsliste, sortert med nyeste først. Uten antall vises alle. */
export function NewsList({ module, market }: { module: ModuleOf<"newsList">; market: MarketId }) {
  const all = module.articles ?? [];
  const articles = module.limit ? all.slice(0, module.limit) : all;
  const t = getDictionary(market);

  return (
    <section className="py-14 md:py-20">
      <Container>
        <SectionHeader eyebrow={module.eyebrow} title={module.title} />
        {articles.length ? (
          <NewsCardGrid articles={articles} market={market} />
        ) : (
          <p className="rounded-3xl bg-stok-light p-8">{t.noNews}</p>
        )}
        {module.cta && (
          <CmsLink link={module.cta} market={market} className={buttonClasses("outline", "mt-10")} />
        )}
      </Container>
    </section>
  );
}

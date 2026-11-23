import type { MarketId } from "@/lib/markets";
import { resolveHref } from "@/lib/links";
import type { ModuleOf } from "@/sanity/types";

import { CmsLink } from "../ui/CmsLink";
import { Container } from "../ui/Container";
import { ContentImage } from "../ui/ContentImage";
import { SectionHeader } from "./SectionHeader";

type CardGridProps = { module: ModuleOf<"cardGrid">; market: MarketId };

const columnClasses = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
} as const;

/**
 * Rutenett med kort. Hele kortet er klikkbart når det har lenke: lenken
 * strekkes over kortet med et pseudo-element, så skjermlesere bare hører én lenke.
 */
export function CardGrid({ module, market }: CardGridProps) {
  const { eyebrow, title, intro, cards, columns } = module;
  if (!cards?.length) return null;

  return (
    <section className="py-14 md:py-20">
      <Container>
        <SectionHeader eyebrow={eyebrow} title={title} intro={intro} />
        <ul className={`grid gap-6 ${columnClasses[columns ?? 3]}`}>
          {cards.map((card) => {
            const href = resolveHref(card.link, market);
            return (
              <li
                key={card._key}
                className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-stok-blue/10 transition-shadow hover:shadow-lg"
              >
                {card.image?.url ? (
                  <div className="relative aspect-[3/2] overflow-hidden">
                    <ContentImage
                      image={card.image}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div aria-hidden="true" className="h-2 bg-stok-green" />
                )}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl">{card.title}</h3>
                  {card.text && <p className="mt-2 flex-1">{card.text}</p>}
                  {card.link && href && (
                    <CmsLink
                      link={card.link}
                      market={market}
                      className="mt-4 inline-flex items-center gap-2 font-meta text-sm font-medium text-stok-blue group-hover:text-stok-green-dark after:absolute after:inset-0"
                    >
                      {card.link.label} <span aria-hidden="true">→</span>
                    </CmsLink>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}

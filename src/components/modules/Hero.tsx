import type { MarketId } from "@/lib/markets";
import type { ModuleOf } from "@/sanity/types";

import { buttonClasses } from "../ui/Button";
import { CmsLink } from "../ui/CmsLink";
import { Container } from "../ui/Container";
import { ContentImage } from "../ui/ContentImage";
import { Eyebrow } from "./SectionHeader";

type HeroProps = { module: ModuleOf<"hero">; market: MarketId; isFirst: boolean };

/**
 * Toppseksjon med H1. Med bilde: tekst til venstre og bilde med avrundet
 * venstrekant til høyre, inspirert av halvsirkel-formene på stok.dk.
 * Uten bilde: kompakt tekstblokk.
 */
export function Hero({ module, market, isFirst }: HeroProps) {
  const { eyebrow, title, lead, image, ctas } = module;
  const hasImage = Boolean(image?.url);

  return (
    <section className="overflow-hidden bg-stok-light">
      <Container
        className={`grid items-center gap-10 ${
          hasImage ? "py-12 md:py-16 lg:grid-cols-2 lg:py-20" : "py-14 md:py-20"
        }`}
      >
        <div className={hasImage ? "" : "max-w-3xl"}>
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h1
            className={hasImage ? "text-4xl leading-tight md:text-5xl xl:text-6xl" : "text-4xl md:text-5xl"}
          >
            {title}
          </h1>
          {lead && <p className="mt-6 max-w-xl text-lg md:text-xl">{lead}</p>}
          {!!ctas?.length && (
            <div className="mt-8 flex flex-wrap gap-4">
              {ctas.map((cta, index) => (
                <CmsLink
                  key={cta._key}
                  link={cta}
                  market={market}
                  className={buttonClasses(index === 0 ? "primary" : "outline")}
                />
              ))}
            </div>
          )}
        </div>
        {hasImage && (
          <div className="relative -mr-5 aspect-[4/3] md:-mr-8 lg:aspect-[5/4]">
            <div
              aria-hidden="true"
              className="absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-stok-green lg:h-40 lg:w-40"
            />
            <div className="absolute inset-0 overflow-hidden rounded-l-full">
              <ContentImage
                image={image}
                fill
                preload={isFirst}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}

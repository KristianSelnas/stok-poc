import type { MarketId } from "@/lib/markets";
import type { ModuleOf } from "@/sanity/types";

import { PortableText } from "../PortableText";
import { CmsLink } from "../ui/CmsLink";
import { Container } from "../ui/Container";
import { ContentImage } from "../ui/ContentImage";
import { Eyebrow } from "./SectionHeader";

type TextWithImageProps = { module: ModuleOf<"textWithImage">; market: MarketId };

/** Tekst og bilde side om side. Bildeplasseringen styres fra Studio. */
export function TextWithImage({ module, market }: TextWithImageProps) {
  const { eyebrow, title, body, image, imagePosition, cta } = module;
  const imageLeft = imagePosition === "left";

  return (
    <section className="py-14 md:py-20">
      <Container className="grid items-center gap-10 md:grid-cols-2 lg:gap-16">
        <div className={imageLeft ? "md:order-2" : ""}>
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h2 className="text-3xl md:text-4xl">{title}</h2>
          <PortableText value={body} market={market} className="mt-5 text-lg" />
          {cta && (
            <CmsLink
              link={cta}
              market={market}
              className="mt-6 inline-flex items-center gap-2 font-meta font-medium text-stok-blue underline decoration-stok-green decoration-2 underline-offset-8 hover:decoration-stok-blue"
            >
              {cta.label} <span aria-hidden="true">→</span>
            </CmsLink>
          )}
        </div>
        <div
          className={`relative aspect-[4/3] overflow-hidden ${
            imageLeft ? "rounded-l-3xl rounded-r-[8rem]" : "rounded-l-[8rem] rounded-r-3xl"
          }`}
        >
          <ContentImage image={image} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>
      </Container>
    </section>
  );
}

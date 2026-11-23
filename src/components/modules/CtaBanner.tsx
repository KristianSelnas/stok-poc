import type { MarketId } from "@/lib/markets";
import type { ModuleOf } from "@/sanity/types";

import { buttonClasses, type ButtonVariant } from "../ui/Button";
import { CmsLink } from "../ui/CmsLink";
import { Container } from "../ui/Container";
import { ContentImage } from "../ui/ContentImage";

type CtaBannerProps = { module: ModuleOf<"ctaBanner">; market: MarketId };

const tones: Record<"blue" | "green" | "light", { box: string; text: string; button: ButtonVariant }> = {
  blue: { box: "bg-stok-blue", text: "text-white", button: "primary" },
  green: { box: "bg-stok-green", text: "text-stok-blue", button: "secondary" },
  light: { box: "bg-stok-light", text: "text-stok-blue", button: "secondary" },
};

/** Fremhevet boks med overskrift, tekst og én knapp. */
export function CtaBanner({ module, market }: CtaBannerProps) {
  const { title, text, cta, image, tone } = module;
  const style = tones[tone ?? "blue"];
  const hasImage = Boolean(image?.url);

  return (
    <section className="py-14 md:py-20">
      <Container>
        <div
          className={`grid overflow-hidden rounded-[2.5rem] ${style.box} ${hasImage ? "md:grid-cols-[3fr_2fr]" : ""}`}
        >
          <div className={`p-8 md:p-12 lg:p-16 ${style.text}`}>
            <h2 className={`text-3xl md:text-4xl ${style.text}`}>{title}</h2>
            {text && <p className="mt-4 max-w-xl text-lg opacity-90">{text}</p>}
            {cta && <CmsLink link={cta} market={market} className={buttonClasses(style.button, "mt-8")} />}
          </div>
          {hasImage && (
            <div className="relative min-h-56 md:overflow-hidden md:rounded-l-full">
              <ContentImage
                image={image}
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

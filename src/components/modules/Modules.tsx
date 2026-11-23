import type { MarketId } from "@/lib/markets";
import type { Module } from "@/sanity/types";

import { CardGrid } from "./CardGrid";
import { CtaBanner } from "./CtaBanner";
import { FeatureList } from "./FeatureList";
import { Hero } from "./Hero";
import { RichText } from "./RichText";
import { TextWithImage } from "./TextWithImage";

type ModulesProps = {
  modules: Module[] | null | undefined;
  market: MarketId;
};

/** Rendrer sidemodulene i rekkefølgen redaktøren har valgt. */
export function Modules({ modules, market }: ModulesProps) {
  if (!modules?.length) return null;

  return modules.map((module, index) => {
    switch (module._type) {
      case "hero":
        return <Hero key={module._key} module={module} market={market} isFirst={index === 0} />;
      case "richText":
        return <RichText key={module._key} module={module} market={market} />;
      case "textWithImage":
        return <TextWithImage key={module._key} module={module} market={market} />;
      case "cardGrid":
        return <CardGrid key={module._key} module={module} market={market} />;
      case "featureList":
        return <FeatureList key={module._key} module={module} />;
      case "ctaBanner":
        return <CtaBanner key={module._key} module={module} market={market} />;
      default:
        return null;
    }
  });
}

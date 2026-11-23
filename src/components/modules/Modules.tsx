import type { MarketId } from "@/lib/markets";
import type { Module } from "@/sanity/types";

import { CardGrid } from "./CardGrid";
import { ContactPeople } from "./ContactPeople";
import { CtaBanner } from "./CtaBanner";
import { FeatureList } from "./FeatureList";
import { Hero } from "./Hero";
import { Locations } from "./Locations";
import { LogoRow } from "./LogoRow";
import { NewsList } from "./NewsList";
import { ProductCatalog, type SearchParams } from "./ProductCatalog";
import { ProductGrid } from "./ProductGrid";
import { RichText } from "./RichText";
import { Testimonials } from "./Testimonials";
import { TextWithImage } from "./TextWithImage";

type ModulesProps = {
  modules: Module[] | null | undefined;
  market: MarketId;
  /** Adressen til siden modulene ligger på (brukes av produktkatalogen). */
  path?: string;
  /** Sendes videre til moduler som leser URL-parametere (produktkatalogen). */
  searchParams?: SearchParams;
  /** Settes når siden allerede har en H1 over modulene (f.eks. bransjesider). */
  hasHeading?: boolean;
};

/** Rendrer sidemodulene i rekkefølgen redaktøren har valgt. */
export function Modules({ modules, market, path = "/", searchParams, hasHeading = false }: ModulesProps) {
  if (!modules?.length) return null;

  return modules.map((module, index) => {
    switch (module._type) {
      case "hero":
        return (
          <Hero key={module._key} module={module} market={market} isFirst={index === 0 && !hasHeading} />
        );
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
      case "productGrid":
        return <ProductGrid key={module._key} module={module} market={market} />;
      case "productCatalog":
        return (
          <ProductCatalog
            key={module._key}
            module={module}
            market={market}
            basePath={path}
            searchParams={searchParams}
          />
        );
      case "newsList":
        return <NewsList key={module._key} module={module} market={market} />;
      case "contactPeople":
        return <ContactPeople key={module._key} module={module} market={market} />;
      case "locations":
        return <Locations key={module._key} module={module} market={market} />;
      case "testimonials":
        return <Testimonials key={module._key} module={module} />;
      case "logoRow":
        return <LogoRow key={module._key} module={module} />;
      default:
        return null;
    }
  });
}

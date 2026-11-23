import type { MarketId } from "@/lib/markets";
import type { ModuleOf } from "@/sanity/types";

import { PortableText } from "../PortableText";
import { Container } from "../ui/Container";

export function RichText({ module, market }: { module: ModuleOf<"richText">; market: MarketId }) {
  return (
    <section className="py-14 md:py-20">
      <Container>
        <PortableText value={module.content} market={market} className="max-w-3xl text-lg" />
      </Container>
    </section>
  );
}

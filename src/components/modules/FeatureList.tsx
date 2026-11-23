import type { ModuleOf } from "@/sanity/types";

import { Container } from "../ui/Container";
import { FeatureIcon } from "../ui/FeatureIcon";
import { SectionHeader } from "./SectionHeader";

/** Liste med fordeler, hver med rundt grønt ikon (som på stok.dk). */
export function FeatureList({ module }: { module: ModuleOf<"featureList"> }) {
  const { eyebrow, title, intro, items } = module;
  if (!items?.length) return null;
  const columns = items.length % 3 === 0 ? "lg:grid-cols-3" : "lg:grid-cols-4";

  return (
    <section className="py-14 md:py-20">
      <Container>
        <SectionHeader eyebrow={eyebrow} title={title} intro={intro} />
        <ul className={`grid gap-x-8 gap-y-10 sm:grid-cols-2 ${columns}`}>
          {items.map((item) => (
            <li key={item._key}>
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-stok-green/15 text-stok-green-dark ring-2 ring-stok-green">
                <FeatureIcon name={item.icon} className="h-7 w-7" />
              </span>
              <h3 className="mt-4 text-xl">{item.title}</h3>
              {item.text && <p className="mt-2">{item.text}</p>}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

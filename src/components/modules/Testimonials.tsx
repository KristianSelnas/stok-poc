import type { ModuleOf } from "@/sanity/types";

import { Container } from "../ui/Container";
import { ContentImage } from "../ui/ContentImage";
import { SectionHeader } from "./SectionHeader";

/** Kundesitater på blå bakgrunn, som på forsiden til stok.dk. */
export function Testimonials({ module }: { module: ModuleOf<"testimonials"> }) {
  const items = (module.items ?? []).filter(Boolean);
  if (!items.length) return null;

  return (
    <section className="bg-stok-blue py-14 text-white md:py-20">
      <Container>
        <SectionHeader eyebrow={module.eyebrow} title={module.title} inverted />
        <ul className={`grid gap-6 ${items.length > 1 ? "md:grid-cols-2 lg:grid-cols-3" : ""}`}>
          {items.map((item) => (
            <li key={item._id}>
              <figure className="flex h-full flex-col rounded-3xl bg-white/10 p-8">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 32 24"
                  className="h-6 w-8 text-stok-green"
                  fill="currentColor"
                >
                  <path d="M0 24V14C0 6 4 1 12 0l1 4c-4 1-6 4-6 8h5v12H0Zm19 0V14c0-8 4-13 12-14l1 4c-4 1-6 4-6 8h5v12H19Z" />
                </svg>
                <blockquote className="mt-4 flex-1 text-lg">{item.quote}</blockquote>
                <figcaption className="mt-6 flex items-center gap-4">
                  {item.logo?.url && (
                    <div className="relative h-10 w-20 shrink-0 rounded bg-white p-1">
                      <ContentImage image={item.logo} fill sizes="80px" className="object-contain" />
                    </div>
                  )}
                  <div>
                    {item.name && <p className="font-semibold">{item.name}</p>}
                    <p className="text-sm text-white/80">
                      {[item.role, item.company].filter(Boolean).join(", ")}
                    </p>
                  </div>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

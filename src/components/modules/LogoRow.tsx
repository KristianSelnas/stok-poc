import type { ModuleOf } from "@/sanity/types";

import { Container } from "../ui/Container";
import { ContentImage } from "../ui/ContentImage";
import { SectionHeader } from "./SectionHeader";

/** Sertifikater med logo, navn og kort beskrivelse. Lenker til sertifikatet når det finnes. */
export function LogoRow({ module }: { module: ModuleOf<"logoRow"> }) {
  const certificates = (module.certificates ?? []).filter(Boolean);
  if (!certificates.length) return null;

  return (
    <section className="py-14 md:py-20">
      <Container>
        <SectionHeader eyebrow={module.eyebrow} title={module.title} intro={module.intro} />
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {certificates.map((certificate) => {
            const href = certificate.fileUrl ?? certificate.url;
            const content = (
              <>
                <div className="relative mb-4 h-16">
                  {certificate.logo?.url ? (
                    <ContentImage
                      image={certificate.logo}
                      fill
                      sizes="160px"
                      className="object-contain object-left"
                    />
                  ) : (
                    <span className="font-heading text-2xl font-bold text-stok-blue">
                      {certificate.title}
                    </span>
                  )}
                </div>
                <h3 className="text-lg">{certificate.title}</h3>
                {certificate.description && <p className="mt-1 text-sm">{certificate.description}</p>}
              </>
            );
            return (
              <li key={certificate._id} className="rounded-3xl bg-white p-6 ring-1 ring-stok-blue/10">
                {href ? (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="block hover:opacity-80">
                    {content}
                  </a>
                ) : (
                  content
                )}
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}

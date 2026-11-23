import { getDictionary } from "@/lib/dictionaries";
import { telHref } from "@/lib/format";
import type { MarketId } from "@/lib/markets";
import type { ModuleOf } from "@/sanity/types";

import { Container } from "../ui/Container";
import { FeatureIcon } from "../ui/FeatureIcon";
import { SectionHeader } from "./SectionHeader";

/** Liste over kontorer og lagre med adresse og kontaktinfo. */
export function Locations({ module, market }: { module: ModuleOf<"locations">; market: MarketId }) {
  const items = (module.items ?? []).filter(Boolean);
  if (!items.length) return null;
  const t = getDictionary(market);

  return (
    <section className="bg-stok-light py-14 md:py-20">
      <Container>
        <SectionHeader eyebrow={module.eyebrow} title={module.title} />
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((location) => (
            <li key={location._id} className="rounded-3xl bg-white p-6">
              <div className="flex items-start gap-3">
                <FeatureIcon name="warehouse" className="mt-1 h-6 w-6 shrink-0 text-stok-green-dark" />
                <div>
                  <h3 className="text-lg">{location.title}</h3>
                  <address className="mt-2 not-italic">
                    {location.street && <p>{location.street}</p>}
                    {(location.postalCode || location.city) && (
                      <p>{[location.postalCode, location.city].filter(Boolean).join(" ")}</p>
                    )}
                    {location.phone && (
                      <p className="mt-2">
                        <span className="sr-only">{t.phone}: </span>
                        <a href={telHref(location.phone)} className="text-stok-blue hover:underline">
                          {location.phone}
                        </a>
                      </p>
                    )}
                    {location.email && (
                      <p>
                        <span className="sr-only">{t.email}: </span>
                        <a href={`mailto:${location.email}`} className="text-stok-blue hover:underline">
                          {location.email}
                        </a>
                      </p>
                    )}
                  </address>
                  {location.openingHours && (
                    <p className="mt-2 text-sm whitespace-pre-line">{location.openingHours}</p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

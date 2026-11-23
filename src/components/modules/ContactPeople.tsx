import { getSiteSettings } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { telHref } from "@/lib/format";
import type { MarketId } from "@/lib/markets";
import type { ModuleOf, Person } from "@/sanity/types";

import { Container } from "../ui/Container";
import { PersonCard } from "../ui/PersonCard";
import { SectionHeader } from "./SectionHeader";

type ContactPeopleProps = { module: ModuleOf<"contactPeople">; market: MarketId };

/**
 * Kontaktpersoner gruppert etter avdeling, med kundeservice øverst.
 * Er det valgt ut personer, vises bare de, uten gruppering.
 */
export async function ContactPeople({ module, market }: ContactPeopleProps) {
  const t = getDictionary(market);
  const settings = module.showCustomerService ? await getSiteSettings(market) : null;
  const selected = (module.selectedPeople ?? []).filter(Boolean) as Person[];
  const people = module.people ?? [];

  const groups = selected.length
    ? [{ _id: "selected", title: null, people: selected }]
    : (module.departments ?? [])
        .map((department) => ({
          ...department,
          people: people.filter((person) => person.departmentId === department._id),
        }))
        .filter((group) => group.people.length);

  return (
    <section className="py-14 md:py-20">
      <Container>
        <SectionHeader eyebrow={module.eyebrow} title={module.title} intro={module.intro} />

        {settings && (settings.phone || settings.email) && (
          <div className="mb-12 flex flex-col gap-6 rounded-[2rem] bg-stok-blue p-8 text-white md:flex-row md:items-center md:justify-between md:p-10">
            <h2 className="text-2xl text-white md:text-3xl">{t.customerService}</h2>
            <div className="flex flex-wrap gap-x-10 gap-y-3 text-lg">
              {settings.phone && (
                <a href={telHref(settings.phone)} className="hover:text-stok-green">
                  <span className="block font-meta text-xs tracking-wide text-stok-green uppercase">
                    {t.phone}
                  </span>
                  {settings.phone}
                </a>
              )}
              {settings.email && (
                <a href={`mailto:${settings.email}`} className="hover:text-stok-green">
                  <span className="block font-meta text-xs tracking-wide text-stok-green uppercase">
                    {t.email}
                  </span>
                  {settings.email}
                </a>
              )}
            </div>
          </div>
        )}

        <div className="space-y-12">
          {groups.map((group) => (
            <div key={group._id}>
              {group.title && <h2 className="mb-5 text-2xl">{group.title}</h2>}
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.people.map((person) => (
                  <li key={person._id}>
                    <PersonCard person={person} t={t} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

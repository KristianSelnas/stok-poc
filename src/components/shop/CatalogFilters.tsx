"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { t } from "@/shop/dictionary";
import type { Taxon } from "@/shop/domain";
import { catalogPath, type CatalogParams, shopPath } from "@/shop/paths";

/** Egen pil i stedet for nettleserens, så den får plass innenfor den runde kanten. */
const fieldClass =
  "appearance-none rounded-full border-2 border-stok-blue/20 bg-white py-2.5 pr-11 pl-4 focus:border-stok-blue focus:outline-none";

type FilterKey = "type" | "gruppe" | "materiale";

type Props = {
  params: CatalogParams;
  types: Taxon[];
  groups: Taxon[];
  materials: Taxon[];
};

/**
 * Nedtrekkslister for type, produktgruppe og materiale. Listen oppdateres
 * når et valg endres, uten å hoppe til toppen av siden. Uten JavaScript
 * sender skjemaet valgene som vanlige URL-parametere med knappen «Vis».
 */
export function CatalogFilters({ params, types, groups, materials }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const hasFilters = !!(params.q || params.type || params.gruppe || params.materiale);

  function change(key: FilterKey, value: string) {
    const next = { ...params, [key]: value || undefined };
    const search = new URLSearchParams();
    for (const name of ["q", "type", "gruppe", "materiale"] as const) {
      const v = next[name];
      if (v) search.set(name, v);
    }
    const query = search.toString();
    startTransition(() => router.replace(`${shopPath()}${query ? `?${query}` : ""}`, { scroll: false }));
  }

  const filters: { key: FilterKey; label: string; all: string; options: Taxon[] }[] = [
    { key: "type", label: t.filterType, all: t.allTypes, options: types },
    { key: "gruppe", label: t.filterGroup, all: t.allGroups, options: groups },
    { key: "materiale", label: t.filterMaterial, all: t.allMaterials, options: materials },
  ];

  return (
    <form
      // Leser valgene fra adressen på nytt når listen er oppdatert eller nullstilt.
      key={JSON.stringify(params)}
      action={`${shopPath()}#produkter`}
      aria-busy={pending}
      className="flex flex-wrap items-end gap-x-2 gap-y-4"
    >
      {params.q && <input type="hidden" name="q" value={params.q} />}
      {filters.map((filter) => (
        <div key={filter.key}>
          <label
            htmlFor={`filter-${filter.key}`}
            className="mb-1 block font-meta text-sm font-medium text-stok-blue"
          >
            {filter.label}
          </label>
          <div className="relative">
            <select
              id={`filter-${filter.key}`}
              name={filter.key}
              defaultValue={params[filter.key] ?? ""}
              onChange={(event) => change(filter.key, event.target.value)}
              className={fieldClass}
            >
              <option value="">{filter.all}</option>
              {filter.options.map((option) => (
                <option key={option.slug} value={option.slug}>
                  {option.title}
                </option>
              ))}
            </select>
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-stok-blue"
            >
              <path d="m5 7.5 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      ))}
      <noscript>
        <button
          type="submit"
          className="rounded-full border-2 border-stok-blue px-5 py-2 font-semibold text-stok-blue"
        >
          {t.showResults}
        </button>
      </noscript>
      {hasFilters && (
        <Link
          href={catalogPath()}
          scroll={false}
          className="ml-2 pb-3 font-semibold text-stok-blue underline underline-offset-4"
        >
          {t.resetFilters}
        </Link>
      )}
    </form>
  );
}

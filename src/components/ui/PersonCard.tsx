import type { Dictionary } from "@/lib/dictionaries";
import { initials, telHref } from "@/lib/format";
import type { Person } from "@/sanity/types";

import { ContentImage } from "./ContentImage";

/** Kontaktperson med bilde (eller initialer), stilling, telefon og e-post. */
export function PersonCard({ person, t }: { person: Person; t: Dictionary }) {
  return (
    <article className="flex gap-4 rounded-3xl bg-white p-5 ring-1 ring-stok-blue/10">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-stok-light">
        {person.image?.url ? (
          <ContentImage image={person.image} fill sizes="64px" className="object-cover" />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center font-heading text-lg font-bold text-stok-blue"
          >
            {initials(person.name)}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <h3 className="text-lg">{person.name}</h3>
        {person.role && <p className="text-sm">{person.role}</p>}
        <ul className="mt-2 space-y-1 text-sm">
          {person.phone && (
            <li>
              <span className="sr-only">{t.phone}: </span>
              <a href={telHref(person.phone)} className="text-stok-blue hover:underline">
                {person.phone}
              </a>
            </li>
          )}
          {person.email && (
            <li className="truncate">
              <span className="sr-only">{t.email}: </span>
              <a href={`mailto:${person.email}`} className="text-stok-blue hover:underline">
                {person.email}
              </a>
            </li>
          )}
        </ul>
      </div>
    </article>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { useIsPresentationTool } from "next-sanity/hooks";

/**
 * Viser at siden er i forhåndsvisning, med en knapp for å avslutte. Skjules i
 * Presentation-verktøyet, der Studio har egne kontroller.
 */
export function DraftModeBanner() {
  const isPresentationTool = useIsPresentationTool();
  const pathname = usePathname();
  // `null` til vi vet om siden er i Presentation-verktøyet.
  if (isPresentationTool !== false) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-0 z-50 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 bg-stok-blue px-4 py-3 text-sm text-white shadow-lg"
    >
      <span>Du ser på en forhåndsvisning med upubliserte endringer.</span>
      <form action="/api/draft-mode/disable" method="post">
        <input type="hidden" name="redirectTo" value={pathname} />
        <button
          type="submit"
          className="rounded-full bg-white px-4 py-1.5 font-semibold text-stok-blue hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Avslutt forhåndsvisning
        </button>
      </form>
    </div>
  );
}

import { draftMode } from "next/headers";

import { SanityLive } from "@/sanity/lib/live";

import { DraftModeBanner } from "./DraftModeBanner";
import { PreviewEditing } from "./PreviewEditing";

/**
 * Sanity Live for alle besøkende, og i Draft Mode også klikk-for-å-redigere
 * (Visual Editing) og et banner om forhåndsvisningen.
 *
 * `use cache` gjør at komponenten kan lese `draftMode()` uten å gjøre layouten
 * dynamisk. I Draft Mode kjøres den på nytt ved hvert besøk.
 */
export async function LivePreview() {
  "use cache";
  const { isEnabled } = await draftMode();

  return (
    <>
      <SanityLive includeDrafts={isEnabled} />
      {isEnabled && (
        <>
          <PreviewEditing />
          <DraftModeBanner />
        </>
      )}
    </>
  );
}

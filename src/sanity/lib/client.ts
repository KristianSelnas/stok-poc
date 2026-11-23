import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId, studioBasePath } from "../env";

/**
 * Felt som styrer logikk eller lenker, og som derfor ikke kan ha usynlige
 * stega-tegn i forhåndsvisningen. Sanity hopper selv over bl.a. `slug`,
 * `href`, `url`, `icon`, `language`, datoer og alt under `seo`.
 */
const stegaSkip = new Set(["imagePosition", "tone", "source", "linkType", "platform", "phone", "email"]);

/**
 * Klienten brukes via `defineLive` i `live.ts`. Publisert innhold hentes fra
 * Sanitys API-CDN og caches med `use cache`. Sanity Live og webhooken i
 * `app/api/revalidate` tømmer cachen når noe publiseres.
 *
 * `stega` gjelder bare i Draft Mode. Da legges det usynlige tegn i tekstene,
 * så Presentation-verktøyet vet hvilket felt en tekst kommer fra.
 */
export const client = createClient({
  projectId: projectId || "not-configured",
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
  stega: {
    studioUrl: studioBasePath,
    filter: (props) => {
      const last = props.sourcePath.at(-1);
      if (typeof last === "string" && stegaSkip.has(last)) return false;
      return props.filterDefault(props);
    },
  },
});

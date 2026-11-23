import { stegaClean } from "next-sanity";

/**
 * Strukturerte data (JSON-LD) for søkemotorer. Stega-tegn fra
 * forhåndsvisningen fjernes, og `<` kodes så tekst fra Sanity ikke kan lukke
 * script-taggen.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const json = JSON.stringify(stegaClean(data)).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

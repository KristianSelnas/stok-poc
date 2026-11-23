import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

/**
 * Uten Sanitys API-CDN. Nettsiden cacher selv med `use cache` og tømmer cachen
 * når webhooken kommer. Henter vi da fra CDN-et, kan vi få det gamle innholdet
 * og cache det på nytt i opptil én time. Mot API-et direkte får vi alltid siste
 * publiserte versjon, og vi spør bare når cachen er tom.
 */
export const client = createClient({
  projectId: projectId || "not-configured",
  dataset,
  apiVersion,
  useCdn: false,
  perspective: "published",
});

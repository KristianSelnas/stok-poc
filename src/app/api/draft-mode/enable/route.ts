import { defineEnableDraftMode } from "next-sanity/draft-mode";

import { client } from "@/sanity/lib/client";
import { readToken } from "@/sanity/lib/token";

/**
 * Slår på Draft Mode. Presentation-verktøyet i Studio kaller ruten med en
 * hemmelighet som Sanity lager og sjekker, og sender så redaktøren videre til
 * siden. Krever `SANITY_API_READ_TOKEN` (se docs/11-forhandsvisning.md).
 */
const enable = readToken ? defineEnableDraftMode({ client: client.withConfig({ token: readToken }) }) : null;

export async function GET(request: Request) {
  if (!enable) {
    return new Response("SANITY_API_READ_TOKEN mangler. Se docs/11-forhandsvisning.md.", { status: 500 });
  }
  return enable.GET(request);
}

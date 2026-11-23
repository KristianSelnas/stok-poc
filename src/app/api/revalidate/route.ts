import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

import { SANITY_TAG } from "@/sanity/lib/tags";

type WebhookPayload = { _id: string; _type: string };

/**
 * Mottar webhook fra Sanity når et dokument publiseres, endres eller slettes,
 * og revaliderer innholdet på nettsiden.
 *
 * Vi revaliderer alt Sanity-innhold, ikke bare dokumentet som endret seg.
 * Dokumentene peker på hverandre (menyer og lenker viser sidenes adresser),
 * så en målrettet revalidering ville lett gått glipp av sider som påvirkes.
 * For en nettside av denne størrelsen koster det lite.
 *
 * Oppsett i Sanity: se docs/10-webhook.md.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ message: "SANITY_REVALIDATE_SECRET mangler" }, { status: 500 });
  }

  // Tredje argument venter litt, så Content Lake har fått med seg endringen før vi henter på nytt.
  const { isValidSignature, body } = await parseBody<WebhookPayload>(request, secret, true);
  if (!isValidSignature) {
    return NextResponse.json({ message: "Ugyldig signatur" }, { status: 401 });
  }
  if (!body?._type) {
    return NextResponse.json({ message: "Mangler _type i webhook-innholdet" }, { status: 400 });
  }

  // expire: 0 gjør at neste besøk henter nytt innhold med en gang, i stedet
  // for å vise gammelt innhold mens det hentes i bakgrunnen.
  revalidateTag(SANITY_TAG, { expire: 0 });

  return NextResponse.json({ revalidated: true, tag: SANITY_TAG, document: body._id, type: body._type });
}

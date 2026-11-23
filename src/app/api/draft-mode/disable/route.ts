import { draftMode } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Slår av Draft Mode og sender redaktøren tilbake til siden. Kalles fra
 * skjemaet i forhåndsvisningsbanneret (`DraftModeBanner`).
 */
export async function POST(request: NextRequest) {
  (await draftMode()).disable();
  const form = await request.formData();
  const redirectTo = String(form.get("redirectTo") ?? "/");
  // Bare stier på eget domene, ikke fulle adresser.
  const path = redirectTo.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : "/";
  return NextResponse.redirect(new URL(path, request.url), 303);
}

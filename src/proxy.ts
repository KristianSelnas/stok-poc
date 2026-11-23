import { NextResponse, type NextRequest } from "next/server";

const marketIds = ["no", "is"];
const defaultMarket = "no";

/**
 * Sender besøkende uten markedsprefiks til riktig marked.
 * Islandsk nettleserspråk gir /is, alt annet gir /no.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasMarket = marketIds.some((id) => pathname === `/${id}` || pathname.startsWith(`/${id}/`));
  if (hasMarket) return;

  const acceptLanguage = request.headers.get("accept-language") ?? "";
  const prefersIcelandic = /^\s*is\b/i.test(acceptLanguage);
  const market = prefersIcelandic ? "is" : defaultMarket;

  const url = request.nextUrl.clone();
  url.pathname = `/${market}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Hopper over Studio, API, Next-interne filer og statiske filer med filendelse.
  matcher: ["/((?!studio|api|_next|.*\\..*).*)"],
};

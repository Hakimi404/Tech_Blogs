import { NextResponse, type NextRequest } from "next/server";
import { LANG_COOKIE, pickLang } from "@/lib/i18n";

// "/" sends readers to their edition: the language they picked before, otherwise their browser's language.
export function proxy(request: NextRequest) {
  const lang = pickLang(request.cookies.get(LANG_COOKIE)?.value, request.headers.get("accept-language"));
  return NextResponse.redirect(new URL(`/${lang}`, request.url));
}

export const config = {
  matcher: "/",
};

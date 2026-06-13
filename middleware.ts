import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  LOCALE_COOKIE,
  defaultLocale,
  isLocale,
  locales,
  type Locale,
} from "@/lib/i18n/config";

function detectFromAcceptLanguage(header: string): Locale {
  const parts = header
    .split(",")
    .map((part) => part.trim().split("-")[0]?.toLowerCase())
    .filter(Boolean);

  for (const part of parts) {
    if (isLocale(part)) return part;
  }

  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;

  if (cookie && isLocale(cookie)) {
    return NextResponse.next();
  }

  const detected = detectFromAcceptLanguage(
    request.headers.get("accept-language") ?? "",
  );

  const response = NextResponse.next();
  response.cookies.set(LOCALE_COOKIE, detected, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

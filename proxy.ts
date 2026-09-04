import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { CUSTOMER_SESSION_COOKIE, isValidCustomerSession } from "@/lib/customer-auth";

const handleI18nRouting = createMiddleware(routing);
const localePattern = new RegExp(`^/(${routing.locales.join("|")})(?=/|$)`);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();

    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (await isValidAdminSession(token)) return NextResponse.next();

    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const localeMatch = pathname.match(localePattern);
  const locale = localeMatch?.[1] ?? routing.defaultLocale;
  const localizedPathname = localeMatch ? pathname.slice(localeMatch[0].length) || "/" : pathname;

  if (localizedPathname.startsWith("/account")) {
    if (["/account/login", "/account/register", "/account/verify", "/account/forgot-password", "/account/reset-password"].includes(localizedPathname)) return handleI18nRouting(request);

    const token = request.cookies.get(CUSTOMER_SESSION_COOKIE)?.value;
    if (await isValidCustomerSession(token)) return handleI18nRouting(request);

    const loginUrl = new URL(`/${locale}/account/login`, request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: ["/((?!api|admin|icon|robots\\.txt|sitemap\\.xml|_next|_vercel|.*\\..*).*)", "/admin/:path*"]
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { CUSTOMER_SESSION_COOKIE, isValidCustomerSession } from "@/lib/customer-auth";

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

  if (pathname.startsWith("/account")) {
    if (pathname === "/account/login" || pathname === "/account/register" || pathname === "/account/verify" || pathname === "/account/forgot-password" || pathname === "/account/reset-password") return NextResponse.next();

    const token = request.cookies.get(CUSTOMER_SESSION_COOKIE)?.value;
    if (await isValidCustomerSession(token)) return NextResponse.next();

    const loginUrl = new URL("/account/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/account/:path*"] };

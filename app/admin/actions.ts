"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, adminSessionMaxAge, createAdminSessionToken } from "@/lib/admin-auth";
import { clearLoginAttempts, createLoginAttemptKey, getClientIp, isLoginBlocked, recordFailedLogin } from "@/lib/login-rate-limit";

export async function loginAdmin(formData: FormData) {
  const password = formData.get("password");
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  const requestHeaders = await headers();
  const attemptKey = createLoginAttemptKey("admin", getClientIp(requestHeaders), "admin");

  if (isLoginBlocked(attemptKey)) redirect("/admin/login?error=blocked");

  if (typeof password !== "string" || !passwordHash || !(await bcrypt.compare(password, passwordHash))) {
    const blocked = recordFailedLogin(attemptKey);
    redirect(`/admin/login?error=${blocked ? "blocked" : "invalid"}`);
  }

  clearLoginAttempts(attemptKey);

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, await createAdminSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: adminSessionMaxAge,
    path: "/",
  });
  redirect("/admin");
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  redirect("/admin/login");
}

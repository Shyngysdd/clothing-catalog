"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, adminSessionMaxAge, createAdminSessionToken } from "@/lib/admin-auth";

export async function loginAdmin(formData: FormData) {
  const password = formData.get("password");
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  if (typeof password !== "string" || !passwordHash || !(await bcrypt.compare(password, passwordHash))) {
    redirect("/admin/login?error=1");
  }

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

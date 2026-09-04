"use server";

import bcrypt from "bcryptjs";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { CUSTOMER_SESSION_COOKIE, getCustomerIdFromSession } from "@/lib/customer-auth";
import { clearLoginAttempts, createLoginAttemptKey, getClientIp, isLoginBlocked, recordFailedLogin } from "@/lib/login-rate-limit";
import { prisma } from "@/lib/prisma";

async function requireCustomerId() {
  const cookieStore = await cookies();
  const customerId = await getCustomerIdFromSession(cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value);
  if (!customerId) redirect("/account/login");
  return customerId;
}

export async function updateProfile(formData: FormData) {
  const customerId = await requireCustomerId();
  const name = formData.get("name");
  const phone = formData.get("phone");
  const normalizedName = typeof name === "string" ? name.trim() : "";
  const normalizedPhone = typeof phone === "string" ? phone.trim() : "";
  if (!normalizedName) redirect("/account/edit?profile=invalid");

  await prisma.customer.update({ where: { id: customerId }, data: { name: normalizedName, phone: normalizedPhone || null } });
  redirect("/account/edit?profile=success");
}

export async function changePassword(formData: FormData) {
  const customerId = await requireCustomerId();
  const currentPassword = formData.get("currentPassword");
  const newPassword = formData.get("newPassword");
  const passwordConfirmation = formData.get("passwordConfirmation");
  const requestHeaders = await headers();
  const attemptKey = createLoginAttemptKey("customer", getClientIp(requestHeaders), `password-change:${customerId}`);

  if (await isLoginBlocked(attemptKey)) redirect("/account/edit?password=blocked");
  if (typeof currentPassword !== "string" || typeof newPassword !== "string" || typeof passwordConfirmation !== "string") redirect("/account/edit?password=invalid");
  if (newPassword.length < 8) redirect("/account/edit?password=short");
  if (newPassword !== passwordConfirmation) redirect("/account/edit?password=mismatch");

  const customer = await prisma.customer.findUnique({ where: { id: customerId }, select: { passwordHash: true } });
  if (!customer) redirect("/account/login");
  if (!(await bcrypt.compare(currentPassword, customer.passwordHash))) {
    const blocked = await recordFailedLogin(attemptKey);
    redirect(`/account/edit?password=${blocked ? "blocked" : "current"}`);
  }

  await clearLoginAttempts(attemptKey);
  await prisma.customer.update({ where: { id: customerId }, data: { passwordHash: await bcrypt.hash(newPassword, 12) } });
  redirect("/account/edit?password=success");
}

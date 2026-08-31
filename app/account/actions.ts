"use server";

import bcrypt from "bcryptjs";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { customerSessionMaxAge, CUSTOMER_SESSION_COOKIE, createCustomerSessionToken, getCustomerIdFromSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";
import { createVerificationData, sendVerificationEmail } from "@/lib/email-verification";
import { clearLoginAttempts, createLoginAttemptKey, getClientIp, isLoginBlocked, recordFailedLogin } from "@/lib/login-rate-limit";
import { createPasswordResetData, sendPasswordResetEmail } from "@/lib/password-reset";

async function setCustomerSession(customerId: string) {
  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_SESSION_COOKIE, await createCustomerSessionToken(customerId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: customerSessionMaxAge,
    path: "/",
  });
}

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

  if (!normalizedName) redirect("/account?profile=invalid");

  await prisma.customer.update({
    where: { id: customerId },
    data: { name: normalizedName, phone: normalizedPhone || null },
  });
  redirect("/account?profile=success");
}

export async function changePassword(formData: FormData) {
  const customerId = await requireCustomerId();
  const currentPassword = formData.get("currentPassword");
  const newPassword = formData.get("newPassword");
  const passwordConfirmation = formData.get("passwordConfirmation");

  if (typeof currentPassword !== "string" || typeof newPassword !== "string" || typeof passwordConfirmation !== "string") {
    redirect("/account?password=invalid");
  }
  if (newPassword.length < 8) redirect("/account?password=short");
  if (newPassword !== passwordConfirmation) redirect("/account?password=mismatch");

  const customer = await prisma.customer.findUnique({ where: { id: customerId }, select: { passwordHash: true } });
  if (!customer) redirect("/account/login");
  if (!(await bcrypt.compare(currentPassword, customer.passwordHash))) redirect("/account?password=current");

  await prisma.customer.update({ where: { id: customerId }, data: { passwordHash: await bcrypt.hash(newPassword, 12) } });
  redirect("/account?password=success");
}

export async function registerCustomer(formData: FormData) {
  const name = formData.get("name");
  const email = formData.get("email");
  const phone = formData.get("phone");
  const password = formData.get("password");
  const agreesToTerms = formData.get("agreeToTerms") === "on";
  const wantsNewsletter = formData.get("newsletter") === "on";

  if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
    redirect("/account/register?error=invalid");
  }

  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPhone = typeof phone === "string" ? phone.trim() : "";
  if (!normalizedName || !normalizedEmail || password.length < 8) {
    redirect("/account/register?error=invalid");
  }
  if (!agreesToTerms) redirect("/account/register?error=terms");

  const existingCustomer = await prisma.customer.findUnique({ where: { email: normalizedEmail }, select: { id: true } });
  if (existingCustomer) redirect("/account/register?error=exists");

  const customer = await prisma.customer.create({
    data: {
      name: normalizedName,
      email: normalizedEmail,
      phone: normalizedPhone || null,
      passwordHash: await bcrypt.hash(password, 12),
      ...createVerificationData(),
    },
  });

  try {
    if (customer.verificationToken) await sendVerificationEmail(customer.email, customer.verificationToken);
  } catch {
    // Email delivery must not prevent the customer from using the catalogue.
  }
  if (wantsNewsletter) {
    await prisma.subscriber.upsert({ where: { email: normalizedEmail }, update: {}, create: { email: normalizedEmail } });
  }
  await setCustomerSession(customer.id);
  redirect("/account");
}

export async function loginCustomer(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "unknown";
  const requestHeaders = await headers();
  const attemptKey = createLoginAttemptKey("customer", getClientIp(requestHeaders), normalizedEmail);
  if (isLoginBlocked(attemptKey)) redirect("/account/login?error=blocked");
  if (typeof email !== "string" || typeof password !== "string") {
    const blocked = recordFailedLogin(attemptKey);
    redirect(`/account/login?error=${blocked ? "blocked" : "invalid"}`);
  }

  const customer = await prisma.customer.findUnique({ where: { email: normalizedEmail } });
  if (!customer || !(await bcrypt.compare(password, customer.passwordHash))) {
    const blocked = recordFailedLogin(attemptKey);
    redirect(`/account/login?error=${blocked ? "blocked" : "invalid"}`);
  }

  clearLoginAttempts(attemptKey);
  await setCustomerSession(customer.id);
  redirect("/account");
}

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get("email");
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!normalizedEmail) redirect("/account/forgot-password?sent=1");

  const customer = await prisma.customer.findUnique({ where: { email: normalizedEmail }, select: { id: true, email: true, passwordResetEmailSentAt: true } });
  if (customer && (!customer.passwordResetEmailSentAt || Date.now() - customer.passwordResetEmailSentAt.getTime() >= 2 * 60 * 1000)) {
    const reset = createPasswordResetData();
    await prisma.customer.update({ where: { id: customer.id }, data: reset });
    try {
      await sendPasswordResetEmail(customer.email, reset.passwordResetToken);
    } catch {
      // Always show the same confirmation to avoid revealing account existence.
    }
  }
  redirect("/account/forgot-password?sent=1");
}

export async function resetCustomerPassword(formData: FormData) {
  const token = formData.get("token");
  const password = formData.get("password");
  const passwordConfirmation = formData.get("passwordConfirmation");
  if (typeof token !== "string" || typeof password !== "string" || typeof passwordConfirmation !== "string" || password.length < 8 || password !== passwordConfirmation) {
    redirect(`/account/reset-password?token=${encodeURIComponent(typeof token === "string" ? token : "")}&error=invalid`);
  }

  const customer = await prisma.customer.findFirst({ where: { passwordResetToken: token, passwordResetTokenExpiry: { gt: new Date() } }, select: { id: true } });
  if (!customer) redirect("/account/reset-password?error=expired");

  await prisma.customer.update({
    where: { id: customer.id },
    data: { passwordHash: await bcrypt.hash(password, 12), passwordResetToken: null, passwordResetTokenExpiry: null, passwordResetEmailSentAt: null },
  });
  redirect("/account/login?reset=1");
}

export async function logoutCustomer() {
  const cookieStore = await cookies();
  cookieStore.delete(CUSTOMER_SESSION_COOKIE);
  redirect("/");
}

export async function resendVerificationEmail() {
  const customerId = await requireCustomerId();

  const customer = await prisma.customer.findUnique({ where: { id: customerId }, select: { email: true, emailVerified: true, verificationEmailSentAt: true } });
  if (!customer || customer.emailVerified) redirect("/account");
  if (customer.verificationEmailSentAt && Date.now() - customer.verificationEmailSentAt.getTime() < 2 * 60 * 1000) {
    redirect("/account?verification=wait");
  }

  const verification = createVerificationData();
  await prisma.customer.update({ where: { id: customerId }, data: verification });
  try {
    await sendVerificationEmail(customer.email, verification.verificationToken);
    redirect("/account?verification=sent");
  } catch {
    redirect("/account?verification=error");
  }
}

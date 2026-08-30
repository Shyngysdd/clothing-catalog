"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { customerSessionMaxAge, CUSTOMER_SESSION_COOKIE, createCustomerSessionToken } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";
import { createVerificationData, sendVerificationEmail } from "@/lib/email-verification";

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

export async function registerCustomer(formData: FormData) {
  const name = formData.get("name");
  const email = formData.get("email");
  const phone = formData.get("phone");
  const password = formData.get("password");
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
  if (typeof email !== "string" || typeof password !== "string") redirect("/account/login?error=1");

  const customer = await prisma.customer.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!customer || !(await bcrypt.compare(password, customer.passwordHash))) redirect("/account/login?error=1");

  await setCustomerSession(customer.id);
  redirect("/account");
}

export async function logoutCustomer() {
  const cookieStore = await cookies();
  cookieStore.delete(CUSTOMER_SESSION_COOKIE);
  redirect("/");
}

export async function resendVerificationEmail() {
  const cookieStore = await cookies();
  const customerId = await (await import("@/lib/customer-auth")).getCustomerIdFromSession(cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value);
  if (!customerId) redirect("/account/login");

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

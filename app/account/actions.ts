"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { customerSessionMaxAge, CUSTOMER_SESSION_COOKIE, createCustomerSessionToken } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";

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
    },
  });

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

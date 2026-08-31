"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CUSTOMER_SESSION_COOKIE, getCustomerIdFromSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";

async function requireCustomerId() {
  const cookieStore = await cookies();
  const customerId = await getCustomerIdFromSession(cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value);
  if (!customerId) redirect("/account/login");
  return customerId;
}

function readAddress(formData: FormData) {
  const label = formData.get("label");
  const city = formData.get("city");
  const addressLine = formData.get("addressLine");
  const apartment = formData.get("apartment");
  const comment = formData.get("comment");
  const normalizedCity = typeof city === "string" ? city.trim() : "";
  const normalizedAddressLine = typeof addressLine === "string" ? addressLine.trim() : "";
  if (!normalizedCity || !normalizedAddressLine) return null;

  return {
    label: typeof label === "string" && label.trim() ? label.trim() : null,
    city: normalizedCity,
    addressLine: normalizedAddressLine,
    apartment: typeof apartment === "string" && apartment.trim() ? apartment.trim() : null,
    comment: typeof comment === "string" && comment.trim() ? comment.trim() : null,
  };
}

function refreshAddresses() {
  revalidatePath("/account/addresses");
  revalidatePath("/", "layout");
}

export async function createAddress(formData: FormData) {
  const customerId = await requireCustomerId();
  const address = readAddress(formData);
  if (!address) redirect("/account/addresses?mode=new&error=invalid");
  const makeDefault = formData.get("isDefault") === "on";

  await prisma.$transaction(async (transaction) => {
    const addressCount = await transaction.customerAddress.count({ where: { customerId } });
    const isDefault = makeDefault || addressCount === 0;
    if (isDefault) await transaction.customerAddress.updateMany({ where: { customerId }, data: { isDefault: false } });
    await transaction.customerAddress.create({ data: { ...address, customerId, isDefault } });
  });
  refreshAddresses();
  redirect("/account/addresses?status=created");
}

export async function updateAddress(formData: FormData) {
  const customerId = await requireCustomerId();
  const id = formData.get("id");
  const address = readAddress(formData);
  if (typeof id !== "string" || !address) redirect("/account/addresses?error=invalid");
  const existing = await prisma.customerAddress.findFirst({ where: { id, customerId }, select: { id: true } });
  if (!existing) redirect("/account/addresses?error=not-found");
  const makeDefault = formData.get("isDefault") === "on";

  await prisma.$transaction(async (transaction) => {
    if (makeDefault) await transaction.customerAddress.updateMany({ where: { customerId }, data: { isDefault: false } });
    await transaction.customerAddress.update({ where: { id: existing.id }, data: { ...address, ...(makeDefault ? { isDefault: true } : {}) } });
  });
  refreshAddresses();
  redirect("/account/addresses?status=updated");
}

export async function deleteAddress(formData: FormData) {
  const customerId = await requireCustomerId();
  const id = formData.get("id");
  if (typeof id !== "string") redirect("/account/addresses?error=not-found");
  const address = await prisma.customerAddress.findFirst({ where: { id, customerId }, select: { id: true, isDefault: true } });
  if (!address) redirect("/account/addresses?error=not-found");

  await prisma.$transaction(async (transaction) => {
    await transaction.customerAddress.delete({ where: { id: address.id } });
    if (address.isDefault) {
      const nextAddress = await transaction.customerAddress.findFirst({ where: { customerId }, orderBy: { createdAt: "asc" }, select: { id: true } });
      if (nextAddress) await transaction.customerAddress.update({ where: { id: nextAddress.id }, data: { isDefault: true } });
    }
  });
  refreshAddresses();
  redirect("/account/addresses?status=deleted");
}

export async function setDefaultAddress(formData: FormData) {
  const customerId = await requireCustomerId();
  const id = formData.get("id");
  if (typeof id !== "string") redirect("/account/addresses?error=not-found");
  const address = await prisma.customerAddress.findFirst({ where: { id, customerId }, select: { id: true } });
  if (!address) redirect("/account/addresses?error=not-found");

  await prisma.$transaction(async (transaction) => {
    await transaction.customerAddress.updateMany({ where: { customerId }, data: { isDefault: false } });
    await transaction.customerAddress.update({ where: { id: address.id }, data: { isDefault: true } });
  });
  refreshAddresses();
  redirect("/account/addresses?status=default");
}

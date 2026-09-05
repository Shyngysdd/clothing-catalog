"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const types = new Set(["category", "sale", "newest", "bestseller", "manual"]);

function getInput(formData: FormData, returnPath: string) {
  const titleRu = String(formData.get("titleRu") ?? "").trim();
  const titleEn = String(formData.get("titleEn") ?? "").trim() || null;
  const titleKz = String(formData.get("titleKz") ?? "").trim() || null;
  const type = String(formData.get("type") ?? "");
  const position = Number(formData.get("position"));
  const categoryValue = String(formData.get("categoryValue") ?? "").trim() || null;
  const selectedIds = formData.getAll("productIds").map(String);
  if (!titleRu || !types.has(type) || !Number.isInteger(position)) redirect(`${returnPath}?error=${encodeURIComponent("Проверьте русское название, тип и позицию раздела.")}`);
  if (type === "category" && !categoryValue) redirect(`${returnPath}?error=${encodeURIComponent("Укажите категорию.")}`);
  const productIds = type === "manual" ? selectedIds.sort((a, b) => Number(formData.get(`productPosition-${a}`) ?? 0) - Number(formData.get(`productPosition-${b}`) ?? 0)) : [];
  return { titleRu, titleEn, titleKz, type, position, categoryValue: type === "category" ? categoryValue : null, productIds, isActive: formData.get("isActive") === "on" };
}

export async function createHomeSection(formData: FormData) {
  const input = getInput(formData, "/admin/home-sections/new");
  const section = await prisma.homeSection.create({ data: input });
  revalidatePath("/"); revalidatePath("/admin/home-sections");
  redirect(`/admin/home-sections/${section.id}`);
}

export async function updateHomeSection(id: string, formData: FormData) {
  const input = getInput(formData, `/admin/home-sections/${id}`);
  await prisma.homeSection.update({ where: { id }, data: input });
  revalidatePath("/"); revalidatePath("/admin/home-sections"); revalidatePath(`/admin/home-sections/${id}`);
  redirect(`/admin/home-sections/${id}?saved=1`);
}

export async function toggleHomeSection(id: string, isActive: boolean) {
  await prisma.homeSection.update({ where: { id }, data: { isActive } });
  revalidatePath("/"); revalidatePath("/admin/home-sections");
}

export async function deleteHomeSection(id: string) {
  await prisma.homeSection.delete({ where: { id } });
  revalidatePath("/"); revalidatePath("/admin/home-sections");
  redirect("/admin/home-sections");
}

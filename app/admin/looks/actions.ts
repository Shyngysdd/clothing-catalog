"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteProductImage, isBlobUrl } from "@/lib/product-images";

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

function getInput(formData: FormData, returnPath: string) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const photoTones = formData.getAll("photoTones").map(String);
  const productIds = formData.getAll("productIds").map(String);
  const photoUrls = formData.getAll("lookPhotoUrl").map(String).filter(Boolean);

  if (!title) redirectWithError(returnPath, "Укажите название образа.");
  if (!productIds.length) redirectWithError(returnPath, "Выберите хотя бы один товар.");
  if (photoUrls.some((url) => !isBlobUrl(url))) redirectWithError(returnPath, "Некорректная ссылка на фото образа.");

  return { title, description, photoTones, productIds, photoUrls };
}

export async function createLook(formData: FormData) {
  const input = getInput(formData, "/admin/looks/new");
  const look = await prisma.look.create({
    data: {
      title: input.title,
      description: input.description,
      photoTones: input.photoTones,
      photoUrls: input.photoUrls,
      items: { create: input.productIds.map((productId) => ({ productId })) },
    },
  });
  revalidatePath("/admin/looks");
  redirect(`/admin/looks/${look.id}`);
}

export async function updateLook(id: string, formData: FormData) {
  const input = getInput(formData, `/admin/looks/${id}`);
  const currentLook = await prisma.look.findUniqueOrThrow({ where: { id }, select: { photoUrls: true } });
  const removedPhotoUrls = new Set(formData.getAll("removeLookPhoto").map(String));
  const nextPhotoUrls = [...currentLook.photoUrls.filter((url) => !removedPhotoUrls.has(url)), ...input.photoUrls];
  await prisma.$transaction(async (tx) => {
    await tx.look.update({ where: { id }, data: { title: input.title, description: input.description, photoTones: input.photoTones, photoUrls: nextPhotoUrls } });
    await tx.lookItem.deleteMany({ where: { lookId: id } });
    await tx.lookItem.createMany({ data: input.productIds.map((productId) => ({ lookId: id, productId })) });
  });
  await Promise.all([...removedPhotoUrls].map(deleteProductImage));
  revalidatePath("/admin/looks");
  revalidatePath(`/admin/looks/${id}`);
  redirect(`/admin/looks/${id}?saved=1`);
}

export async function deleteLook(id: string) {
  const look = await prisma.look.delete({ where: { id } });
  await Promise.all(look.photoUrls.map(deleteProductImage));
  revalidatePath("/admin/looks");
  redirect("/admin/looks");
}

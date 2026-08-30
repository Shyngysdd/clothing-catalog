"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteImage, saveImage } from "@/lib/product-images";
import { prisma } from "@/lib/prisma";

function getText(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function redirectWithError(message: string): never {
  redirect(`/admin/banners?error=${encodeURIComponent(message)}`);
}

export async function updateBanner(formData: FormData) {
  const slot = getText(formData, "slot");
  const title = getText(formData, "title");
  const subtitle = getText(formData, "subtitle") || null;
  const linkUrl = getText(formData, "linkUrl");
  const image = formData.get("image");
  const removeImage = formData.get("removeImage") === "on";
  if (!slot || !title || !linkUrl) redirectWithError("Заполните заголовок и ссылку баннера.");
  if (!linkUrl.startsWith("/") && !/^https?:\/\//.test(linkUrl)) redirectWithError("Ссылка должна начинаться с /, http:// или https://.");

  const currentBanner = await prisma.banner.findUnique({ where: { slot } });
  if (!currentBanner) redirectWithError("Слот баннера не найден.");

  let uploadedImage: string | null = null;
  try {
    uploadedImage = image instanceof File ? await saveImage(image, "banners") : null;
  } catch (error) {
    redirectWithError(error instanceof Error ? error.message : "Не удалось загрузить изображение.");
  }

  const imageUrl = uploadedImage ?? (removeImage ? null : currentBanner.imageUrl);
  await prisma.banner.update({ where: { slot }, data: { title, subtitle, linkUrl, imageUrl } });
  if ((uploadedImage || removeImage) && currentBanner.imageUrl) await deleteImage(currentBanner.imageUrl);
  revalidatePath("/");
  revalidatePath("/admin/banners");
  redirect("/admin/banners?saved=1");
}

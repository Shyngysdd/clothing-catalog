"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteImage } from "@/lib/product-images";
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
  const uploadedImageUrl = getText(formData, "imageUrl");
  const removeImage = formData.get("removeImage") === "on";
  if (!slot || !title || !linkUrl) redirectWithError("Заполните заголовок и ссылку баннера.");
  if (!linkUrl.startsWith("/") && !/^https?:\/\//.test(linkUrl)) redirectWithError("Ссылка должна начинаться с /, http:// или https://.");

  const currentBanner = await prisma.banner.findUnique({ where: { slot } });
  if (!currentBanner) redirectWithError("Слот баннера не найден.");

  if (uploadedImageUrl) {
    try {
      const url = new URL(uploadedImageUrl);
      if (url.protocol !== "https:" || !url.hostname.endsWith(".blob.vercel-storage.com")) throw new Error();
    } catch {
      redirectWithError("Некорректная ссылка на изображение.");
    }
  }

  const imageUrl = uploadedImageUrl || (removeImage ? null : currentBanner.imageUrl);
  await prisma.banner.update({ where: { slot }, data: { title, subtitle, linkUrl, imageUrl } });
  if ((uploadedImageUrl || removeImage) && currentBanner.imageUrl) await deleteImage(currentBanner.imageUrl);
  revalidatePath("/");
  revalidatePath("/admin/banners");
  redirect("/admin/banners?saved=1");
}

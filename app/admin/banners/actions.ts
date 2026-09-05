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
  const titleRu = getText(formData, "titleRu");
  const titleEn = getText(formData, "titleEn") || null;
  const titleKz = getText(formData, "titleKz") || null;
  const subtitleRu = getText(formData, "subtitleRu");
  const subtitleEn = getText(formData, "subtitleEn") || null;
  const subtitleKz = getText(formData, "subtitleKz") || null;
  const linkUrl = getText(formData, "linkUrl");
  const uploadedImageUrl = getText(formData, "imageUrl");
  const removeImage = formData.get("removeImage") === "on";
  if (!slot || !titleRu || !subtitleRu || !linkUrl) redirectWithError("Заполните русские заголовок, подзаголовок и ссылку баннера.");
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
  await prisma.banner.update({ where: { slot }, data: { titleRu, titleEn, titleKz, subtitleRu, subtitleEn, subtitleKz, linkUrl, imageUrl } });
  if ((uploadedImageUrl || removeImage) && currentBanner.imageUrl) await deleteImage(currentBanner.imageUrl);
  revalidatePath("/");
  revalidatePath("/admin/banners");
  redirect("/admin/banners?saved=1");
}

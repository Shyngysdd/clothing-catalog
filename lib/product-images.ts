import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { del, put } from "@vercel/blob";
import { normalizeImage, PRODUCT_IMAGE_SIZE } from "@/lib/image-processing";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const extensionByMimeType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function saveImage(file: File, directory = "products") {
  if (!file.size) return null;
  const extension = extensionByMimeType[file.type];
  if (!extension || file.size > MAX_IMAGE_SIZE) {
    throw new Error("Поддерживаются JPG, PNG, WebP и GIF размером до 5 МБ.");
  }

  const fileName = `${randomUUID()}.webp`;
  const normalizedImage = await normalizeImage(Buffer.from(await file.arrayBuffer()), PRODUCT_IMAGE_SIZE);
  if (process.env.VERCEL && !process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Vercel Blob не подключён к проекту. Добавьте BLOB_READ_WRITE_TOKEN в Environment Variables.");
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`${directory}/${fileName}`, normalizedImage, {
      access: "public",
      addRandomSuffix: false,
      contentType: "image/webp",
    });
    return blob.url;
  }

  const uploadDirectory = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(path.join(uploadDirectory, fileName), normalizedImage);
  return `/uploads/${fileName}`;
}

export function isBlobUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
}

export async function deleteImage(imageUrl: string) {
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    if (process.env.BLOB_READ_WRITE_TOKEN) await del(imageUrl);
    return;
  }
  if (!imageUrl.startsWith("/uploads/")) return;
  const fileName = path.basename(imageUrl);
  const filePath = path.join(process.cwd(), "public", "uploads", fileName);
  try {
    await unlink(filePath);
  } catch (error: unknown) {
    if (typeof error === "object" && error && "code" in error && error.code === "ENOENT") return;
    throw error;
  }
}

export const saveProductImage = saveImage;
export const deleteProductImage = deleteImage;

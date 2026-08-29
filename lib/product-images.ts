import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { del, put } from "@vercel/blob";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const extensionByMimeType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function saveProductImage(file: File) {
  if (!file.size) return null;
  const extension = extensionByMimeType[file.type];
  if (!extension || file.size > MAX_IMAGE_SIZE) {
    throw new Error("Поддерживаются JPG, PNG, WebP и GIF размером до 5 МБ.");
  }

  const fileName = `${randomUUID()}.${extension}`;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`products/${fileName}`, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type,
    });
    return blob.url;
  }

  const uploadDirectory = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(path.join(uploadDirectory, fileName), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${fileName}`;
}

export async function deleteProductImage(imageUrl: string) {
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

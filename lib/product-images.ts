import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

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

  const uploadDirectory = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDirectory, { recursive: true });
  const fileName = `${randomUUID()}.${extension}`;
  await writeFile(path.join(uploadDirectory, fileName), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${fileName}`;
}

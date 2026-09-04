"use server";

import { Prisma } from "@prisma/client";
import JSZip from "jszip";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteProductImage, isBlobUrl, saveProductImage } from "@/lib/product-images";
import { BRAND_CONFIG } from "@/lib/brand-config";
import { slugifyCategory } from "@/lib/category-slug";

type ProductInput = {
  name: string;
  brand: string;
  sku: string;
  categoryId: string;
  department: string;
  price: number;
  originalPrice: number | null;
  description: string | null;
  composition: string | null;
  fit: string | null;
  care: string[];
  imageColor: string;
  colorGroup: string | null;
  color: string | null;
  colorSwatch: string | null;
  galleryTones: string[];
  sizes: { size: string; inStock: boolean }[];
};

function getText(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

async function getUniqueCategorySlug(name: string) {
  const baseSlug = slugifyCategory(name);
  let slug = baseSlug;
  let suffix = 2;
  while (await prisma.category.findUnique({ where: { slug }, select: { id: true } })) slug = `${baseSlug}-${suffix++}`;
  return slug;
}

async function getOrCreateImportedCategory(name: string) {
  const existing = await prisma.category.findFirst({
    where: { nameRu: { equals: name, mode: "insensitive" } },
    select: { id: true },
  });
  if (existing) return existing;
  const slug = await getUniqueCategorySlug(name);
  return prisma.category.create({ data: { slug, nameRu: name, nameEn: name, nameKz: name }, select: { id: true } });
}

export async function createCategoryFromAdmin(input: { nameRu: string; nameEn: string; nameKz: string }) {
  const nameRu = input.nameRu.trim();
  const nameEn = input.nameEn.trim();
  const nameKz = input.nameKz.trim();
  if (!nameRu || !nameEn || !nameKz) return { error: "Заполните названия на всех трёх языках." } as const;

  try {
    const slug = await getUniqueCategorySlug(nameRu);
    const category = await prisma.category.create({ data: { slug, nameRu, nameEn, nameKz } });
    revalidatePath("/admin/products/new");
    return { category } as const;
  } catch {
    return { error: "Не удалось создать категорию." } as const;
  }
}

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

function parseProductInput(formData: FormData, returnPath: string): ProductInput {
  const name = getText(formData, "name");
  const brand = getText(formData, "brand") || BRAND_CONFIG.name;
  const sku = getText(formData, "sku");
  const categoryId = getText(formData, "categoryId");
  const department = getText(formData, "department") || "unisex";
  const priceRaw = getText(formData, "price");
  const originalPriceRaw = getText(formData, "originalPrice");
  const price = Number(priceRaw);
  const originalPrice = originalPriceRaw ? Number(originalPriceRaw) : null;

  if (!name || !sku || !categoryId) redirectWithError(returnPath, "Заполните название, артикул и категорию.");
  if (!Number.isInteger(price) || price <= 0) redirectWithError(returnPath, "Цена должна быть положительным целым числом.");
  if (originalPrice !== null && (!Number.isInteger(originalPrice) || originalPrice <= price)) {
    redirectWithError(returnPath, "Старая цена должна быть больше текущей.");
  }

  const care = formData.getAll("care").map(String).map((item) => item.trim()).filter(Boolean);
  const sizes = formData.getAll("size").map(String).map((size, index) => ({
    size: size.trim(),
    inStock: formData.get(`inStock-${index}`) === "on",
  })).filter((item) => item.size);

  if (!/^#[0-9a-fA-F]{6}$/.test(getText(formData, "imageColor"))) {
    redirectWithError(returnPath, "Цвет должен быть в формате #RRGGBB.");
  }
  const colorSwatch = getText(formData, "colorSwatch") || null;
  if (colorSwatch && !/^#[0-9a-fA-F]{6}$/.test(colorSwatch)) {
    redirectWithError(returnPath, "Свотч цвета должен быть в формате #RRGGBB.");
  }

  return {
    name, brand, sku, categoryId, department, price, originalPrice,
    description: getText(formData, "description") || null,
    composition: getText(formData, "composition") || null,
    fit: getText(formData, "fit") || null,
    care,
    imageColor: getText(formData, "imageColor"),
    colorGroup: getText(formData, "colorGroup") || null,
    color: getText(formData, "color") || null,
    colorSwatch,
    galleryTones: formData.getAll("galleryTones").map(String),
    sizes,
  };
}

function productData(input: ProductInput) {
  return {
    name: input.name, brand: input.brand, sku: input.sku, categoryId: input.categoryId, department: input.department, price: input.price,
    originalPrice: input.originalPrice, description: input.description, composition: input.composition,
    care: input.care, fit: input.fit, imageColor: input.imageColor, colorGroup: input.colorGroup,
    color: input.color, colorSwatch: input.colorSwatch, galleryTones: input.galleryTones,
  };
}

async function getUploadedImages(formData: FormData) {
  const imageUrl = getText(formData, "mainImageUrl") || null;
  const galleryUrls = formData.getAll("galleryImageUrl").map(String).filter(Boolean);
  if (imageUrl && !isBlobUrl(imageUrl)) throw new Error("Некорректная ссылка на главное фото.");
  if (galleryUrls.some((url) => !isBlobUrl(url))) throw new Error("Некорректная ссылка на фото галереи.");
  return { imageUrl, galleryUrls };
}

export async function createProduct(formData: FormData) {
  const input = parseProductInput(formData, "/admin/products/new");
  let images: Awaited<ReturnType<typeof getUploadedImages>>;
  try {
    images = await getUploadedImages(formData);
  } catch (error) {
    redirectWithError("/admin/products/new", error instanceof Error ? error.message : "Не удалось загрузить изображение.");
  }
  try {
    const product = await prisma.product.create({
      data: { ...productData(input), ...images, sizes: { create: input.sizes } },
    });
    revalidatePath("/admin/products");
    redirect(`/admin/products/${product.id}`);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      redirectWithError("/admin/products/new", "Такой артикул уже существует.");
    }
    throw error;
  }
}

export async function updateProduct(id: string, formData: FormData) {
  const input = parseProductInput(formData, `/admin/products/${id}`);
  let images: Awaited<ReturnType<typeof getUploadedImages>>;
  try {
    images = await getUploadedImages(formData);
  } catch (error) {
    redirectWithError(`/admin/products/${id}`, error instanceof Error ? error.message : "Не удалось загрузить изображение.");
  }
  try {
    const currentProduct = await prisma.product.findUniqueOrThrow({ where: { id }, select: { imageUrl: true, galleryUrls: true } });
    const removeMainImage = formData.get("removeMainImage") === "on";
    const galleryUrlsToRemove = new Set(formData.getAll("removeGalleryImage").map(String));
    const nextImageUrl = images.imageUrl ?? (removeMainImage ? null : currentProduct.imageUrl);
    const nextGalleryUrls = [...currentProduct.galleryUrls.filter((url) => !galleryUrlsToRemove.has(url)), ...images.galleryUrls];
    await prisma.$transaction(async (tx) => {
      await tx.product.update({ where: { id }, data: { ...productData(input), imageUrl: nextImageUrl, galleryUrls: nextGalleryUrls } });
      await tx.productSize.deleteMany({ where: { productId: id } });
      if (input.sizes.length) await tx.productSize.createMany({ data: input.sizes.map((size) => ({ ...size, productId: id })) });
    });
    const removedUrls = [
      ...((removeMainImage || images.imageUrl) && currentProduct.imageUrl ? [currentProduct.imageUrl] : []),
      ...currentProduct.galleryUrls.filter((url) => galleryUrlsToRemove.has(url)),
    ];
    await Promise.all(removedUrls.map(deleteProductImage));
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      redirectWithError(`/admin/products/${id}`, "Такой артикул уже существует.");
    }
    throw error;
  }
  redirect(`/admin/products/${id}?saved=1`);
}

export async function deleteProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    select: { imageUrl: true, galleryUrls: true },
  });
  await prisma.$transaction(async (tx) => {
    await tx.lookItem.deleteMany({ where: { productId: id } });
    await tx.product.delete({ where: { id } });
  });
  if (product) await Promise.all([...(product.imageUrl ? [product.imageUrl] : []), ...product.galleryUrls].map(deleteProductImage));
  revalidatePath("/admin/products");
  revalidatePath("/admin/looks");
  revalidatePath("/looks");
  revalidatePath("/catalog");
  revalidatePath("/");
  redirect("/admin/products");
}

function assertBulkDeletionConfirmed(formData: FormData) {
  if (formData.get("confirmation") !== "УДАЛИТЬ") {
    throw new Error("Для массового удаления введите слово «УДАЛИТЬ».");
  }
}

export async function deleteAllProducts(formData: FormData) {
  assertBulkDeletionConfirmed(formData);
  const products = await prisma.product.findMany({
    select: { id: true, imageUrl: true, galleryUrls: true },
  });

  await prisma.$transaction(async (tx) => {
    await tx.lookItem.deleteMany({});
    await tx.product.deleteMany({});
    await tx.look.deleteMany({});
  });

  const imageUrls = products.flatMap((product) => [
    ...(product.imageUrl ? [product.imageUrl] : []),
    ...product.galleryUrls,
  ]);
  await Promise.all(imageUrls.map(deleteProductImage));

  revalidatePath("/admin/products");
  revalidatePath("/admin/looks");
  revalidatePath("/looks");
  revalidatePath("/catalog");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function deleteAllProductPhotos(formData: FormData) {
  assertBulkDeletionConfirmed(formData);
  const products = await prisma.product.findMany({
    select: { imageUrl: true, galleryUrls: true },
  });
  const imageUrls = products.flatMap((product) => [
    ...(product.imageUrl ? [product.imageUrl] : []),
    ...product.galleryUrls,
  ]);

  await Promise.all(imageUrls.map(deleteProductImage));
  await prisma.product.updateMany({ data: { imageUrl: null, galleryUrls: [] } });

  revalidatePath("/admin/products");
  revalidatePath("/looks");
  revalidatePath("/catalog");
  revalidatePath("/");
  redirect("/admin/products");
}

export type CsvImportReport = {
  created: number;
  updated: number;
  skipped: { line: number; reason: string }[];
  photosNotFound: string[];
};

type CsvRow = Record<string, string>;

const requiredCsvColumns = ["sku", "name", "category", "price", "originalPrice", "description", "composition", "fit", "sizes", "care"];

function detectDelimiter(text: string) {
  const header = text.replace(/^\uFEFF/, "").split(/\r?\n/, 1)[0] ?? "";
  return header.includes(";") ? ";" : ",";
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  const delimiter = detectDelimiter(text);

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"') {
      if (inQuotes && text[index + 1] === '"') { cell += '"'; index += 1; } else inQuotes = !inQuotes;
    } else if (character === delimiter && !inQuotes) {
      row.push(cell.trim()); cell = "";
    } else if ((character === "\n" || character === "\r") && !inQuotes) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = []; cell = "";
    } else cell += character;
  }
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function toCsvRows(text: string): { rows: CsvRow[]; error?: string } {
  const [header = [], ...data] = parseCsv(text.replace(/^\uFEFF/, ""));
  const normalizedHeader = header.map((item) => item.trim());
  const missing = requiredCsvColumns.filter((column) => !normalizedHeader.includes(column));
  if (missing.length) return { rows: [], error: `Нет обязательных колонок: ${missing.join(", ")}.` };
  return { rows: data.map((cells) => Object.fromEntries(normalizedHeader.map((column, index) => [column, cells[index] ?? ""]))) };
}

function validateCsvRow(row: CsvRow) {
  const sku = row.sku.trim();
  const name = row.name.trim();
  const category = row.category.trim();
  const price = Number(row.price);
  const originalPrice = row.originalPrice.trim() ? Number(row.originalPrice) : null;
  if (!sku || !name || !category) return { error: "Не заполнены артикул, название или категория." } as const;
  if (!Number.isInteger(price) || price <= 0) return { error: "Цена должна быть положительным целым числом." } as const;
  if (originalPrice !== null && (!Number.isInteger(originalPrice) || originalPrice <= price)) return { error: "Старая цена должна быть целым числом больше текущей." } as const;
  const sizes = [...new Set(row.sizes.split(",").map((size) => size.trim()).filter(Boolean))];
  const care = row.care.split(";").map((item) => item.trim()).filter(Boolean);
  const imageColor = row.imageColor?.trim() || "#B08D4F";
  if (!/^#[0-9a-fA-F]{6}$/.test(imageColor)) return { error: "Цвет заглушки должен быть в формате #RRGGBB." } as const;
  return {
    value: {
      sku, name, category, price, originalPrice,
      description: row.description.trim() || null,
      composition: row.composition.trim() || null,
      fit: row.fit.trim() || null,
      care, sizes, imageColor,
      colorGroup: row.colorGroup?.trim() || null,
      color: row.color?.trim() || null,
      colorSwatch: row.colorSwatch?.trim() || null,
    },
  } as const;
}

const imageTypes: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function zipImageEntries(zip: JSZip, sku: string) {
  const escapedSku = escapeRegExp(sku);
  const entries = Object.values(zip.files).filter((entry) => !entry.dir);
  const mainPattern = new RegExp(`(?:^|/)${escapedSku}\\.(jpg|jpeg|png|webp)$`, "i");
  const galleryPattern = new RegExp(`(?:^|/)${escapedSku}-(\\d+)\\.(jpg|jpeg|png|webp)$`, "i");
  const main = entries.find((entry) => mainPattern.test(entry.name));
  const gallery = entries.map((entry) => {
    const match = entry.name.match(galleryPattern);
    return match ? { entry, order: Number(match[1]) } : null;
  }).filter((item): item is { entry: JSZip.JSZipObject; order: number } => item !== null).sort((a, b) => a.order - b.order).map((item) => item.entry);
  return { main, gallery };
}

async function uploadZipImage(entry: JSZip.JSZipObject) {
  const extension = entry.name.split(".").pop()?.toLowerCase() ?? "";
  const type = imageTypes[extension];
  if (!type) throw new Error("Поддерживаются только JPG, PNG и WebP.");
  const bytes = await entry.async("uint8array");
  const imageBytes = new Uint8Array(bytes.length);
  imageBytes.set(bytes);
  return saveProductImage(new File([imageBytes], entry.name.split("/").pop() || "image", { type }));
}

const MAX_ZIP_SIZE = 100 * 1024 * 1024;

function isVercelBlobUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
}

async function loadImageZip(blobUrl: string) {
  if (!blobUrl || !isVercelBlobUrl(blobUrl)) throw new Error("Не удалось получить ZIP-архив из хранилища.");
  const response = await fetch(blobUrl);
  if (!response.ok) throw new Error("Не удалось скачать ZIP-архив.");
  const contentLength = Number(response.headers.get("content-length") ?? 0);
  if (contentLength > MAX_ZIP_SIZE) throw new Error("ZIP-архив не должен превышать 100 МБ.");
  const bytes = await response.arrayBuffer();
  if (bytes.byteLength > MAX_ZIP_SIZE) throw new Error("ZIP-архив не должен превышать 100 МБ.");
  try {
    return await JSZip.loadAsync(bytes);
  } catch {
    throw new Error("Не удалось открыть ZIP-архив. Проверьте файл и попробуйте снова.");
  }
}

export type PhotosOnlyImportReport = { updatedSkus: string[]; photosNotFound: string[]; errors: string[] };

export async function importPhotosOnly(_: PhotosOnlyImportReport | null, formData: FormData): Promise<PhotosOnlyImportReport> {
  const report: PhotosOnlyImportReport = { updatedSkus: [], photosNotFound: [], errors: [] };
  let zip: JSZip;
  try {
    zip = await loadImageZip(getText(formData, "imagesZipUrl"));
  } catch (error) {
    return { ...report, errors: [error instanceof Error ? error.message : "Не удалось открыть архив."] };
  }

  const products = await prisma.product.findMany({ select: { id: true, sku: true } });
  for (const product of products) {
    const entries = zipImageEntries(zip, product.sku);
    if (!entries.main && !entries.gallery.length) {
      report.photosNotFound.push(product.sku);
      continue;
    }
    try {
      const mainImage = entries.main ? await uploadZipImage(entries.main) : null;
      const galleryImages = (await Promise.all(entries.gallery.map(uploadZipImage))).filter((url): url is string => Boolean(url));
      await prisma.product.update({ where: { id: product.id }, data: { ...(mainImage ? { imageUrl: mainImage } : {}), ...(galleryImages.length ? { galleryUrls: galleryImages } : {}) } });
      report.updatedSkus.push(product.sku);
    } catch (error) {
      report.errors.push(`${product.sku}: ${error instanceof Error ? error.message : "не удалось загрузить фото."}`);
    }
  }
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath("/looks");
  revalidatePath("/admin/products");
  return report;
}

export async function importProductsCsv(_: CsvImportReport | null, formData: FormData): Promise<CsvImportReport> {
  const file = formData.get("csv");
  const imagesZipUrl = getText(formData, "imagesZipUrl");
  const report: CsvImportReport = { created: 0, updated: 0, skipped: [], photosNotFound: [] };
  if (!(file instanceof File) || file.size === 0) {
    return { ...report, skipped: [{ line: 0, reason: "Выберите непустой CSV-файл." }] };
  }

  let imageZip: JSZip | null = null;
  if (imagesZipUrl) {
    try { imageZip = await loadImageZip(imagesZipUrl); } catch (error) { return { ...report, skipped: [{ line: 0, reason: error instanceof Error ? error.message : "Не удалось открыть ZIP-архив." }] }; }
  }

  const parsed = toCsvRows(await file.text());
  if (parsed.error) return { ...report, skipped: [{ line: 1, reason: parsed.error }] };

  for (const [index, row] of parsed.rows.entries()) {
    const line = index + 2;
    const checked = validateCsvRow(row);
    if ("error" in checked) { report.skipped.push({ line, reason: checked.error ?? "Некорректные данные." }); continue; }
    const input = checked.value;
    try {
      const category = await getOrCreateImportedCategory(input.category);
      const existing = await prisma.product.findUnique({ where: { sku: input.sku }, select: { id: true } });
      const data = {
        sku: input.sku, name: input.name, categoryId: category.id, price: input.price,
        originalPrice: input.originalPrice, description: input.description, composition: input.composition,
        fit: input.fit, care: input.care, imageColor: input.imageColor,
        colorGroup: input.colorGroup, color: input.color, colorSwatch: input.colorSwatch,
      };
      const imageEntries = imageZip ? zipImageEntries(imageZip, input.sku) : null;
      if (imageZip && !imageEntries?.main) report.photosNotFound.push(input.sku);
      const uploadedMain = imageEntries?.main ? await uploadZipImage(imageEntries.main) : null;
      const uploadedGallery = imageEntries ? (await Promise.all(imageEntries.gallery.map(uploadZipImage))).filter((url): url is string => Boolean(url)) : [];

      if (existing) {
        await prisma.$transaction(async (tx) => {
          await tx.product.update({ where: { id: existing.id }, data: { ...data, ...(uploadedMain ? { imageUrl: uploadedMain } : {}), ...(uploadedGallery.length ? { galleryUrls: uploadedGallery } : {}) } });
          await tx.productSize.deleteMany({ where: { productId: existing.id } });
          if (input.sizes.length) await tx.productSize.createMany({ data: input.sizes.map((size) => ({ productId: existing.id, size, inStock: true })) });
        });
        report.updated += 1;
      } else {
        await prisma.product.create({
          data: {
            ...data,
            galleryTones: ["accent"],
            ...(uploadedMain ? { imageUrl: uploadedMain } : {}),
            ...(uploadedGallery.length ? { galleryUrls: uploadedGallery } : {}),
            sizes: { create: input.sizes.map((size) => ({ size, inStock: true })) },
          },
        });
        report.created += 1;
      }
    } catch (error) {
      report.skipped.push({ line, reason: error instanceof Error ? error.message : "Не удалось сохранить товар." });
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/catalog");
  return report;
}

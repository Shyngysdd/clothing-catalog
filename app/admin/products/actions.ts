"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

type ProductInput = {
  name: string;
  sku: string;
  category: string;
  price: number;
  originalPrice: number | null;
  description: string | null;
  composition: string | null;
  fit: string | null;
  care: string[];
  imageColor: string;
  galleryTones: string[];
  sizes: { size: string; inStock: boolean }[];
};

function getText(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

function parseProductInput(formData: FormData, returnPath: string): ProductInput {
  const name = getText(formData, "name");
  const sku = getText(formData, "sku");
  const category = getText(formData, "category");
  const priceRaw = getText(formData, "price");
  const originalPriceRaw = getText(formData, "originalPrice");
  const price = Number(priceRaw);
  const originalPrice = originalPriceRaw ? Number(originalPriceRaw) : null;

  if (!name || !sku || !category) redirectWithError(returnPath, "Заполните название, артикул и категорию.");
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

  return {
    name, sku, category, price, originalPrice,
    description: getText(formData, "description") || null,
    composition: getText(formData, "composition") || null,
    fit: getText(formData, "fit") || null,
    care,
    imageColor: getText(formData, "imageColor"),
    galleryTones: formData.getAll("galleryTones").map(String),
    sizes,
  };
}

function productData(input: ProductInput) {
  return {
    name: input.name, sku: input.sku, category: input.category, price: input.price,
    originalPrice: input.originalPrice, description: input.description, composition: input.composition,
    care: input.care, fit: input.fit, imageColor: input.imageColor, galleryTones: input.galleryTones,
  };
}

export async function createProduct(formData: FormData) {
  const input = parseProductInput(formData, "/admin/products/new");
  try {
    const product = await prisma.product.create({
      data: { ...productData(input), sizes: { create: input.sizes } },
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
  try {
    await prisma.$transaction(async (tx) => {
      await tx.product.update({ where: { id }, data: productData(input) });
      await tx.productSize.deleteMany({ where: { productId: id } });
      if (input.sizes.length) await tx.productSize.createMany({ data: input.sizes.map((size) => ({ ...size, productId: id })) });
    });
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
  await prisma.$transaction(async (tx) => {
    await tx.lookItem.deleteMany({ where: { productId: id } });
    await tx.product.delete({ where: { id } });
  });
  revalidatePath("/admin/products");
  revalidatePath("/admin/looks");
  revalidatePath("/looks");
  redirect("/admin/products");
}

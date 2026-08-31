"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { CUSTOMER_SESSION_COOKIE, getCustomerIdFromSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";

async function getAuthenticatedCustomerId() {
  const cookieStore = await cookies();
  return getCustomerIdFromSession(cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value);
}

export async function toggleCustomerFavorite(productId: string, selectedSize?: string) {
  const customerId = await getAuthenticatedCustomerId();
  if (!customerId || !productId) return { authenticated: false as const, favorite: false };

  const existingFavorite = await prisma.favorite.findUnique({ where: { customerId_productId: { customerId, productId } } });
  if (existingFavorite) {
    await prisma.favorite.delete({ where: { id: existingFavorite.id } });
    revalidatePath("/favorites");
    revalidatePath("/account/favorites");
    return { authenticated: true as const, favorite: false };
  }

  await prisma.favorite.create({ data: { customerId, productId, selectedSize: selectedSize || null } });
  revalidatePath("/favorites");
  revalidatePath("/account/favorites");
  return { authenticated: true as const, favorite: true };
}

export async function mergeGuestFavorites(favorites: { productId: string; selectedSize?: string }[]) {
  const customerId = await getAuthenticatedCustomerId();
  if (!customerId) return { authenticated: false as const, mergedProductIds: [] as string[] };

  const uniqueFavorites = [...new Map(favorites.filter((favorite) => favorite.productId).map((favorite) => [favorite.productId, favorite])).values()];
  if (uniqueFavorites.length > 0) {
    await prisma.favorite.createMany({
      data: uniqueFavorites.map((favorite) => ({ customerId, productId: favorite.productId, selectedSize: favorite.selectedSize || null })),
      skipDuplicates: true,
    });
    revalidatePath("/favorites");
    revalidatePath("/account/favorites");
  }

  return { authenticated: true as const, mergedProductIds: uniqueFavorites.map((favorite) => favorite.productId) };
}

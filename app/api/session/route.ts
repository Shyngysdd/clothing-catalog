import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CUSTOMER_SESSION_COOKIE, getCustomerIdFromSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";
import { getCachedSiteCategories } from "@/lib/site-categories";

export async function GET() {
  const cookieStore = await cookies();
  const customerId = await getCustomerIdFromSession(cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value);
  const [categories, favorites, lookFavorites, customer] = await Promise.all([
    getCachedSiteCategories(),
    customerId
      ? prisma.favorite.findMany({ where: { customerId }, select: { productId: true, selectedSize: true } })
      : Promise.resolve([]),
    customerId
      ? prisma.lookFavorite.findMany({ where: { customerId }, select: { lookId: true } })
      : Promise.resolve([]),
    customerId
      ? prisma.customer.findUnique({
          where: { id: customerId },
          select: {
            name: true,
            phone: true,
            addresses: {
              select: { id: true, label: true, city: true, addressLine: true, apartment: true, comment: true, isDefault: true },
              orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
            },
          },
        })
      : Promise.resolve(null),
  ]);

  return NextResponse.json(
    {
      isCustomerLoggedIn: Boolean(customerId),
      favorites,
      lookFavoriteIds: lookFavorites.map((favorite) => favorite.lookId),
      savedAddresses: customer?.addresses ?? [],
      customerName: customer?.name,
      customerPhone: customer?.phone ?? undefined,
      categories,
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

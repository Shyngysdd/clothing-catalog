import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CUSTOMER_SESSION_COOKIE, getCustomerIdFromSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";
import { getCachedSiteCategories } from "@/lib/site-categories";

export async function GET() {
  const cookieStore = await cookies();
  const customerId = await getCustomerIdFromSession(cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value);
  const [categories, favorites, savedAddresses] = await Promise.all([
    getCachedSiteCategories(),
    customerId
      ? prisma.favorite.findMany({ where: { customerId }, select: { productId: true, selectedSize: true } })
      : Promise.resolve([]),
    customerId
      ? prisma.customerAddress.findMany({
          where: { customerId },
          select: { id: true, label: true, city: true, addressLine: true, apartment: true, comment: true, isDefault: true },
          orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
        })
      : Promise.resolve([]),
  ]);

  return NextResponse.json(
    { isCustomerLoggedIn: Boolean(customerId), favorites, savedAddresses, categories },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

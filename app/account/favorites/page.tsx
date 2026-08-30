import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { FavoritesList } from "@/components/favorites-list";
import { CUSTOMER_SESSION_COOKIE, getCustomerIdFromSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";

export default async function AccountFavoritesPage() {
  const cookieStore = await cookies();
  const customerId = await getCustomerIdFromSession(cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value);
  if (!customerId) redirect("/account/login");
  const favorites = await prisma.favorite.findMany({ where: { customerId }, orderBy: { createdAt: "desc" }, select: { productId: true } });
  const products = await prisma.product.findMany({ where: { id: { in: favorites.map((favorite) => favorite.productId) } }, include: { sizes: true } });
  const productsById = new Map(products.map((product) => [product.id, product]));
  const favoriteProducts = favorites.flatMap((favorite) => { const product = productsById.get(favorite.productId); return product ? [product] : []; });
  return <main className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6 sm:py-16 lg:px-10"><Link href="/account" className="font-mono-price text-xs tracking-[0.1em] text-[color:var(--accent)]">← ЛИЧНЫЙ КАБИНЕТ</Link><h1 className="font-display mt-5 text-[clamp(2.6rem,8vw,4.5rem)] leading-[0.9] tracking-[-0.04em]">Избранное</h1><FavoritesList products={favoriteProducts} /></main>;
}

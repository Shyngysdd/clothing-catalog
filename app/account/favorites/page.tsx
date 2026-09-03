import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { FavoritesList } from "@/components/favorites-list";
import { CUSTOMER_SESSION_COOKIE, getCustomerIdFromSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";
import { toCatalogLook } from "@/lib/catalog-types";

export default async function AccountFavoritesPage() {
  const cookieStore = await cookies();
  const customerId = await getCustomerIdFromSession(cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value);
  if (!customerId) redirect("/account/login");
  const favorites = await prisma.favorite.findMany({ where: { customerId }, orderBy: { createdAt: "desc" }, select: { productId: true } });
  const products = await prisma.product.findMany({ where: { id: { in: favorites.map((favorite) => favorite.productId) } }, include: { sizes: true } });
  const productsById = new Map(products.map((product) => [product.id, product]));
  const favoriteProducts = favorites.flatMap((favorite) => { const product = productsById.get(favorite.productId); return product ? [product] : []; });
  const looks = await prisma.look.findMany({ include: { items: { include: { product: { include: { sizes: true } } } } }, orderBy: { createdAt: "desc" } });
  return <main className="favorites-page mx-auto max-w-[100rem] px-4 py-10 sm:px-6 sm:py-16 lg:px-10"><Link href="/account" className="product-back-link font-mono-price text-xs tracking-[0.1em] text-[color:var(--accent)]">← ЛИЧНЫЙ КАБИНЕТ</Link><header className="favorites-page-header mt-4 border-b border-[color:var(--ink)]/20 pb-8 sm:pb-10"><div><p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--accent)]">СОХРАНЁННОЕ</p><h1 className="font-display mt-3 text-[clamp(3.2rem,8vw,6.2rem)] leading-[0.8]">Избранное</h1></div><p>Ваша личная подборка вещей и образов, доступная в любой момент из кабинета.</p></header><FavoritesList products={favoriteProducts} looks={looks.map(toCatalogLook)} /></main>;
}

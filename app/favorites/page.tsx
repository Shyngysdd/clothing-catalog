import { FavoritesList } from "@/components/favorites-list";
import { prisma } from "@/lib/prisma";
import { toCatalogLook } from "@/lib/catalog-types";

export default async function FavoritesPage() {
  const [products, looks] = await Promise.all([
    prisma.product.findMany({ include: { sizes: true }, orderBy: { createdAt: "desc" } }),
    prisma.look.findMany({ include: { items: { include: { product: { include: { sizes: true } } } } }, orderBy: { createdAt: "desc" } }),
  ]);
  return <main className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6 sm:py-16 lg:px-10"><p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--accent)]">ВАШ ВЫБОР</p><h1 className="font-display mt-3 text-[clamp(2.6rem,8vw,4.5rem)] leading-[0.9] tracking-[-0.04em]">Избранное</h1><FavoritesList products={products} looks={looks.map(toCatalogLook)} /></main>;
}

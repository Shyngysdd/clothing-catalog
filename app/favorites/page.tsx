import { FavoritesList } from "@/components/favorites-list";
import { prisma } from "@/lib/prisma";

export default async function FavoritesPage() {
  const products = await prisma.product.findMany({ include: { sizes: true }, orderBy: { createdAt: "desc" } });
  return <main className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6 sm:py-16 lg:px-10"><p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--accent)]">ВАШ ВЫБОР</p><h1 className="font-display mt-3 text-5xl leading-none tracking-[-0.04em] sm:text-7xl">Избранное</h1><FavoritesList products={products} /></main>;
}

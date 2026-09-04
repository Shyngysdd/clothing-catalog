import { FavoritesList } from "@/components/favorites-list";
import { prisma } from "@/lib/prisma";
import { toCatalogLook } from "@/lib/catalog-types";
import { getTranslations } from "next-intl/server";

export default async function FavoritesPage() {
  const t = await getTranslations("Favorites");
  const [products, looks] = await Promise.all([
    prisma.product.findMany({ include: { sizes: true, category: true }, orderBy: { createdAt: "desc" } }),
    prisma.look.findMany({ include: { items: { include: { product: { include: { sizes: true, category: true } } } } }, orderBy: { createdAt: "desc" } }),
  ]);
  return <main className="favorites-page mx-auto max-w-[100rem] px-4 py-10 sm:px-6 sm:py-16 lg:px-10"><header className="favorites-page-header border-b border-[color:var(--border)] pb-8 sm:pb-10"><div><p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--accent)]">{t("title").toUpperCase()}</p><h1 className="font-display mt-3 text-[clamp(3.2rem,8vw,6.2rem)] leading-[0.8]">{t("title")}</h1></div><p>{t("empty")}</p></header><FavoritesList products={products} looks={looks.map(toCatalogLook)} /></main>;
}

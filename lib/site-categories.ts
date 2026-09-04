import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export type SiteCategory = { slug: string; nameRu: string; nameEn: string; nameKz: string; count: number };

export const getCachedSiteCategories = unstable_cache(
  async (): Promise<SiteCategory[]> => {
    const categories = await prisma.category.findMany({
      orderBy: { nameRu: "asc" },
      include: { _count: { select: { products: true } } },
    });
    return categories.map((category) => ({ slug: category.slug, nameRu: category.nameRu, nameEn: category.nameEn, nameKz: category.nameKz, count: category._count.products }));
  },
  ["site-categories"],
  { revalidate: 300 },
);

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export type SiteCategory = { name: string; count: number };

export const getCachedSiteCategories = unstable_cache(
  async (): Promise<SiteCategory[]> => {
    const groups = await prisma.product.groupBy({
      by: ["category"],
      _count: { _all: true },
      orderBy: { category: "asc" },
    });
    return groups.map((group) => ({ name: group.category, count: group._count._all }));
  },
  ["site-categories"],
  { revalidate: 300 },
);

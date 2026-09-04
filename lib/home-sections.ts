import { getOrSetCache } from "@/lib/cache";
import { prisma } from "@/lib/prisma";

type Section = { type: string; categoryValue: string | null; productIds: string[] };
type Product = { id: string; category: { slug: string }; originalPrice: number | null; createdAt: Date; };
type GroupedOrderItem = { productId: string; _sum: { quantity: number | null } };

export function getHomeBestsellers() {
  return getOrSetCache("home-bestsellers", 300, () =>
    prisma.orderItem.groupBy({ by: ["productId"], _sum: { quantity: true } }),
  );
}

export function resolveSectionProducts<T extends Product>(section: Section, allProducts: T[], allOrderItems: GroupedOrderItem[]) {
  switch (section.type) {
    case "newest": return [...allProducts].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 10);
    case "sale": return allProducts.filter((product) => product.originalPrice !== null).slice(0, 10);
    case "category": return allProducts.filter((product) => product.category.slug === section.categoryValue).slice(0, 10);
    case "bestseller": {
      const positions = new Map(allOrderItems.sort((a, b) => (b._sum.quantity ?? 0) - (a._sum.quantity ?? 0)).map((item, index) => [item.productId, index]));
      return allProducts.filter((product) => positions.has(product.id)).sort((a, b) => positions.get(a.id)! - positions.get(b.id)!).slice(0, 10);
    }
    case "manual": {
      const byId = new Map(allProducts.map((product) => [product.id, product]));
      return section.productIds.map((id) => byId.get(id)).filter((product): product is T => Boolean(product));
    }
    default: return [];
  }
}

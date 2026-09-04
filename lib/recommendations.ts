import { prisma } from "@/lib/prisma";
import type { CatalogProduct } from "@/lib/catalog-types";

const recommendationInclude = { sizes: true, category: true } as const;

function isInStock(product: CatalogProduct) {
  return product.sizes.some((size) => size.inStock);
}

function sortAvailableAndRecent(products: CatalogProduct[]) {
  return [...products].sort((first, second) => {
    const stockDifference = Number(isInStock(second)) - Number(isInStock(first));
    if (stockDifference !== 0) return stockDifference;
    return new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime();
  });
}

export async function getSimilarProducts(product: CatalogProduct): Promise<CatalogProduct[]> {
  const sameCategory = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id } },
    include: recommendationInclude,
  });

  if (sameCategory.length >= 4) return sortAvailableAndRecent(sameCategory).slice(0, 8);

  const additionalProducts = await prisma.product.findMany({
    where: { categoryId: { not: product.categoryId }, id: { not: product.id } },
    include: recommendationInclude,
  });

  return sortAvailableAndRecent([...sameCategory, ...additionalProducts]).slice(0, 8);
}

export async function getFrequentlyBoughtTogether(productId: string): Promise<CatalogProduct[]> {
  const ordersWithProduct = await prisma.orderItem.findMany({
    where: { productId },
    select: { orderId: true },
  });
  const orderIds = [...new Set(ordersWithProduct.map((item) => item.orderId))];

  if (orderIds.length > 0) {
    const coPurchasedItems = await prisma.orderItem.findMany({
      where: { orderId: { in: orderIds }, productId: { not: productId } },
      select: { productId: true },
    });
    const frequency = new Map<string, number>();
    coPurchasedItems.forEach((item) => frequency.set(item.productId, (frequency.get(item.productId) ?? 0) + 1));

    if (frequency.size >= 3) {
      const products = await prisma.product.findMany({
        where: { id: { in: [...frequency.keys()] } },
        include: recommendationInclude,
      });
      return [...products]
        .sort((first, second) => {
          const frequencyDifference = (frequency.get(second.id) ?? 0) - (frequency.get(first.id) ?? 0);
          if (frequencyDifference !== 0) return frequencyDifference;
          const stockDifference = Number(isInStock(second)) - Number(isInStock(first));
          if (stockDifference !== 0) return stockDifference;
          return new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime();
        })
        .slice(0, 8);
    }
  }

  const lookMemberships = await prisma.lookItem.findMany({
    where: { productId },
    select: { lookId: true },
  });
  const lookIds = [...new Set(lookMemberships.map((item) => item.lookId))];
  if (lookIds.length === 0) return [];

  const relatedLookItems = await prisma.lookItem.findMany({
    where: { lookId: { in: lookIds }, productId: { not: productId } },
    select: { productId: true },
  });
  const relatedIds = [...new Set(relatedLookItems.map((item) => item.productId))];
  if (relatedIds.length === 0) return [];

  const lookProducts = await prisma.product.findMany({
    where: { id: { in: relatedIds } },
    include: recommendationInclude,
  });
  return sortAvailableAndRecent(lookProducts).slice(0, 8);
}

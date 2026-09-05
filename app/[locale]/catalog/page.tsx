import { prisma } from "@/lib/prisma";
import { toCatalogProduct } from "@/lib/catalog-types";
import { CatalogClient } from "./catalog-client";

export const revalidate = 60;

export default async function CatalogPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ category?: string; department?: string; sale?: string; search?: string }> }) {
  const { locale } = await params;
  const { category, department, sale, search } = await searchParams;
  const products = await prisma.product.findMany({ include: { sizes: true, category: true }, orderBy: { createdAt: "desc" } });
  return <CatalogClient key={`${department ?? "all"}-${category ?? "all"}-${sale ?? "regular"}-${search ?? ""}`} products={products.map((product) => toCatalogProduct(product, locale))} initialSearch={search ?? ""} />;
}

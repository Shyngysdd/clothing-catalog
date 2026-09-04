import { prisma } from "@/lib/prisma";
import { CatalogClient } from "./catalog-client";

export const revalidate = 60;

export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ category?: string; department?: string; sale?: string; search?: string }> }) {
  const { category, department, sale, search } = await searchParams;
  const products = await prisma.product.findMany({ include: { sizes: true }, orderBy: { createdAt: "desc" } });
  return <CatalogClient key={`${department ?? "all"}-${category ?? "all"}-${sale ?? "regular"}-${search ?? ""}`} products={products} initialSearch={search ?? ""} />;
}

import { prisma } from "@/lib/prisma";
import { CatalogClient } from "./catalog-client";

export const dynamic = "force-dynamic";

export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ category?: string; sale?: string }> }) {
  const { category, sale } = await searchParams;
  const products = await prisma.product.findMany({ include: { sizes: true }, orderBy: { createdAt: "desc" } });
  return <CatalogClient key={`${category ?? "all"}-${sale ?? "regular"}`} products={products} />;
}

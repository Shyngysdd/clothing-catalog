import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFrequentlyBoughtTogether, getSimilarProducts } from "@/lib/recommendations";
import { prisma } from "@/lib/prisma";
import { BRAND_CONFIG } from "@/lib/brand-config";
import { ProductDetailClient } from "./product-detail-client";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, select: { name: true, description: true, imageUrl: true } });
  if (!product) return { title: `Товар не найден | ${BRAND_CONFIG.name}` };

  const title = `${product.name} | ${BRAND_CONFIG.name}`;
  const description = product.description || `Купить ${product.name} в каталоге ${BRAND_CONFIG.name}.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: product.imageUrl ? [{ url: product.imageUrl, alt: product.name }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, include: { sizes: true } });
  if (!product) notFound();

  const [similarProducts, frequentlyBoughtTogether] = await Promise.all([
    getSimilarProducts(product),
    getFrequentlyBoughtTogether(product.id),
  ]);

  return <ProductDetailClient product={product} similarProducts={similarProducts} frequentlyBoughtTogether={frequentlyBoughtTogether} />;
}

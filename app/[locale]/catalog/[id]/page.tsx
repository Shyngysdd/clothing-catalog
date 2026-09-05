import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFrequentlyBoughtTogether, getSimilarProducts } from "@/lib/recommendations";
import { prisma } from "@/lib/prisma";
import { BRAND_CONFIG } from "@/lib/brand-config";
import { ProductDetailClient } from "./product-detail-client";
import { toCatalogProduct } from "@/lib/catalog-types";
import { getLocalizedField } from "@/lib/localized";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ id: string; locale: string }> }): Promise<Metadata> {
  const { id, locale } = await params;
  const product = await prisma.product.findUnique({ where: { id }, select: { nameRu: true, nameEn: true, nameKz: true, descriptionRu: true, descriptionEn: true, descriptionKz: true, imageUrl: true } });
  if (!product) return { title: `Товар не найден | ${BRAND_CONFIG.name}` };

  const name = getLocalizedField(product, "name", locale);
  const title = `${name} | ${BRAND_CONFIG.name}`;
  const description = getLocalizedField(product, "description", locale) || `Купить ${name} в каталоге ${BRAND_CONFIG.name}.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: product.imageUrl ? [{ url: product.imageUrl, alt: name }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params;
  const dbProduct = await prisma.product.findUnique({ where: { id }, include: { sizes: true, category: true } });
  if (!dbProduct) notFound();
  const product = toCatalogProduct(dbProduct, locale);

  const [similarProducts, frequentlyBoughtTogether, colorSiblings] = await Promise.all([
    getSimilarProducts(product, locale),
    getFrequentlyBoughtTogether(product.id, locale),
    product.colorGroup
      ? prisma.product.findMany({
          where: { colorGroup: product.colorGroup, id: { not: product.id } },
          select: { id: true, color: true, colorSwatch: true, imageColor: true },
          orderBy: { createdAt: "asc" },
        })
      : Promise.resolve([]),
  ]);

  return <ProductDetailClient product={product} similarProducts={similarProducts} frequentlyBoughtTogether={frequentlyBoughtTogether} colorSiblings={colorSiblings} />;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BRAND_CONFIG } from "@/lib/brand-config";
import { toCatalogLook } from "@/lib/catalog-types";
import { getLocalizedField } from "@/lib/localized";
import { LookDetailClient } from "./look-detail-client";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ id: string; locale: string }> }): Promise<Metadata> {
  const { id, locale } = await params;
  const look = await prisma.look.findUnique({
    where: { id },
    select: { titleRu: true, titleEn: true, titleKz: true, descriptionRu: true, descriptionEn: true, descriptionKz: true, items: { select: { product: { select: { imageUrl: true } } } } },
  });
  if (!look) return { title: `Образ не найден | ${BRAND_CONFIG.name}` };

  const lookTitle = getLocalizedField(look, "title", locale);
  const title = `${lookTitle} | ${BRAND_CONFIG.name}`;
  const description = getLocalizedField(look, "description", locale) || `Образ «${lookTitle}» из каталога ${BRAND_CONFIG.name}.`;
  const imageUrl = look.items.map((item) => item.product.imageUrl).find(Boolean);
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: imageUrl ? [{ url: imageUrl, alt: lookTitle }] : [],
    },
  };
}

export default async function LookDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params;
  const look = await prisma.look.findUnique({
    where: { id },
    include: { items: { include: { product: { include: { sizes: true, category: true } } } } },
  });

  if (!look) notFound();

  const lookNumber = await prisma.look.count({ where: { createdAt: { gt: look.createdAt } } }) + 1;
  return <LookDetailClient look={toCatalogLook(look, locale)} lookNumber={lookNumber} />;
}

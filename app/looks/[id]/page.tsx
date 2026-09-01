import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BRAND_CONFIG } from "@/lib/brand-config";
import { toCatalogLook } from "@/lib/catalog-types";
import { LookDetailClient } from "./look-detail-client";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const look = await prisma.look.findUnique({
    where: { id },
    select: { title: true, description: true, items: { select: { product: { select: { imageUrl: true } } } } },
  });
  if (!look) return { title: `Образ не найден | ${BRAND_CONFIG.name}` };

  const title = `${look.title} | ${BRAND_CONFIG.name}`;
  const description = look.description || `Образ «${look.title}» из каталога ${BRAND_CONFIG.name}.`;
  const imageUrl = look.items.map((item) => item.product.imageUrl).find(Boolean);
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: imageUrl ? [{ url: imageUrl, alt: look.title }] : [],
    },
  };
}

export default async function LookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const look = await prisma.look.findUnique({
    where: { id },
    include: { items: { include: { product: { include: { sizes: true } } } } },
  });

  if (!look) notFound();

  const lookNumber = await prisma.look.count({ where: { createdAt: { gt: look.createdAt } } }) + 1;
  return <LookDetailClient look={toCatalogLook(look)} lookNumber={lookNumber} />;
}

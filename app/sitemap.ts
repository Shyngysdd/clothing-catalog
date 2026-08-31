import type { MetadataRoute } from "next";
import { getAppUrl } from "@/lib/email-verification";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getAppUrl();
  const [products, looks] = await Promise.all([
    prisma.product.findMany({ select: { id: true, updatedAt: true } }),
    prisma.look.findMany({ select: { id: true, createdAt: true } }),
  ]);

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/catalog`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/looks`, changeFrequency: "weekly", priority: 0.8 },
    ...products.map((product) => ({ url: `${baseUrl}/catalog/${product.id}`, lastModified: product.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...looks.map((look) => ({ url: `${baseUrl}/looks/${look.id}`, lastModified: look.createdAt, changeFrequency: "weekly" as const, priority: 0.6 })),
  ];
}

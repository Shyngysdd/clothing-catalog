import type { MetadataRoute } from "next";
import { getAppUrl } from "@/lib/email-verification";
import { prisma } from "@/lib/prisma";
import { routing } from "@/i18n/routing";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getAppUrl();
  const [products, looks] = await Promise.all([
    prisma.product.findMany({ select: { id: true, updatedAt: true } }),
    prisma.look.findMany({ select: { id: true, createdAt: true } }),
  ]);

  return routing.locales.flatMap((locale) => [
    { url: `${baseUrl}/${locale}`, lastModified: new Date(), changeFrequency: "daily" as const, priority: locale === routing.defaultLocale ? 1 : 0.9 },
    { url: `${baseUrl}/${locale}/catalog`, changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${baseUrl}/${locale}/looks`, changeFrequency: "weekly" as const, priority: 0.8 },
    ...products.map((product) => ({ url: `${baseUrl}/${locale}/catalog/${product.id}`, lastModified: product.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...looks.map((look) => ({ url: `${baseUrl}/${locale}/looks/${look.id}`, lastModified: look.createdAt, changeFrequency: "weekly" as const, priority: 0.6 })),
  ]);
}

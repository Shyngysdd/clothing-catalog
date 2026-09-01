import { PrismaClient } from "@prisma/client";
import { looks } from "../data/looks";
import { products } from "../data/products";
import { BRAND_CONFIG } from "../lib/brand-config";

const prisma = new PrismaClient();

const originalPrices: Record<string, number> = {
  "ALT-0208": 64900,
  "ALT-0514": 37900,
  "ALT-0846": 52900,
};

async function main() {
  const productIdsByLegacyId = new Map<number, string>();

  for (const product of products) {
    const data = {
      name: product.name,
      brand: BRAND_CONFIG.name,
      category: product.category,
      price: product.price,
      originalPrice: originalPrices[product.sku] ?? null,
      description: product.description,
      composition: product.composition,
      care: product.care,
      fit: product.fit,
      imageColor: product.imageColor,
      imageUrl: null,
      galleryTones: product.galleryTones,
      galleryUrls: [],
    };
    const savedProduct = await prisma.product.upsert({
      where: { sku: product.sku },
      update: data,
      create: { sku: product.sku, ...data },
    });
    productIdsByLegacyId.set(product.id, savedProduct.id);

    await prisma.productSize.deleteMany({
      where: { productId: savedProduct.id, size: { notIn: product.sizes } },
    });

    for (const size of product.sizes) {
      await prisma.productSize.upsert({
        where: { productId_size: { productId: savedProduct.id, size } },
        update: { inStock: !(product.id === 6 && size === "40") },
        create: {
          productId: savedProduct.id,
          size,
          inStock: !(product.id === 6 && size === "40"),
        },
      });
    }
  }

  await Promise.all([
    prisma.banner.upsert({
      where: { slot: "hero" },
      update: {},
      create: {
        slot: "hero",
        title: BRAND_CONFIG.name,
        subtitle: "Новая глава городского гардероба — строгая, тактильная, личная.",
        linkUrl: "/catalog?category=новинки",
        imageUrl: null,
      },
    }),
    prisma.banner.upsert({
      where: { slot: "category-1" },
      update: {},
      create: {
        slot: "category-1",
        title: "Ветровки",
        subtitle: "ВЫБОРКА / 01",
        linkUrl: "/catalog?category=Ветровки",
        imageUrl: null,
      },
    }),
    prisma.banner.upsert({
      where: { slot: "category-2" },
      update: {},
      create: {
        slot: "category-2",
        title: "Обувь",
        subtitle: "ВЫБОРКА / 02",
        linkUrl: "/catalog?category=Обувь",
        imageUrl: null,
      },
    }),
    prisma.homeSection.upsert({
      where: { id: "home-section-newest" },
      update: { title: "Новинки", type: "newest", position: 0, isActive: true },
      create: { id: "home-section-newest", title: "Новинки", type: "newest", productIds: [], position: 0, isActive: true },
    }),
    prisma.homeSection.upsert({
      where: { id: "home-section-sale" },
      update: { title: "Со скидкой", type: "sale", position: 1, isActive: true },
      create: { id: "home-section-sale", title: "Со скидкой", type: "sale", productIds: [], position: 1, isActive: true },
    }),
  ]);

  for (const look of looks) {
    const existingLook = await prisma.look.findFirst({ where: { title: look.title } });
    if (existingLook) continue;

    await prisma.look.create({
      data: {
        title: look.title,
        description: look.description,
        photoTones: look.photoPlaceholders,
        items: {
          create: look.productIds.map((legacyProductId) => ({
            productId: productIdsByLegacyId.get(legacyProductId)!,
          })),
        },
      },
    });
  }
}

main()
  .then(() => console.log("Демо-данные Prisma успешно добавлены."))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());

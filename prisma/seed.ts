import { PrismaClient } from "@prisma/client";
import { looks } from "../data/looks";
import { products } from "../data/products";
import { BRAND_CONFIG } from "../lib/brand-config";
import { slugifyCategory } from "../lib/category-slug";

const prisma = new PrismaClient();

const originalPrices: Record<string, number> = {
  "ALT-0208": 64900,
  "ALT-0514": 37900,
  "ALT-0846": 52900,
};

async function main() {
  const productIdsByLegacyId = new Map<number, string>();
  const categoryIds = new Map<string, string>();

  for (const name of [...new Set(products.map((product) => product.category))]) {
    const category = await prisma.category.upsert({
      where: { slug: slugifyCategory(name) },
      update: { nameRu: name },
      create: { slug: slugifyCategory(name), nameRu: name, nameEn: name, nameKz: name },
    });
    categoryIds.set(name, category.id);
  }

  for (const product of products) {
    const data = {
      nameRu: product.name,
      brand: BRAND_CONFIG.name,
      categoryId: categoryIds.get(product.category)!,
      price: product.price,
      originalPrice: originalPrices[product.sku] ?? null,
      descriptionRu: product.description,
      compositionRu: product.composition,
      care: product.care,
      fitRu: product.fit,
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
        titleRu: BRAND_CONFIG.name,
        subtitleRu: "Новая глава городского гардероба — строгая, тактильная, личная.",
        linkUrl: "/catalog?category=novinki",
        imageUrl: null,
      },
    }),
    prisma.banner.upsert({
      where: { slot: "category-1" },
      update: {},
      create: {
        slot: "category-1",
        titleRu: "Мужское",
        subtitleRu: "ОТДЕЛ / 01",
        linkUrl: "/catalog?department=men",
        imageUrl: null,
      },
    }),
    prisma.banner.upsert({
      where: { slot: "category-2" },
      update: {},
      create: {
        slot: "category-2",
        titleRu: "Женское",
        subtitleRu: "ОТДЕЛ / 02",
        linkUrl: "/catalog?department=women",
        imageUrl: null,
      },
    }),
    prisma.homeSection.upsert({
      where: { id: "home-section-newest" },
      update: { titleRu: "Новинки", type: "newest", position: 0, isActive: true },
      create: { id: "home-section-newest", titleRu: "Новинки", type: "newest", productIds: [], position: 0, isActive: true },
    }),
    prisma.homeSection.upsert({
      where: { id: "home-section-sale" },
      update: { titleRu: "Со скидкой", type: "sale", position: 1, isActive: true },
      create: { id: "home-section-sale", titleRu: "Со скидкой", type: "sale", productIds: [], position: 1, isActive: true },
    }),
  ]);

  for (const look of looks) {
    const existingLook = await prisma.look.findFirst({ where: { titleRu: look.title } });
    if (existingLook) continue;

    await prisma.look.create({
      data: {
        titleRu: look.title,
        descriptionRu: look.description,
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

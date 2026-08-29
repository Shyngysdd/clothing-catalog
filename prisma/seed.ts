import { PrismaClient } from "@prisma/client";
import { looks } from "../data/looks";
import { products } from "../data/products";

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

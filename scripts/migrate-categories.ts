import { PrismaClient } from "@prisma/client";
import { slugifyCategory } from "../lib/category-slug";

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Category" (
      "id" TEXT PRIMARY KEY,
      "slug" TEXT NOT NULL UNIQUE,
      "nameRu" TEXT NOT NULL,
      "nameEn" TEXT NOT NULL,
      "nameKz" TEXT NOT NULL
    )
  `);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "categoryId" TEXT`);

  const legacyColumn = await prisma.$queryRawUnsafe<Array<{ exists: boolean }>>(`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'Product' AND column_name = 'category'
    ) AS "exists"
  `);

  if (!legacyColumn[0]?.exists) {
    console.log("Текстовый столбец Product.category уже отсутствует — перенос не требуется.");
    return;
  }

  const products = await prisma.$queryRawUnsafe<Array<{ id: string; category: string }>>(
    `SELECT "id", "category" FROM "Product" ORDER BY "category", "id"`,
  );
  const names = [...new Set(products.map((product) => product.category.trim()).filter(Boolean))];
  const existingCategories = await prisma.category.findMany({ select: { id: true, slug: true, nameRu: true } });
  const categoriesByName = new Map(existingCategories.map((category) => [category.nameRu, category]));
  const usedSlugs = new Set(existingCategories.map((category) => category.slug));
  const categoryIds = new Map<string, string>();

  for (const name of names) {
    const existing = categoriesByName.get(name);
    if (existing) {
      categoryIds.set(name, existing.id);
      continue;
    }

    const baseSlug = slugifyCategory(name);
    let slug = baseSlug;
    let suffix = 2;
    while (usedSlugs.has(slug)) slug = `${baseSlug}-${suffix++}`;
    usedSlugs.add(slug);

    const category = await prisma.category.create({ data: { slug, nameRu: name, nameEn: name, nameKz: name } });
    categoryIds.set(name, category.id);
  }

  for (const product of products) {
    const categoryId = categoryIds.get(product.category.trim());
    if (!categoryId) throw new Error(`Не удалось определить категорию товара ${product.id}`);
    await prisma.$executeRawUnsafe(`UPDATE "Product" SET "categoryId" = $1 WHERE "id" = $2`, categoryId, product.id);
  }

  for (const [name, categoryId] of categoryIds) {
    const category = await prisma.category.findUniqueOrThrow({ where: { id: categoryId }, select: { slug: true } });
    await prisma.$executeRawUnsafe(`UPDATE "HomeSection" SET "categoryValue" = $1 WHERE "categoryValue" = $2`, category.slug, name);
  }

  const missing = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(`SELECT COUNT(*) AS "count" FROM "Product" WHERE "categoryId" IS NULL`);
  if (Number(missing[0]?.count ?? 0) > 0) throw new Error("Не все товары получили categoryId; старый столбец оставлен без изменений.");

  await prisma.$executeRawUnsafe(`ALTER TABLE "Product" ALTER COLUMN "categoryId" SET NOT NULL`);
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey"
      FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId")`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Product" DROP COLUMN "category"`);

  console.log(`Перенесено товаров: ${products.length}; создано категорий: ${names.length}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());

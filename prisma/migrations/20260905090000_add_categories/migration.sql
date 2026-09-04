CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameRu" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameKz" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Category_slug_key" ON "Category"("slug");

ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "categoryId" TEXT;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'Product' AND column_name = 'category'
    ) THEN
        EXECUTE $migration$
            WITH source AS (
                SELECT DISTINCT btrim("category") AS name
                FROM "Product"
                WHERE btrim("category") <> ''
            ), prepared AS (
                SELECT
                    name,
                    trim(both '-' FROM regexp_replace(lower(name), '[^a-z0-9а-яё]+', '-', 'g')) AS base_slug
                FROM source
            ), ranked AS (
                SELECT
                    name,
                    COALESCE(NULLIF(base_slug, ''), 'category') AS base_slug,
                    count(*) OVER (PARTITION BY base_slug) AS slug_count
                FROM prepared
            )
            INSERT INTO "Category" ("id", "slug", "nameRu", "nameEn", "nameKz")
            SELECT
                'category_' || md5(name),
                CASE
                    WHEN slug_count > 1 OR EXISTS (SELECT 1 FROM "Category" existing WHERE existing."slug" = ranked.base_slug)
                        THEN base_slug || '-' || substr(md5(name), 1, 8)
                    ELSE base_slug
                END,
                name,
                name,
                name
            FROM ranked
            WHERE NOT EXISTS (SELECT 1 FROM "Category" existing WHERE existing."nameRu" = ranked.name)
        $migration$;

        EXECUTE $migration$
            UPDATE "Product" product
            SET "categoryId" = category."id"
            FROM "Category" category
            WHERE category."nameRu" = btrim(product."category")
        $migration$;

        EXECUTE $migration$
            UPDATE "HomeSection" section
            SET "categoryValue" = category."slug"
            FROM "Category" category
            WHERE category."nameRu" = section."categoryValue"
        $migration$;

        ALTER TABLE "Product" DROP COLUMN "category";
    END IF;
END $$;

ALTER TABLE "Product" ALTER COLUMN "categoryId" SET NOT NULL;
CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId");

DO $$
BEGIN
    ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey"
        FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

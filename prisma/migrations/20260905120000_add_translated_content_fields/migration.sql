ALTER TABLE "Product" RENAME COLUMN "name" TO "nameRu";
ALTER TABLE "Product" RENAME COLUMN "description" TO "descriptionRu";
ALTER TABLE "Product" RENAME COLUMN "composition" TO "compositionRu";
ALTER TABLE "Product" RENAME COLUMN "fit" TO "fitRu";

UPDATE "Product"
SET
    "descriptionRu" = COALESCE("descriptionRu", ''),
    "compositionRu" = COALESCE("compositionRu", ''),
    "fitRu" = COALESCE("fitRu", '');

ALTER TABLE "Product" ALTER COLUMN "descriptionRu" SET NOT NULL;
ALTER TABLE "Product" ALTER COLUMN "compositionRu" SET NOT NULL;
ALTER TABLE "Product" ALTER COLUMN "fitRu" SET NOT NULL;
ALTER TABLE "Product" ADD COLUMN "nameEn" TEXT;
ALTER TABLE "Product" ADD COLUMN "nameKz" TEXT;
ALTER TABLE "Product" ADD COLUMN "descriptionEn" TEXT;
ALTER TABLE "Product" ADD COLUMN "descriptionKz" TEXT;
ALTER TABLE "Product" ADD COLUMN "compositionEn" TEXT;
ALTER TABLE "Product" ADD COLUMN "compositionKz" TEXT;
ALTER TABLE "Product" ADD COLUMN "fitEn" TEXT;
ALTER TABLE "Product" ADD COLUMN "fitKz" TEXT;

ALTER TABLE "Look" RENAME COLUMN "title" TO "titleRu";
ALTER TABLE "Look" RENAME COLUMN "description" TO "descriptionRu";
UPDATE "Look" SET "descriptionRu" = COALESCE("descriptionRu", '');
ALTER TABLE "Look" ALTER COLUMN "descriptionRu" SET NOT NULL;
ALTER TABLE "Look" ADD COLUMN "titleEn" TEXT;
ALTER TABLE "Look" ADD COLUMN "titleKz" TEXT;
ALTER TABLE "Look" ADD COLUMN "descriptionEn" TEXT;
ALTER TABLE "Look" ADD COLUMN "descriptionKz" TEXT;

ALTER TABLE "Banner" RENAME COLUMN "title" TO "titleRu";
ALTER TABLE "Banner" RENAME COLUMN "subtitle" TO "subtitleRu";
UPDATE "Banner" SET "subtitleRu" = COALESCE("subtitleRu", '');
ALTER TABLE "Banner" ALTER COLUMN "subtitleRu" SET NOT NULL;
ALTER TABLE "Banner" ADD COLUMN "titleEn" TEXT;
ALTER TABLE "Banner" ADD COLUMN "titleKz" TEXT;
ALTER TABLE "Banner" ADD COLUMN "subtitleEn" TEXT;
ALTER TABLE "Banner" ADD COLUMN "subtitleKz" TEXT;

ALTER TABLE "HomeSection" RENAME COLUMN "title" TO "titleRu";
ALTER TABLE "HomeSection" ADD COLUMN "titleEn" TEXT;
ALTER TABLE "HomeSection" ADD COLUMN "titleKz" TEXT;

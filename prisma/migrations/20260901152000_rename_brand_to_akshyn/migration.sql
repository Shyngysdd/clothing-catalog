-- Обновляем только отображаемое имя бренда и заголовок главного баннера; SKU не затрагиваются.
ALTER TABLE "Product" ALTER COLUMN "brand" SET DEFAULT 'AKSHYN';

UPDATE "Product"
SET "brand" = 'AKSHYN'
WHERE "brand" IN ('BILLION.CO', 'Billion.co', 'Название магазина');

UPDATE "Banner"
SET "title" = 'AKSHYN'
WHERE "slot" = 'hero' AND "title" IN ('BILLION.CO', 'Billion.co', 'Название магазина');

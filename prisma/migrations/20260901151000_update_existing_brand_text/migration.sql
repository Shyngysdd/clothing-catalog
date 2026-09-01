-- Обновляем только прежние значения названия бренда; SKU не затрагиваются.
UPDATE "Product"
SET "brand" = 'Название магазина'
WHERE "brand" IN ('BILLION.CO', 'Billion.co');

UPDATE "Banner"
SET "title" = 'Название магазина'
WHERE "slot" = 'hero' AND "title" IN ('BILLION.CO', 'Billion.co');

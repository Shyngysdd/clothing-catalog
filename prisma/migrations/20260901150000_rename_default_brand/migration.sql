-- Новые товары получают актуальное имя бренда; существующие записи не изменяются.
ALTER TABLE "Product" ALTER COLUMN "brand" SET DEFAULT 'Название магазина';

export type CatalogSize = { size: string; inStock: boolean };
export type CatalogCategory = { id: string; slug: string; nameRu: string; nameEn: string; nameKz: string };

export type CatalogProduct = {
  id: string;
  sku: string;
  name: string;
  brand: string;
  categoryId: string;
  category: CatalogCategory;
  department: string;
  price: number;
  originalPrice: number | null;
  description: string | null;
  composition: string | null;
  care: string[];
  fit: string | null;
  imageColor: string;
  imageUrl: string | null;
  galleryTones: string[];
  galleryUrls: string[];
  colorGroup: string | null;
  color: string | null;
  colorSwatch: string | null;
  sizes: CatalogSize[];
  createdAt: Date | string;
};

export type CatalogLook = {
  id: string;
  title: string;
  description: string | null;
  photoTones: string[];
  photoUrls: string[];
  items: CatalogProduct[];
};

type ProductWithSizes = Omit<CatalogProduct, "sizes"> & { sizes: CatalogSize[] };

export function toCatalogLook(look: {
  id: string;
  title: string;
  description: string | null;
  photoTones: string[];
  photoUrls: string[];
  items: { product: ProductWithSizes }[];
}): CatalogLook {
  return { ...look, items: look.items.map((item) => ({ ...item.product, sizes: item.product.sizes })) };
}

export function getDiscountPercent(product: Pick<CatalogProduct, "price" | "originalPrice">) {
  if (!product.originalPrice || product.originalPrice <= product.price) return null;
  return Math.round((1 - product.price / product.originalPrice) * 100);
}

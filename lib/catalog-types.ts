export type CatalogSize = { size: string; inStock: boolean };

export type CatalogProduct = {
  id: string;
  sku: string;
  name: string;
  category: string;
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
  sizes: CatalogSize[];
  createdAt: Date | string;
};

export type CatalogLook = {
  id: string;
  title: string;
  description: string | null;
  photoTones: string[];
  items: CatalogProduct[];
};

type ProductWithSizes = Omit<CatalogProduct, "sizes"> & { sizes: CatalogSize[] };

export function toCatalogLook(look: {
  id: string;
  title: string;
  description: string | null;
  photoTones: string[];
  items: { product: ProductWithSizes }[];
}): CatalogLook {
  return { ...look, items: look.items.map((item) => ({ ...item.product, sizes: item.product.sizes })) };
}

export function getDiscountPercent(product: Pick<CatalogProduct, "price" | "originalPrice">) {
  if (!product.originalPrice || product.originalPrice <= product.price) return null;
  return Math.round((1 - product.price / product.originalPrice) * 100);
}

import { getLocalizedField } from "@/lib/localized";

export type CatalogSize = { size: string; inStock: boolean };
export type CatalogCategory = { id: string; slug: string; nameRu: string; nameEn: string; nameKz: string };

export type CatalogProduct = {
  id: string;
  sku: string;
  name: string;
  nameRu: string;
  nameEn: string | null;
  nameKz: string | null;
  brand: string;
  categoryId: string;
  category: CatalogCategory;
  department: string;
  price: number;
  originalPrice: number | null;
  description: string | null;
  descriptionRu: string;
  descriptionEn: string | null;
  descriptionKz: string | null;
  composition: string | null;
  compositionRu: string;
  compositionEn: string | null;
  compositionKz: string | null;
  care: string[];
  fit: string | null;
  fitRu: string;
  fitEn: string | null;
  fitKz: string | null;
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
  titleRu: string;
  titleEn: string | null;
  titleKz: string | null;
  description: string | null;
  descriptionRu: string;
  descriptionEn: string | null;
  descriptionKz: string | null;
  photoTones: string[];
  photoUrls: string[];
  items: CatalogProduct[];
};

type ProductWithSizes = Omit<CatalogProduct, "sizes"> & { sizes: CatalogSize[] };

type LocalizedProductSource = Omit<CatalogProduct, "name" | "description" | "composition" | "fit">;

export function toCatalogProduct(product: LocalizedProductSource, locale: string): CatalogProduct {
  return {
    ...product,
    name: getLocalizedField(product, "name", locale),
    description: getLocalizedField(product, "description", locale),
    composition: getLocalizedField(product, "composition", locale),
    fit: getLocalizedField(product, "fit", locale),
  };
}

export function toCatalogLook(look: {
  id: string;
  titleRu: string;
  titleEn: string | null;
  titleKz: string | null;
  descriptionRu: string;
  descriptionEn: string | null;
  descriptionKz: string | null;
  photoTones: string[];
  photoUrls: string[];
  items: { product: Omit<ProductWithSizes, "name" | "description" | "composition" | "fit"> }[];
}, locale: string): CatalogLook {
  return {
    ...look,
    title: getLocalizedField(look, "title", locale),
    description: getLocalizedField(look, "description", locale),
    items: look.items.map((item) => toCatalogProduct(item.product, locale)),
  };
}

export function getDiscountPercent(product: Pick<CatalogProduct, "price" | "originalPrice">) {
  if (!product.originalPrice || product.originalPrice <= product.price) return null;
  return Math.round((1 - product.price / product.originalPrice) * 100);
}

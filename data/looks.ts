import { products } from "./products";

export type Look = {
  id: number;
  title: string;
  description: string;
  productIds: number[];
  photoPlaceholders: string[];
  totalPrice: number;
};

const lookDetails: Omit<Look, "totalPrice">[] = [
  {
    id: 1,
    title: "Городской минимализм",
    description: "Собранный силуэт на каждый день: фактурная куртка, мягкие брюки и лаконичные ботинки.",
    productIds: [2, 3, 8],
    photoPlaceholders: ["accent", "ink", "gold"],
  },
  {
    id: 2,
    title: "Свободный ритм",
    description: "Комфортный образ для насыщенного дня без лишних деталей.",
    productIds: [1, 3, 6],
    photoPlaceholders: ["gold", "accent", "paper"],
  },
  {
    id: 3,
    title: "Мягкая классика",
    description: "Спокойная палитра и выразительные фактуры для встреч и прогулок.",
    productIds: [4, 5, 7],
    photoPlaceholders: ["paper", "gold", "accent"],
  },
  {
    id: 4,
    title: "Нейтральный день",
    description: "Базовые оттенки, которые легко адаптировать под любой план.",
    productIds: [1, 4, 7],
    photoPlaceholders: ["ink", "paper", "gold"],
  },
  {
    id: 5,
    title: "Вечер в городе",
    description: "Контрастный комплект с мягким акцентом и удобной городской обувью.",
    productIds: [2, 5, 6],
    photoPlaceholders: ["accent", "gold", "ink"],
  },
];

export const looks: Look[] = lookDetails.map((look) => ({
  ...look,
  totalPrice: look.productIds.reduce((total, productId) => {
    const product = products.find((item) => item.id === productId);
    return total + (product?.price ?? 0);
  }, 0),
}));

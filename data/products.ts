export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  sizes: string[];
  imageColor: string;
};

export const products: Product[] = [
  { id: 1, name: "Худи оверсайз", category: "Одежда", price: 24900, sizes: ["S", "M", "L", "XL"], imageColor: "#D9D6D0" },
  { id: 2, name: "Куртка-косуха", category: "Одежда", price: 58900, sizes: ["S", "M", "L"], imageColor: "#242424" },
  { id: 3, name: "Трикотажные брюки", category: "Одежда", price: 19900, sizes: ["S", "M", "L", "XL"], imageColor: "#A6B0A1" },
  { id: 4, name: "Льняная рубашка", category: "Одежда", price: 21900, sizes: ["S", "M", "L"], imageColor: "#EFE9DE" },
  { id: 5, name: "Платье миди", category: "Одежда", price: 32900, sizes: ["XS", "S", "M", "L"], imageColor: "#B88A87" },
  { id: 6, name: "Кроссовки City", category: "Обувь", price: 42900, sizes: ["36", "37", "38", "39", "40"], imageColor: "#F4F4F2" },
  { id: 7, name: "Лоферы классик", category: "Обувь", price: 36900, sizes: ["36", "37", "38", "39"], imageColor: "#5A4034" },
  { id: 8, name: "Ботинки челси", category: "Обувь", price: 47900, sizes: ["40", "41", "42", "43", "44"], imageColor: "#303336" },
];

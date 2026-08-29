import { products } from "@/data/products";
import { CatalogClient } from "./catalog-client";

export default function CatalogPage() {
  return <CatalogClient products={products} />;
}

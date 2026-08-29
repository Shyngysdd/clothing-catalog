import { looks } from "@/data/looks";
import { products } from "@/data/products";
import { LooksClient } from "./looks-client";

export default function LooksPage() {
  return <LooksClient looks={looks} products={products} />;
}

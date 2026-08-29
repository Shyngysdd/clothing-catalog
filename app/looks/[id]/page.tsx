import { notFound } from "next/navigation";
import { looks } from "@/data/looks";
import { products } from "@/data/products";
import { LookDetailClient } from "./look-detail-client";

export function generateStaticParams() {
  return looks.map((look) => ({ id: String(look.id) }));
}

export default async function LookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const look = looks.find((item) => item.id === Number(id));

  if (!look) notFound();

  return <LookDetailClient look={look} products={products} />;
}

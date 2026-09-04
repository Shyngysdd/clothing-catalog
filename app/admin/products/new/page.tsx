import Link from "next/link";
import { createProduct } from "../actions";
import { ProductForm } from "../product-form";
import { prisma } from "@/lib/prisma";

export default async function NewProductPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const [colorGroups, categories] = await Promise.all([
    prisma.product.findMany({ distinct: ["colorGroup"], select: { colorGroup: true }, orderBy: { colorGroup: "asc" } }),
    prisma.category.findMany({ orderBy: { nameRu: "asc" } }),
  ]);
  const colorGroupOptions = colorGroups.flatMap((product) => product.colorGroup ? [product.colorGroup] : []);
  return <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16"><Link href="/admin/products" className="font-mono-price text-xs tracking-[0.1em] text-[color:var(--accent)]">← ВСЕ ТОВАРЫ</Link><h1 className="font-display mt-5 text-5xl leading-none tracking-[-0.04em] sm:text-7xl">Новый товар</h1>{error ? <p className="mt-6 border border-[color:var(--accent)]/35 bg-[color:var(--accent)]/5 p-3 text-sm text-[color:var(--accent)]">{error}</p> : null}<ProductForm action={createProduct} colorGroupOptions={colorGroupOptions} categories={categories} /></main>;
}

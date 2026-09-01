import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateProduct } from "../actions";
import { ProductForm } from "../product-form";

export default async function EditProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { id } = await params;
  const { error, saved } = await searchParams;
  const [product, colorGroupOptions] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { sizes: { orderBy: { size: "asc" } } } }),
    prisma.product.findMany({ distinct: ["colorGroup"], select: { colorGroup: true }, orderBy: { colorGroup: "asc" } }),
  ]);
  if (!product) notFound();
  return <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16"><Link href="/admin/products" className="font-mono-price text-xs tracking-[0.1em] text-[color:var(--accent)]">← ВСЕ ТОВАРЫ</Link><h1 className="font-display mt-5 text-5xl leading-none tracking-[-0.04em] sm:text-7xl">Редактирование</h1><p className="mt-3 text-[color:var(--ink)]/65">{product.name}</p>{error ? <p className="mt-6 border border-[color:var(--accent)]/35 bg-[color:var(--accent)]/5 p-3 text-sm text-[color:var(--accent)]">{error}</p> : null}{saved ? <p className="mt-6 border border-[color:var(--gold)]/60 bg-[color:var(--gold)]/10 p-3 text-sm">Изменения сохранены.</p> : null}<ProductForm product={product} action={updateProduct.bind(null, id)} colorGroupOptions={colorGroupOptions.flatMap((item) => item.colorGroup ? [item.colorGroup] : [])} /></main>;
}

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createHomeSection } from "../actions";
import { HomeSectionForm } from "../home-section-form";

export default async function NewHomeSectionPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const [products, categories] = await Promise.all([prisma.product.findMany({ select: { id: true, nameRu: true, price: true }, orderBy: { nameRu: "asc" } }), prisma.category.findMany({ select: { slug: true, nameRu: true }, orderBy: { nameRu: "asc" } })]);
  return <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16"><Link href="/admin/home-sections" className="font-mono-price text-xs tracking-[0.1em] text-[color:var(--accent)]">← ВСЕ РАЗДЕЛЫ</Link><h1 className="font-display mt-5 text-5xl leading-none tracking-[-0.04em] sm:text-7xl">Новый раздел</h1>{error ? <p className="mt-6 border border-[color:var(--accent)]/35 bg-[color:var(--accent)]/5 p-3 text-sm text-[color:var(--accent)]">{error}</p> : null}<HomeSectionForm products={products} categories={categories} action={createHomeSection} /></main>;
}

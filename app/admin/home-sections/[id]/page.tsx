import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateHomeSection } from "../actions";
import { HomeSectionForm } from "../home-section-form";

export default async function EditHomeSectionPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string }> }) {
  const [{ id }, { error, saved }] = await Promise.all([params, searchParams]);
  const [section, products, categories] = await Promise.all([prisma.homeSection.findUnique({ where: { id } }), prisma.product.findMany({ select: { id: true, nameRu: true, price: true }, orderBy: { nameRu: "asc" } }), prisma.category.findMany({ select: { slug: true, nameRu: true }, orderBy: { nameRu: "asc" } })]);
  if (!section) notFound();
  return <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16"><Link href="/admin/home-sections" className="font-mono-price text-xs tracking-[0.1em] text-[color:var(--accent)]">← ВСЕ РАЗДЕЛЫ</Link><h1 className="font-display mt-5 text-5xl leading-none tracking-[-0.04em] sm:text-7xl">Редактирование</h1><p className="mt-3 text-[color:var(--ink)]/65">{section.titleRu}</p>{error ? <p className="mt-6 border border-[color:var(--accent)]/35 bg-[color:var(--accent)]/5 p-3 text-sm text-[color:var(--accent)]">{error}</p> : null}{saved ? <p className="mt-6 border border-[color:var(--gold)]/60 bg-[color:var(--gold)]/10 p-3 text-sm">Изменения сохранены.</p> : null}<HomeSectionForm section={section} products={products} categories={categories} action={updateHomeSection.bind(null, id)} /></main>;
}


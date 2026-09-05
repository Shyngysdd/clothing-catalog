import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateLook } from "../actions";
import { LookForm } from "../look-form";

export default async function EditLookPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { id } = await params;
  const { error, saved } = await searchParams;
  const [look, products] = await Promise.all([prisma.look.findUnique({ where: { id }, include: { items: true } }), prisma.product.findMany({ select: { id: true, nameRu: true, price: true, imageColor: true, imageUrl: true }, orderBy: { nameRu: "asc" } })]);
  if (!look) notFound();
  return <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16"><Link href="/admin/looks" className="font-mono-price text-xs tracking-[0.1em] text-[color:var(--accent)]">← ВСЕ ОБРАЗЫ</Link><h1 className="font-display mt-5 text-5xl leading-none tracking-[-0.04em] sm:text-7xl">Редактирование</h1><p className="mt-3 text-[color:var(--ink)]/65">{look.titleRu}</p>{error ? <p className="mt-6 border border-[color:var(--accent)]/35 bg-[color:var(--accent)]/5 p-3 text-sm text-[color:var(--accent)]">{error}</p> : null}{saved ? <p className="mt-6 border border-[color:var(--gold)]/60 bg-[color:var(--gold)]/10 p-3 text-sm">Изменения сохранены.</p> : null}<LookForm look={look} products={products} action={updateLook.bind(null, id)} /></main>;
}


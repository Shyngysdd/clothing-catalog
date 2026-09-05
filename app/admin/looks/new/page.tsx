import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createLook } from "../actions";
import { LookForm } from "../look-form";

export default async function NewLookPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const products = await prisma.product.findMany({ select: { id: true, nameRu: true, price: true, imageColor: true, imageUrl: true }, orderBy: { nameRu: "asc" } });
  return <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16"><Link href="/admin/looks" className="font-mono-price text-xs tracking-[0.1em] text-[color:var(--accent)]">← ВСЕ ОБРАЗЫ</Link><h1 className="font-display mt-5 text-5xl leading-none tracking-[-0.04em] sm:text-7xl">Новый образ</h1>{error ? <p className="mt-6 border border-[color:var(--accent)]/35 bg-[color:var(--accent)]/5 p-3 text-sm text-[color:var(--accent)]">{error}</p> : null}<LookForm products={products} action={createLook} /></main>;
}

"use client";

import { useMemo, useState } from "react";

type ProductOption = { id: string; name: string; price: number; imageColor: string };
type EditableLook = { title: string; description: string | null; photoTones: string[]; items: { productId: string }[] };

const toneOptions = ["accent", "gold", "ink", "paper"];
const formatPrice = new Intl.NumberFormat("ru-KZ");

export function LookForm({ look, products, action }: { look?: EditableLook; products: ProductOption[]; action: (formData: FormData) => void | Promise<void> }) {
  const [tones, setTones] = useState(look?.photoTones ?? ["accent", "ink"]);
  const [selectedIds, setSelectedIds] = useState(look?.items.map((item) => item.productId) ?? []);
  const [search, setSearch] = useState("");
  const visibleProducts = useMemo(() => products.filter((product) => product.name.toLowerCase().includes(search.toLowerCase())), [products, search]);
  const selectedProducts = products.filter((product) => selectedIds.includes(product.id));
  const totalPrice = selectedProducts.reduce((sum, product) => sum + product.price, 0);

  function toggleProduct(id: string) { setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); }
  function toggleTone(tone: string) { setTones((current) => current.includes(tone) ? current.filter((item) => item !== tone) : [...current, tone]); }

  return <form action={action} className="mt-8 space-y-8">
    <section className="space-y-5"><label className="block">Название<input name="title" required defaultValue={look?.title} className="mt-1 min-h-11 w-full border border-[color:var(--ink)]/25 px-3 text-sm outline-none focus:border-[color:var(--ink)]" /></label><label className="block">Описание<textarea name="description" defaultValue={look?.description ?? ""} className="mt-1 min-h-28 w-full border border-[color:var(--ink)]/25 px-3 py-3 text-sm outline-none focus:border-[color:var(--ink)]" /></label></section>
    <section><h2 className="font-display text-3xl leading-none">Кадры образа</h2><div className="mt-4 flex flex-wrap gap-2">{toneOptions.map((tone) => <label key={tone} className="cursor-pointer"><input type="checkbox" name="photoTones" value={tone} checked={tones.includes(tone)} onChange={() => toggleTone(tone)} className="peer sr-only" /><span className="inline-flex min-h-10 items-center border border-[color:var(--ink)]/25 px-3 text-sm peer-checked:border-[color:var(--ink)] peer-checked:bg-[color:var(--ink)] peer-checked:text-[color:var(--white)]">{tone}</span></label>)}</div></section>
    <section><div className="flex items-end justify-between gap-4"><h2 className="font-display text-3xl leading-none">Состав</h2><p className="font-mono-price text-lg">{formatPrice.format(totalPrice)} ₸</p></div><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Поиск по названию" className="mt-5 min-h-11 w-full border border-[color:var(--ink)]/25 px-3 text-sm outline-none focus:border-[color:var(--ink)]" /><div className="mt-3 max-h-80 divide-y divide-[color:var(--ink)]/10 overflow-y-auto border border-[color:var(--ink)]/15">{visibleProducts.map((product) => <label key={product.id} className="flex cursor-pointer items-center gap-3 px-3 py-3 hover:bg-[color:var(--paper)]"><input type="checkbox" name="productIds" value={product.id} checked={selectedIds.includes(product.id)} onChange={() => toggleProduct(product.id)} className="size-4 accent-[color:var(--accent)]" /><span className="size-8 shrink-0 border border-[color:var(--ink)]/10" style={{ backgroundColor: product.imageColor }} /><span className="min-w-0 flex-1 truncate text-sm">{product.name}</span><span className="font-mono-price text-xs">{formatPrice.format(product.price)} ₸</span></label>)}</div><p className="mt-3 text-sm text-[color:var(--ink)]/60">Выбрано товаров: {selectedProducts.length}</p></section>
    <button type="submit" className="flex min-h-12 w-full items-center justify-center bg-[color:var(--ink)] px-5 text-sm font-medium text-[color:var(--white)] hover:bg-[color:var(--accent)]">Сохранить образ</button>
  </form>;
}

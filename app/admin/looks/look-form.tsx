"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import { upload } from "@vercel/blob/client";

type ProductOption = { id: string; name: string; price: number; imageColor: string; imageUrl: string | null };
type EditableLook = { title: string; description: string | null; photoTones: string[]; photoUrls: string[]; items: { productId: string }[] };

const toneOptions = ["accent", "gold", "ink", "paper"];
const formatPrice = new Intl.NumberFormat("ru-KZ");

export function LookForm({ look, products, action }: { look?: EditableLook; products: ProductOption[]; action: (formData: FormData) => void | Promise<void> }) {
  const [tones, setTones] = useState(look?.photoTones ?? ["accent", "ink"]);
  const [selectedIds, setSelectedIds] = useState(look?.items.map((item) => item.productId) ?? []);
  const [search, setSearch] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const visibleProducts = useMemo(() => products.filter((product) => product.name.toLowerCase().includes(search.toLowerCase())), [products, search]);
  const selectedProducts = products.filter((product) => selectedIds.includes(product.id));
  const totalPrice = selectedProducts.reduce((sum, product) => sum + product.price, 0);

  function toggleProduct(id: string) { setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); }
  function toggleTone(tone: string) { setTones((current) => current.includes(tone) ? current.filter((item) => item !== tone) : [...current, tone]); }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const files = formData.getAll("lookPhotoFile").filter((file): file is File => file instanceof File && file.size > 0);
    const invalidFile = files.find((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024);
    if (invalidFile) { setUploadError("Поддерживаются JPG, PNG и WebP размером до 5 МБ."); return; }
    setUploadError("");
    try {
      if (files.length) {
        setIsUploading(true);
        for (const file of files) {
          const blob = await upload(`looks/${crypto.randomUUID()}-${file.name}`, file, { access: "public", contentType: file.type, handleUploadUrl: "/api/upload-zip-token", multipart: true });
          const response = await fetch("/api/normalize-image", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ blobUrl: blob.url, kind: "look" }) });
          const result = await response.json().catch(() => null) as { url?: unknown; error?: unknown } | null;
          if (!response.ok || typeof result?.url !== "string") throw new Error(typeof result?.error === "string" ? result.error : "Не удалось обработать фото образа.");
          formData.append("lookPhotoUrl", result.url);
        }
      }
      formData.delete("lookPhotoFile");
      await action(formData);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Не удалось загрузить фото образа.");
    } finally { setIsUploading(false); }
  }

  return <form onSubmit={submit} className="mt-8 space-y-8">
    <section className="space-y-5"><label className="block">Название<input name="title" required defaultValue={look?.title} className="mt-1 min-h-11 w-full border border-[color:var(--border)] px-3 text-sm outline-none focus:border-[color:var(--ink)]" /></label><label className="block">Описание<textarea name="description" defaultValue={look?.description ?? ""} className="mt-1 min-h-28 w-full border border-[color:var(--border)] px-3 py-3 text-sm outline-none focus:border-[color:var(--ink)]" /></label></section>
    <section><h2 className="font-display text-3xl leading-none">Кадры образа</h2><div className="mt-4 flex flex-wrap gap-2">{toneOptions.map((tone) => <label key={tone} className="cursor-pointer"><input type="checkbox" name="photoTones" value={tone} checked={tones.includes(tone)} onChange={() => toggleTone(tone)} className="peer sr-only" /><span className="inline-flex min-h-10 items-center border border-[color:var(--border)] px-3 text-sm peer-checked:border-[color:var(--ink)] peer-checked:bg-[color:var(--ink)] peer-checked:text-[color:var(--white)]">{tone}</span></label>)}</div><label className="mt-5 block text-sm font-medium">Фото образа<input name="lookPhotoFile" type="file" multiple accept="image/jpeg,image/png,image/webp" className="mt-2 block min-h-11 w-full cursor-pointer border border-[color:var(--border)] px-3 py-2 text-sm" /><span className="mt-2 block text-xs font-normal text-[color:var(--ink)]/55">Можно выбрать несколько фото. Они будут показаны в галерее вместо кадров-заглушек.</span></label>{look?.photoUrls.length ? <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{look.photoUrls.map((photoUrl, index) => <label key={photoUrl} className="border border-[color:var(--border)] p-2"><span className="relative block aspect-[3/4] overflow-hidden"><Image src={photoUrl} alt={`Фото образа ${index + 1}`} fill sizes="160px" className="object-cover" /></span><span className="mt-2 flex items-center gap-2 text-xs"><input type="checkbox" name="removeLookPhoto" value={photoUrl} className="accent-[color:var(--accent)]" />Удалить</span></label>)}</div> : null}{uploadError ? <p className="mt-3 text-sm text-[color:var(--accent)]">{uploadError}</p> : null}</section>
    <section><div className="flex items-end justify-between gap-4"><h2 className="font-display text-3xl leading-none">Состав</h2><p className="font-mono-price text-lg">{formatPrice.format(totalPrice)} ₸</p></div><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Поиск по названию" className="mt-5 min-h-11 w-full border border-[color:var(--border)] px-3 text-sm outline-none focus:border-[color:var(--ink)]" /><div className="mt-3 max-h-80 divide-y divide-[color:var(--ink)]/10 overflow-y-auto border border-[color:var(--border)]">{visibleProducts.map((product) => <label key={product.id} className="flex cursor-pointer items-center gap-3 px-3 py-3 hover:bg-[color:var(--paper)]"><input type="checkbox" name="productIds" value={product.id} checked={selectedIds.includes(product.id)} onChange={() => toggleProduct(product.id)} className="size-4 accent-[color:var(--accent)]" />{product.imageUrl ? <span className="relative size-8 shrink-0 overflow-hidden border border-[color:var(--border)]"><Image src={product.imageUrl} alt="" fill sizes="32px" className="object-cover" /></span> : <span className="size-8 shrink-0 border border-[color:var(--border)]" style={{ backgroundColor: product.imageColor }} />}<span className="min-w-0 flex-1 truncate text-sm">{product.name}</span><span className="font-mono-price text-xs">{formatPrice.format(product.price)} ₸</span></label>)}</div><p className="mt-3 text-sm text-[color:var(--ink)]/60">Выбрано товаров: {selectedProducts.length}</p></section>
    <button type="submit" disabled={isUploading} className="flex min-h-12 w-full items-center justify-center bg-[color:var(--ink)] px-5 text-sm font-medium text-[color:var(--white)] hover:bg-[color:var(--accent)] disabled:cursor-wait disabled:opacity-60">{isUploading ? "Загружаем фото…" : "Сохранить образ"}</button>
  </form>;
}

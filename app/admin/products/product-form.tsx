"use client";

import { upload } from "@vercel/blob/client";
import { FormEvent, useState } from "react";
import Image from "next/image";
import { BRAND_CONFIG } from "@/lib/brand-config";
import { AdminLocaleTabs, OPTIONAL_TRANSLATION_PLACEHOLDER } from "@/components/admin-locale-tabs";
import { createCategoryFromAdmin } from "./actions";

type CategoryOption = { id: string; slug: string; nameRu: string; nameEn: string; nameKz: string };

type EditableProduct = {
  nameRu: string; nameEn: string | null; nameKz: string | null; brand: string; sku: string; categoryId: string; category: CategoryOption; department: string; price: number; originalPrice: number | null;
  descriptionRu: string; descriptionEn: string | null; descriptionKz: string | null; compositionRu: string; compositionEn: string | null; compositionKz: string | null; fitRu: string; fitEn: string | null; fitKz: string | null; care: string[];
  imageColor: string; colorGroup: string | null; color: string | null; colorSwatch: string | null; imageUrl: string | null; galleryTones: string[]; galleryUrls: string[]; sizes: { size: string; inStock: boolean }[];
};

const toneOptions = ["accent", "gold", "ink", "paper"];
const inputClass = "mt-1 min-h-11 w-full border border-[color:var(--border)] bg-transparent px-3 text-sm outline-none focus:border-[color:var(--ink)]";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export function ProductForm({ product, action, colorGroupOptions, categories: initialCategories }: { product?: EditableProduct; action: (formData: FormData) => void | Promise<void>; colorGroupOptions: string[]; categories: CategoryOption[] }) {
  const [care, setCare] = useState(product?.care.length ? product.care : [""]);
  const [sizes, setSizes] = useState(product?.sizes.length ? product.sizes : [{ size: "", inStock: true }]);
  const [imageColor, setImageColor] = useState(product?.imageColor ?? "#17181C");
  const [colorSwatch, setColorSwatch] = useState(product?.colorSwatch ?? "#17181C");
  const [tones, setTones] = useState(product?.galleryTones ?? ["accent", "ink"]);
  const [isUploading, setIsUploading] = useState(false);
  const [isNormalizing, setIsNormalizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [categories, setCategories] = useState(initialCategories);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [categoryDraft, setCategoryDraft] = useState({ nameRu: "", nameEn: "", nameKz: "" });
  const [selectedCategoryId, setSelectedCategoryId] = useState(product?.categoryId ?? initialCategories[0]?.id ?? "");
  const [categoryError, setCategoryError] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  async function addCategory() {
    setIsCreatingCategory(true);
    setCategoryError("");
    const result = await createCategoryFromAdmin(categoryDraft);
    setIsCreatingCategory(false);
    if ("error" in result) {
      setCategoryError(result.error ?? "Не удалось создать категорию.");
      return;
    }
    setCategories((current) => [...current, result.category].sort((first, second) => first.nameRu.localeCompare(second.nameRu, "ru")));
    setSelectedCategoryId(result.category.id);
    setCategoryDraft({ nameRu: "", nameEn: "", nameKz: "" });
    setIsCategoryFormOpen(false);
  }

  function toggleTone(tone: string) {
    setTones((current) => current.includes(tone) ? current.filter((item) => item !== tone) : [...current, tone]);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const main = formData.get("mainImageFile");
    const gallery = formData.getAll("galleryImageFile").filter((file): file is File => file instanceof File && file.size > 0);
    const files = [...(main instanceof File && main.size > 0 ? [main] : []), ...gallery];
    const invalidFile = files.find((file) => !allowedImageTypes.has(file.type) || file.size > MAX_IMAGE_SIZE);
    if (invalidFile) {
      setUploadError("Поддерживаются JPG, PNG и WebP размером до 5 МБ.");
      return;
    }

    setUploadError("");
    try {
      if (files.length) {
        let completedBytes = 0;
        const totalBytes = files.reduce((total, file) => total + file.size, 0);
        setIsUploading(true);
        setUploadProgress(0);
        const uploadFile = async (file: File) => {
          const blob = await upload(`product-images/${crypto.randomUUID()}-${file.name}`, file, {
            access: "public",
            contentType: file.type,
            handleUploadUrl: "/api/upload-zip-token",
            multipart: true,
            onUploadProgress: ({ percentage }) => setUploadProgress(Math.round(((completedBytes + file.size * percentage / 100) / totalBytes) * 100)),
          });
          completedBytes += file.size;
          setIsNormalizing(true);
          try {
            const response = await fetch("/api/normalize-image", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ blobUrl: blob.url, kind: "product" }),
            });
            const result = await response.json().catch(() => null) as { error?: unknown; url?: unknown } | null;
            if (!response.ok || typeof result?.url !== "string") {
              throw new Error(typeof result?.error === "string" ? result.error : "Не удалось обработать изображение.");
            }
            return result.url;
          } finally {
            setIsNormalizing(false);
          }
        };
        if (main instanceof File && main.size > 0) formData.set("mainImageUrl", await uploadFile(main));
        for (const file of gallery) formData.append("galleryImageUrl", await uploadFile(file));
      }
      formData.delete("mainImageFile");
      formData.delete("galleryImageFile");
      setIsUploading(false);
      setIsSaving(true);
      await action(formData);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Не удалось загрузить изображения.");
    } finally {
      setIsUploading(false);
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-8">
      <section>
        <h2 className="font-display text-3xl leading-none">Тексты товара</h2>
        <div className="mt-4">
          <AdminLocaleTabs panels={{
            ru: <div className="grid gap-5"><label>Название <span className="font-mono-price text-[10px] text-[color:var(--accent)]">ОБЯЗАТЕЛЬНО</span><input name="nameRu" required defaultValue={product?.nameRu} className={inputClass} /></label><label>Описание <span className="font-mono-price text-[10px] text-[color:var(--accent)]">ОБЯЗАТЕЛЬНО</span><textarea name="descriptionRu" required defaultValue={product?.descriptionRu ?? ""} className={`${inputClass} min-h-28 py-3`} /></label><label>Состав <span className="font-mono-price text-[10px] text-[color:var(--accent)]">ОБЯЗАТЕЛЬНО</span><textarea name="compositionRu" required defaultValue={product?.compositionRu ?? ""} className={`${inputClass} min-h-20 py-3`} /></label><label>Посадка <span className="font-mono-price text-[10px] text-[color:var(--accent)]">ОБЯЗАТЕЛЬНО</span><input name="fitRu" required defaultValue={product?.fitRu ?? ""} className={inputClass} /></label></div>,
            en: <div className="grid gap-5"><label>Название<input name="nameEn" defaultValue={product?.nameEn ?? ""} placeholder={OPTIONAL_TRANSLATION_PLACEHOLDER} className={inputClass} /></label><label>Описание<textarea name="descriptionEn" defaultValue={product?.descriptionEn ?? ""} placeholder={OPTIONAL_TRANSLATION_PLACEHOLDER} className={`${inputClass} min-h-28 py-3`} /></label><label>Состав<textarea name="compositionEn" defaultValue={product?.compositionEn ?? ""} placeholder={OPTIONAL_TRANSLATION_PLACEHOLDER} className={`${inputClass} min-h-20 py-3`} /></label><label>Посадка<input name="fitEn" defaultValue={product?.fitEn ?? ""} placeholder={OPTIONAL_TRANSLATION_PLACEHOLDER} className={inputClass} /></label></div>,
            kz: <div className="grid gap-5"><label>Название<input name="nameKz" defaultValue={product?.nameKz ?? ""} placeholder={OPTIONAL_TRANSLATION_PLACEHOLDER} className={inputClass} /></label><label>Описание<textarea name="descriptionKz" defaultValue={product?.descriptionKz ?? ""} placeholder={OPTIONAL_TRANSLATION_PLACEHOLDER} className={`${inputClass} min-h-28 py-3`} /></label><label>Состав<textarea name="compositionKz" defaultValue={product?.compositionKz ?? ""} placeholder={OPTIONAL_TRANSLATION_PLACEHOLDER} className={`${inputClass} min-h-20 py-3`} /></label><label>Посадка<input name="fitKz" defaultValue={product?.fitKz ?? ""} placeholder={OPTIONAL_TRANSLATION_PLACEHOLDER} className={inputClass} /></label></div>,
          }} />
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2">
        <label>Бренд <span className="text-[color:var(--ink)]/50">(необязательно)</span><input name="brand" defaultValue={product?.brand ?? BRAND_CONFIG.name} className={inputClass} /></label>
        <label>Артикул<input name="sku" required defaultValue={product?.sku} className={inputClass} /></label>
        <div><label>Категория<select name="categoryId" required value={selectedCategoryId} onChange={(event) => setSelectedCategoryId(event.target.value)} className={inputClass}><option value="" disabled>Выберите категорию</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.nameRu}</option>)}</select></label><button type="button" onClick={() => setIsCategoryFormOpen((open) => !open)} className="mt-2 text-sm text-[color:var(--accent)] underline underline-offset-4">Добавить новую категорию</button></div>
        {isCategoryFormOpen ? <div className="grid gap-3 border border-[color:var(--border)] p-4 sm:col-span-2 sm:grid-cols-3"><label className="text-sm">Название RU<input value={categoryDraft.nameRu} onChange={(event) => setCategoryDraft((current) => ({ ...current, nameRu: event.target.value }))} className={inputClass} /></label><label className="text-sm">Название EN<input value={categoryDraft.nameEn} onChange={(event) => setCategoryDraft((current) => ({ ...current, nameEn: event.target.value }))} className={inputClass} /></label><label className="text-sm">Название KZ<input value={categoryDraft.nameKz} onChange={(event) => setCategoryDraft((current) => ({ ...current, nameKz: event.target.value }))} className={inputClass} /></label>{categoryError ? <p className="text-sm text-[color:var(--accent)] sm:col-span-3">{categoryError}</p> : null}<div className="flex gap-3 sm:col-span-3"><button type="button" disabled={isCreatingCategory} onClick={addCategory} className="min-h-10 bg-[color:var(--ink)] px-4 text-sm text-[color:var(--white)] disabled:opacity-50">{isCreatingCategory ? "Добавляем…" : "Сохранить категорию"}</button><button type="button" onClick={() => setIsCategoryFormOpen(false)} className="min-h-10 px-4 text-sm underline">Отмена</button></div></div> : null}
        <label>Отдел<select name="department" defaultValue={product?.department ?? "unisex"} className={inputClass}><option value="unisex">Унисекс</option><option value="men">Мужское</option><option value="women">Женское</option></select></label>
        <label>Цена, ₸<input name="price" required min="1" step="1" type="number" defaultValue={product?.price} className={inputClass} /></label>
        <label>Старая цена, ₸<input name="originalPrice" min="1" step="1" type="number" defaultValue={product?.originalPrice ?? ""} className={inputClass} /></label>
        <label>Группа расцветок <span className="text-[color:var(--ink)]/50">(необязательно)</span><input name="colorGroup" list="color-group-options" defaultValue={product?.colorGroup ?? ""} placeholder="Например, storm-jacket" className={inputClass} /></label>
        <label>Название цвета <span className="text-[color:var(--ink)]/50">(необязательно)</span><input name="color" defaultValue={product?.color ?? ""} placeholder="Например, Оливковый" className={inputClass} /></label>
        <datalist id="color-group-options">{colorGroupOptions.map((colorGroup) => <option key={colorGroup} value={colorGroup} />)}</datalist>
      </section>

      <section><h2 className="font-display text-3xl leading-none">Уход</h2><div className="mt-4 space-y-3">{care.map((item, index) => <div key={index} className="flex gap-2"><input name="care" defaultValue={item} className={inputClass.replace("mt-1 ", "")} /><button type="button" onClick={() => setCare((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="min-h-11 px-3 text-sm text-[color:var(--accent)]">Убрать</button></div>)}</div><button type="button" onClick={() => setCare((current) => [...current, ""])} className="mt-3 text-sm underline underline-offset-4">Добавить рекомендацию</button></section>

      <section><h2 className="font-display text-3xl leading-none">Визуал</h2><div className="mt-4 grid gap-5 sm:grid-cols-2"><label>Цвет-заглушка<div className="mt-1 flex gap-3"><input type="color" value={imageColor} onChange={(event) => setImageColor(event.target.value)} className="size-11 border border-[color:var(--border)] p-1" /><input name="imageColor" value={imageColor} onChange={(event) => setImageColor(event.target.value)} className="min-h-11 flex-1 border border-[color:var(--border)] px-3 text-sm uppercase outline-none focus:border-[color:var(--ink)]" /></div></label><label>Свотч цвета <span className="text-[color:var(--ink)]/50">(необязательно)</span><div className="mt-1 flex gap-3"><input type="color" value={colorSwatch} onChange={(event) => setColorSwatch(event.target.value)} className="size-11 border border-[color:var(--border)] p-1" /><input name="colorSwatch" value={colorSwatch} onChange={(event) => setColorSwatch(event.target.value)} className="min-h-11 flex-1 border border-[color:var(--border)] px-3 text-sm uppercase outline-none focus:border-[color:var(--ink)]" /></div></label><fieldset><legend>Кадры-заглушки</legend><div className="mt-3 flex flex-wrap gap-2">{toneOptions.map((tone) => <label key={tone} className="cursor-pointer"><input type="checkbox" name="galleryTones" value={tone} checked={tones.includes(tone)} onChange={() => toggleTone(tone)} className="peer sr-only" /><span className="inline-flex min-h-10 items-center border border-[color:var(--border)] px-3 text-sm peer-checked:border-[color:var(--ink)] peer-checked:bg-[color:var(--ink)] peer-checked:text-[color:var(--white)]">{tone}</span></label>)}</div></fieldset><label className="sm:col-span-2">Главное фото<input name="mainImageFile" type="file" accept="image/jpeg,image/png,image/webp" className={`${inputClass} cursor-pointer py-2`} /><span className="mt-2 block text-xs text-[color:var(--ink)]/55">JPG, PNG или WebP, до 5 МБ. Новое фото заменит текущее.</span></label>{product?.imageUrl ? <label className="sm:col-span-2 flex items-center gap-4 border border-[color:var(--border)] p-3"><span className="relative block size-16 shrink-0 overflow-hidden"><Image src={product.imageUrl} alt="Текущее главное фото" fill sizes="64px" className="object-cover" /></span><span className="text-sm"><input type="checkbox" name="removeMainImage" className="mr-2 accent-[color:var(--accent)]" />Удалить главное фото при сохранении</span></label> : null}<label className="sm:col-span-2">Дополнительные фото галереи<input name="galleryImageFile" type="file" multiple accept="image/jpeg,image/png,image/webp" className={`${inputClass} cursor-pointer py-2`} /><span className="mt-2 block text-xs text-[color:var(--ink)]/55">Можно выбрать несколько JPG, PNG или WebP до 5 МБ. Новые фото добавятся к галерее.</span></label>{product?.galleryUrls.length ? <div className="sm:col-span-2 grid grid-cols-2 gap-3 sm:grid-cols-4">{product.galleryUrls.map((imageUrl, index) => <label key={imageUrl} className="cursor-pointer border border-[color:var(--border)] p-2"><span className="relative block aspect-[4/5] overflow-hidden"><Image src={imageUrl} alt={`Фото галереи ${index + 1}`} fill sizes="160px" className="object-cover" /></span><span className="mt-2 flex items-center gap-2 text-xs"><input type="checkbox" name="removeGalleryImage" value={imageUrl} className="accent-[color:var(--accent)]" />Удалить</span></label>)}</div> : null}</div>{uploadError ? <p className="mt-4 text-sm text-[color:var(--accent)]">{uploadError}</p> : null}</section>

      <section><h2 className="font-display text-3xl leading-none">Размеры</h2><div className="mt-4 space-y-3">{sizes.map((item, index) => <div key={index} className="flex items-center gap-3"><input name="size" value={item.size} onChange={(event) => setSizes((current) => current.map((size, sizeIndex) => sizeIndex === index ? { ...size, size: event.target.value } : size))} placeholder="Например, M" className="min-h-11 w-32 border border-[color:var(--border)] px-3 text-sm outline-none focus:border-[color:var(--ink)]" /><label className="flex min-h-11 items-center gap-2 text-sm"><input name={`inStock-${index}`} type="checkbox" checked={item.inStock} onChange={(event) => setSizes((current) => current.map((size, sizeIndex) => sizeIndex === index ? { ...size, inStock: event.target.checked } : size))} className="size-4 accent-[color:var(--accent)]" />В наличии</label><button type="button" onClick={() => setSizes((current) => current.filter((_, sizeIndex) => sizeIndex !== index))} className="text-sm text-[color:var(--accent)]">Убрать</button></div>)}</div><button type="button" onClick={() => setSizes((current) => [...current, { size: "", inStock: true }])} className="mt-3 text-sm underline underline-offset-4">Добавить размер</button></section>

      <button type="submit" disabled={isUploading || isNormalizing || isSaving} className="flex min-h-12 w-full items-center justify-center bg-[color:var(--ink)] px-5 text-sm font-medium text-[color:var(--white)] hover:bg-[color:var(--accent)] disabled:cursor-wait disabled:opacity-60">{isNormalizing ? "Обрабатываем фото…" : isUploading ? `Загружаем фото ${uploadProgress}%…` : isSaving ? "Сохраняем товар…" : "Сохранить товар"}</button>
    </form>
  );
}

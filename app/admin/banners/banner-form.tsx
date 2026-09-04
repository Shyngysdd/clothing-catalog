"use client";

import { upload } from "@vercel/blob/client";
import Image from "next/image";
import { FormEvent, useState } from "react";
import { updateBanner } from "./actions";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

type BannerFormProps = { banner: { slot: string; title: string; subtitle: string | null; linkUrl: string; imageUrl: string | null }; label: string; hint: string };

export function BannerForm({ banner, label, hint }: BannerFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isNormalizing, setIsNormalizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const file = formData.get("imageFile");
    if (file instanceof File && file.size > 0) {
      if (!allowedImageTypes.has(file.type) || file.size > MAX_IMAGE_SIZE) {
        setUploadError("Поддерживаются JPG, PNG и WebP размером до 5 МБ.");
        return;
      }
      setIsUploading(true); setProgress(0); setUploadError("");
      try {
        const blob = await upload(`banners/${crypto.randomUUID()}-${file.name}`, file, { access: "public", contentType: file.type, handleUploadUrl: "/api/upload-zip-token", multipart: true, onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)) });
        setIsNormalizing(true);
        try {
          const response = await fetch("/api/normalize-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ blobUrl: blob.url, kind: "banner" }),
          });
          const result = await response.json().catch(() => null) as { error?: unknown; url?: unknown } | null;
          if (!response.ok || typeof result?.url !== "string") {
            throw new Error(typeof result?.error === "string" ? result.error : "Не удалось обработать изображение.");
          }
          formData.set("imageUrl", result.url);
        } finally {
          setIsNormalizing(false);
        }
      } catch (error) {
        setUploadError(error instanceof Error ? error.message : "Не удалось загрузить изображение.");
        return;
      } finally { setIsUploading(false); setIsNormalizing(false); }
    }
    formData.delete("imageFile");
    setIsSaving(true);
    try { await updateBanner(formData); } catch (error) { setUploadError(error instanceof Error ? error.message : "Не удалось сохранить баннер."); setIsSaving(false); }
  }

  return <form onSubmit={submit} className="grid gap-6 border border-[color:var(--border)] bg-[color:var(--white)] p-5 sm:p-7 lg:grid-cols-[12rem_1fr]"><input type="hidden" name="slot" value={banner.slot} /><div><div className="relative aspect-[3/4] overflow-hidden bg-[color:var(--ink)]">{banner.imageUrl ? <Image src={banner.imageUrl} alt={`Превью: ${banner.title}`} fill sizes="192px" className="object-cover" /> : <div className={banner.slot === "category-2" ? "lookbook-media lookbook-media--gold absolute inset-0" : "lookbook-media absolute inset-0"} />}</div><p className="font-mono-price mt-3 text-[10px] tracking-[0.12em] text-[color:var(--accent)]">{banner.slot.toUpperCase()}</p></div><div><h2 className="font-section text-2xl leading-none">{label}</h2><p className="mt-2 text-sm leading-6 text-[color:var(--ink)]/60">{hint}</p><div className="mt-6 grid gap-4"><label className="text-sm font-medium">Заголовок<input name="title" required defaultValue={banner.title} className="mt-1 min-h-11 w-full border border-[color:var(--border)] bg-[color:var(--white)] px-3 outline-none focus:border-[color:var(--accent)]" /></label><label className="text-sm font-medium">Подзаголовок<input name="subtitle" defaultValue={banner.subtitle ?? ""} className="mt-1 min-h-11 w-full border border-[color:var(--border)] bg-[color:var(--white)] px-3 outline-none focus:border-[color:var(--accent)]" /></label><label className="text-sm font-medium">Ссылка<input name="linkUrl" required defaultValue={banner.linkUrl} className="mt-1 min-h-11 w-full border border-[color:var(--border)] bg-[color:var(--white)] px-3 outline-none focus:border-[color:var(--accent)]" /></label><label className="text-sm font-medium">Изображение<input name="imageFile" type="file" accept="image/jpeg,image/png,image/webp" className="mt-1 block min-h-11 w-full cursor-pointer border border-[color:var(--border)] bg-[color:var(--white)] px-3 py-2 text-sm" /><span className="mt-2 block text-xs font-normal text-[color:var(--ink)]/55">JPG, PNG или WebP, до 5 МБ.</span></label>{banner.imageUrl ? <label className="flex items-center gap-2 text-sm"><input name="removeImage" type="checkbox" className="size-4 accent-[color:var(--accent)]" />Удалить текущее изображение</label> : null}</div>{uploadError ? <p className="mt-4 text-sm text-[color:var(--accent)]">{uploadError}</p> : null}<button type="submit" disabled={isUploading || isNormalizing || isSaving} className="mt-6 min-h-11 bg-[color:var(--ink)] px-4 text-sm font-medium text-[color:var(--white)] hover:bg-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] disabled:cursor-wait disabled:opacity-60">{isNormalizing ? "Обрабатываем фото…" : isUploading ? `Загружаем ${progress}%…` : isSaving ? "Сохраняем…" : "Сохранить баннер"}</button></div></form>;
}

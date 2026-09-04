"use client";

import { upload } from "@vercel/blob/client";
import { FormEvent, useActionState, useState } from "react";
import { importPhotosOnly } from "./actions";

const MAX_ZIP_SIZE = 100 * 1024 * 1024;

export function ImportPhotosForm() {
  const [report, formAction, isPending] = useActionState(importPhotosOnly, null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const file = formData.get("imagesZipFile");
    if (!(file instanceof File) || file.size === 0) {
      setUploadError("Выберите ZIP-архив с фотографиями.");
      return;
    }
    if (file.size > MAX_ZIP_SIZE) {
      setUploadError("ZIP-архив не должен превышать 100 МБ.");
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setUploadError("");
    try {
      const blob = await upload(`product-imports/${crypto.randomUUID()}-${file.name}`, file, {
        access: "public",
        contentType: "application/zip",
        handleUploadUrl: "/api/upload-zip-token",
        multipart: true,
        onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
      });
      formData.delete("imagesZipFile");
      formData.set("imagesZipUrl", blob.url);
      formAction(formData);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Не удалось загрузить ZIP-архив.");
    } finally {
      setIsUploading(false);
    }
  }

  return <details className="mt-6 border border-[color:var(--border)] bg-[color:var(--white)]"><summary className="cursor-pointer list-none px-4 py-4 text-sm font-medium transition hover:text-[color:var(--accent)]">Загрузить фото (ZIP)</summary><div className="border-t border-[color:var(--border)] px-4 py-5"><p className="max-w-3xl text-sm leading-6 text-[color:var(--ink)]/65">Для уже созданных товаров. Назовите главное фото <span className="font-mono-price">SKU.jpg</span>, дополнительные — <span className="font-mono-price">SKU-2.jpg</span>, <span className="font-mono-price">SKU-3.webp</span>. Папки внутри архива допустимы.</p><form onSubmit={submit} className="mt-4 flex flex-wrap items-end gap-3"><label className="grid gap-2 text-sm font-medium">ZIP с фото <span className="font-normal text-[color:var(--ink)]/55">(до 100 МБ)</span><input required name="imagesZipFile" type="file" accept=".zip,application/zip" className="max-w-full text-sm font-normal" /></label><button type="submit" disabled={isPending || isUploading} className="min-h-11 bg-[color:var(--ink)] px-4 text-sm font-medium text-[color:var(--white)] transition hover:bg-[color:var(--accent)] disabled:cursor-wait disabled:opacity-60">{isUploading ? `Загружаем ${progress}%…` : isPending ? "Обрабатываем…" : "Загрузить фото"}</button></form>{uploadError ? <p className="mt-3 text-sm text-[color:var(--accent)]">{uploadError}</p> : null}{report ? <div className="mt-5 border-t border-[color:var(--border)] pt-4 text-sm">{report.updatedSkus.length ? <p><b>Фото обновлено для:</b> <span className="font-mono-price">{report.updatedSkus.join(", ")}</span></p> : null}{report.photosNotFound.length ? <p className="mt-3"><b>Фото не найдено для:</b> <span className="font-mono-price text-[color:var(--accent)]">{report.photosNotFound.join(", ")}</span></p> : null}{report.errors.length ? <ul className="mt-3 list-disc space-y-1 pl-5 text-[color:var(--accent)]">{report.errors.map((error) => <li key={error}>{error}</li>)}</ul> : null}</div> : null}</div></details>;
}

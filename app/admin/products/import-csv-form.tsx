"use client";

import { useActionState } from "react";
import { importProductsCsv, type CsvImportReport } from "./actions";

const initialState: CsvImportReport | null = null;

export function ImportCsvForm() {
  const [report, formAction, isPending] = useActionState(importProductsCsv, initialState);

  return (
    <details className="mt-6 border border-[color:var(--ink)]/20 bg-[color:var(--white)]">
      <summary className="cursor-pointer list-none px-4 py-4 text-sm font-medium transition hover:text-[color:var(--accent)]">Импорт из CSV</summary>
      <div className="border-t border-[color:var(--ink)]/12 px-4 py-5">
        <div className="max-w-3xl text-sm leading-6 text-[color:var(--ink)]/65">
          <p>Начните с пустого шаблона: он не содержит тестовых товаров. Для ориентира можно скачать отдельный пример с заполненными строками.</p>
          <div className="mt-4 flex flex-wrap gap-3"><a href="/admin/products/csv-template" download className="inline-flex min-h-10 items-center border border-[color:var(--ink)]/25 px-3 font-medium text-[color:var(--ink)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]">Скачать пустой шаблон</a><a href="/admin/products/csv-template?mode=example" download className="inline-flex min-h-10 items-center border border-[color:var(--ink)]/25 px-3 font-medium text-[color:var(--ink)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]">Скачать пример</a></div>
          <ul className="mt-4 list-disc space-y-1 pl-5"><li>Файл можно сохранить из Excel через разделитель <span className="font-mono-price">;</span> или <span className="font-mono-price">,</span>.</li><li>Размеры: <span className="font-mono-price">S,M,L,XL</span>; уход: <span className="font-mono-price">Стирка 30°;Не отбеливать</span>.</li><li><span className="font-mono-price">originalPrice</span> и <span className="font-mono-price">imageColor</span> можно оставить пустыми.</li><li>ZIP с фото необязателен: назовите файлы по SKU, например <span className="font-mono-price">BIL-001.jpg</span> и <span className="font-mono-price">BIL-001-2.webp</span>.</li></ul>
        </div>
        <form action={formAction} className="mt-4 flex flex-wrap items-end gap-3">
          <label className="grid gap-2 text-sm font-medium">CSV-файл<input required name="csv" type="file" accept=".csv,text/csv" className="max-w-full text-sm font-normal" /></label>
          <label className="grid gap-2 text-sm font-medium">ZIP с фото <span className="font-normal text-[color:var(--ink)]/55">(до 200 МБ)</span><input name="imagesZip" type="file" accept=".zip,application/zip,application/x-zip-compressed" className="max-w-full text-sm font-normal" /></label>
          <button type="submit" disabled={isPending} className="min-h-11 bg-[color:var(--ink)] px-4 text-sm font-medium text-[color:var(--white)] transition hover:bg-[color:var(--accent)] disabled:cursor-wait disabled:opacity-60">{isPending ? "Импортируем…" : "Импортировать"}</button>
        </form>
        {report ? <div className="mt-5 border-t border-[color:var(--ink)]/12 pt-4 text-sm"><p><b>Создано:</b> {report.created} · <b>Обновлено:</b> {report.updated} · <b>Пропущено:</b> {report.skipped.length}</p>{report.photosNotFound.length ? <p className="mt-3"><b>Фото не найдено для:</b> <span className="font-mono-price text-[color:var(--accent)]">{report.photosNotFound.join(", ")}</span></p> : null}{report.skipped.length ? <ul className="mt-3 list-disc space-y-1 pl-5 text-[color:var(--accent)]">{report.skipped.map((item, index) => <li key={`${item.line}-${index}`}>Строка {item.line || "файла"}: {item.reason}</li>)}</ul> : null}</div> : null}
      </div>
    </details>
  );
}

"use client";

import { useActionState, useState } from "react";
import { sendNewsletterCampaign, type NewsletterState } from "./actions";
import { BRAND_CONFIG } from "@/lib/brand-config";

const initialState: NewsletterState = { status: "idle" };
const presets = {
  "Новинки": { subject: `Новое поступление в ${BRAND_CONFIG.name}`, body: `В ${BRAND_CONFIG.name} появились новые вещи.\n\nДобавьте здесь краткое описание поступления и ключевых товаров.\n\nСмотрите новинки в каталоге.` },
  "Скидки": { subject: `Скидки в ${BRAND_CONFIG.name}`, body: "Мы подготовили подборку вещей со скидкой.\n\nДобавьте здесь информацию о скидках, сроках и выбранных товарах.\n\nКоличество товаров ограничено." },
  "Акция": { subject: `Специальная акция ${BRAND_CONFIG.name}`, body: `Для вас действует специальное предложение.\n\nДобавьте здесь условия акции, период действия и промокод, если он нужен.\n\nДо встречи в ${BRAND_CONFIG.name}.` },
};

export function NewsletterForm() {
  const [state, formAction, isPending] = useActionState(sendNewsletterCampaign, initialState);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  return <form action={formAction} className="mt-8 max-w-3xl space-y-6 border border-[color:var(--ink)]/15 bg-[color:var(--white)] p-5 sm:p-7"><div><p className="font-mono-price text-[10px] tracking-[0.12em] text-[color:var(--accent)]">ЗАГОТОВКИ</p><div className="mt-3 flex flex-wrap gap-2">{Object.entries(presets).map(([label, preset]) => <button key={label} type="button" onClick={() => { setSubject(preset.subject); setBody(preset.body); }} className="min-h-10 border border-[color:var(--ink)]/25 px-3 text-sm transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]">{label}</button>)}</div></div><label className="block text-sm font-medium">Тема письма<input required name="subject" value={subject} onChange={(event) => setSubject(event.target.value)} className="mt-2 min-h-11 w-full border border-[color:var(--ink)]/25 bg-transparent px-3 text-sm outline-none focus:border-[color:var(--accent)]" /></label><label className="block text-sm font-medium">Текст письма<textarea required name="body" value={body} onChange={(event) => setBody(event.target.value)} rows={10} className="mt-2 w-full border border-[color:var(--ink)]/25 bg-transparent px-3 py-3 text-sm leading-6 outline-none focus:border-[color:var(--accent)]" /><span className="mt-2 block text-xs font-normal text-[color:var(--ink)]/55">Переносы строк будут сохранены в письме.</span></label>{state.status !== "idle" ? <p className={`text-sm ${state.status === "error" ? "text-[color:var(--accent)]" : "text-[color:var(--ink)]/65"}`}>{state.message}</p> : null}<div className="flex justify-stretch sm:justify-end"><button type="submit" disabled={isPending} className="min-h-12 w-full bg-[color:var(--ink)] px-6 text-sm font-medium text-[color:var(--white)] transition hover:bg-[color:var(--accent)] disabled:cursor-wait disabled:opacity-60 sm:w-auto">{isPending ? "Отправляем..." : "Отправить всем подписчикам"}</button></div></form>;
}

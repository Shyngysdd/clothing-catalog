"use client";

import { useActionState } from "react";
import { sendNewsletterCampaign, type NewsletterState } from "./actions";

const initialState: NewsletterState = { status: "idle" };

export function NewsletterForm() {
  const [state, formAction, isPending] = useActionState(sendNewsletterCampaign, initialState);
  return <form action={formAction} className="mt-8 max-w-3xl space-y-6 border border-[color:var(--ink)]/15 bg-[color:var(--white)] p-5 sm:p-7"><label className="block text-sm font-medium">Тема письма<input required name="subject" className="mt-2 min-h-11 w-full border border-[color:var(--ink)]/25 bg-transparent px-3 text-sm outline-none focus:border-[color:var(--accent)]" /></label><label className="block text-sm font-medium">Текст письма<textarea required name="body" rows={10} className="mt-2 w-full border border-[color:var(--ink)]/25 bg-transparent px-3 py-3 text-sm leading-6 outline-none focus:border-[color:var(--accent)]" /><span className="mt-2 block text-xs font-normal text-[color:var(--ink)]/55">Переносы строк будут сохранены в письме.</span></label>{state.status !== "idle" ? <p className={`text-sm ${state.status === "error" ? "text-[color:var(--accent)]" : "text-[color:var(--ink)]/65"}`}>{state.message}</p> : null}<div className="flex justify-stretch sm:justify-end"><button type="submit" disabled={isPending} className="min-h-12 w-full bg-[color:var(--ink)] px-6 text-sm font-medium text-[color:var(--white)] transition hover:bg-[color:var(--accent)] disabled:cursor-wait disabled:opacity-60 sm:w-auto">{isPending ? "Отправляем..." : "Отправить всем подписчикам"}</button></div></form>;
}

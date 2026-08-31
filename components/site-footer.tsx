"use client";

import { useActionState } from "react";
import { subscribeToNewsletter, type SubscribeState } from "@/app/newsletter-actions";

const initialState: SubscribeState = { status: "idle" };

export function SiteFooter() {
  const [state, formAction, isPending] = useActionState(subscribeToNewsletter, initialState);
  return <footer className="overflow-x-clip border-t-2 border-[color:var(--ink)]/25"><div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:grid-cols-[1fr_auto] sm:px-6"><div className="min-w-0 text-sm text-[color:var(--ink)]/60">Billion.co · каталог одежды и обуви</div><form action={formAction} className="box-border w-full min-w-0 max-w-md"><label className="font-mono-price text-[10px] tracking-[0.12em] text-[color:var(--accent)]">НОВОСТИ И СКИДКИ</label><div className="mt-2 flex flex-col gap-2 sm:flex-row"><input required name="email" type="email" placeholder="Ваш email" className="min-h-11 min-w-0 w-full flex-1 border border-[color:var(--ink)]/25 bg-transparent px-3 text-sm outline-none placeholder:text-[color:var(--ink)]/45 focus:border-[color:var(--accent)]" /><button type="submit" disabled={isPending} className="min-h-11 w-full shrink-0 whitespace-nowrap bg-[color:var(--ink)] px-4 text-sm font-medium text-[color:var(--white)] hover:bg-[color:var(--accent)] disabled:cursor-wait disabled:opacity-60 sm:w-auto">{isPending ? "..." : "Подписаться"}</button></div>{state.status !== "idle" ? <p className={`mt-2 text-xs ${state.status === "error" ? "text-[color:var(--accent)]" : "text-[color:var(--ink)]/65"}`}>{state.message}</p> : null}</form></div></footer>;
}

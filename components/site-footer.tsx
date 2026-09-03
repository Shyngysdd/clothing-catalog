"use client";

import { useActionState } from "react";
import Link from "next/link";
import { subscribeToNewsletter, type SubscribeState } from "@/app/newsletter-actions";
import { BRAND_CONFIG } from "@/lib/brand-config";

const initialState: SubscribeState = { status: "idle" };

export function SiteFooter() {
  const [state, formAction, isPending] = useActionState(subscribeToNewsletter, initialState);
  return (
    <footer className="overflow-x-clip border-t border-[color:var(--ink)]/20">
      <div className="mx-auto max-w-[90rem] px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.7fr_0.7fr_1.25fr] lg:gap-8">
          <div>
            <p className="font-brand text-5xl leading-none sm:text-6xl">{BRAND_CONFIG.name}</p>
            <p className="mt-5 max-w-xs text-xs leading-5 text-[color:var(--ink)]/60">Тихий гардероб для повседневного города: вещи, собранные вокруг формы, материала и движения.</p>
          </div>
          <nav aria-label="Каталог" className="text-xs leading-7 text-[color:var(--ink)]/65"><p className="font-mono-price mb-2 text-[0.6rem] tracking-[0.14em] text-[color:var(--ink)]">КОЛЛЕКЦИИ</p><Link href="/catalog">Каталог</Link><br /><Link href="/looks">Образы</Link><br /><Link href="/catalog?sale=true">Скидки</Link></nav>
          <nav aria-label="Информация" className="text-xs leading-7 text-[color:var(--ink)]/65"><p className="font-mono-price mb-2 text-[0.6rem] tracking-[0.14em] text-[color:var(--ink)]">СТУДИЯ</p><Link href="/legal/offer">Публичная оферта</Link><br /><Link href="/account">Личный кабинет</Link><br /><a href={BRAND_CONFIG.instagramUrl} target="_blank" rel="noreferrer">Instagram</a></nav>
          <form action={formAction} className="box-border min-w-0"><label className="font-mono-price text-[0.6rem] tracking-[0.14em] text-[color:var(--ink)]">НОВОСТИ И ПРЕДЛОЖЕНИЯ</label><p className="mt-3 max-w-sm text-xs leading-5 text-[color:var(--ink)]/60">Редкие письма о новых поступлениях, образах и специальных условиях.</p><div className="mt-5 flex border-b border-[color:var(--ink)]/45"><input required name="email" type="email" placeholder="Ваш email" className="min-h-11 min-w-0 w-full flex-1 bg-transparent text-sm outline-none placeholder:text-[color:var(--ink)]/45" /><button type="submit" disabled={isPending} className="min-h-11 shrink-0 px-2 text-xs font-medium uppercase tracking-[0.08em] text-[color:var(--ink)] hover:text-[color:var(--accent)] disabled:cursor-wait disabled:opacity-60">{isPending ? "..." : "Подписаться →"}</button></div>{state.status !== "idle" ? <p className={`mt-2 text-xs ${state.status === "error" ? "text-[color:var(--accent)]" : "text-[color:var(--ink)]/65"}`}>{state.message}</p> : null}</form>
        </div>
        <div className="mt-12 flex flex-wrap justify-between gap-3 border-t border-[color:var(--ink)]/20 pt-4 font-mono-price text-[0.55rem] tracking-[0.1em] text-[color:var(--ink)]/55"><span>© {new Date().getFullYear()} {BRAND_CONFIG.name}</span><span>КАЗАХСТАН · ТИХО · ОСОЗНАННО</span></div>
      </div>
    </footer>
  );
}

"use client";

import { useActionState } from "react";
import { subscribeToNewsletter, type SubscribeState } from "@/app/newsletter-actions";

const initialState: SubscribeState = { status: "idle" };

export function NewsletterSubscribeForm({ initialEmail = "", compact = false }: { initialEmail?: string; compact?: boolean }) {
  const [state, formAction, isPending] = useActionState(subscribeToNewsletter, initialState);
  return <form action={formAction} className={compact ? "mt-4" : "w-full max-w-md"}><div className="flex gap-2"><input required name="email" type="email" defaultValue={initialEmail} placeholder="Ваш email" className="min-h-11 min-w-0 flex-1 border border-[color:var(--ink)]/25 bg-transparent px-3 text-sm outline-none placeholder:text-[color:var(--ink)]/45 focus:border-[color:var(--accent)]" /><button type="submit" disabled={isPending} className="min-h-11 bg-[color:var(--ink)] px-4 text-sm font-medium text-[color:var(--white)] hover:bg-[color:var(--accent)] disabled:cursor-wait disabled:opacity-60">{isPending ? "..." : "Подписаться снова"}</button></div>{state.status !== "idle" ? <p className={`mt-2 text-xs ${state.status === "error" ? "text-[color:var(--accent)]" : "text-[color:var(--ink)]/65"}`}>{state.message}</p> : null}</form>;
}

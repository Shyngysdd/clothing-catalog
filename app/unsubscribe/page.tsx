import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { NewsletterSubscribeForm } from "@/components/newsletter-subscribe-form";
import { BRAND_CONFIG } from "@/lib/brand-config";

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const subscriber = token ? await prisma.subscriber.findUnique({ where: { unsubscribeToken: token }, select: { id: true, email: true } }) : null;
  if (subscriber) await prisma.subscriber.delete({ where: { id: subscriber.id } });
  return <main className="mx-auto grid min-h-[calc(100svh-73px)] max-w-md place-items-center px-4 py-12"><section className="w-full border border-[color:var(--border)] bg-[color:var(--white)] p-6 sm:p-8"><p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--accent)]">{BRAND_CONFIG.name.toUpperCase()}</p><h1 className="font-display mt-3 text-4xl leading-none tracking-[-0.04em]">{subscriber ? "Вы отписались от рассылки" : "Ссылка недействительна"}</h1><p className="mt-5 text-sm leading-6 text-[color:var(--ink)]/65">{subscriber ? "Мы больше не будем отправлять вам письма с новостями и скидками." : "Эта ссылка уже использована или не существует."}</p>{subscriber ? <NewsletterSubscribeForm initialEmail={subscriber.email} compact /> : null}<Link href="/" className="mt-7 inline-flex min-h-11 items-center bg-[color:var(--ink)] px-4 text-sm font-medium text-[color:var(--white)] hover:bg-[color:var(--accent)]">На главную</Link></section></main>;
}

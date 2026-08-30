import { prisma } from "@/lib/prisma";
import { NewsletterForm } from "./newsletter-form";

export default async function NewsletterPage() {
  const subscriberCount = await prisma.subscriber.count();
  return <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16 lg:px-10"><p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--accent)]">КОММУНИКАЦИИ</p><h1 className="font-display mt-3 text-5xl leading-none tracking-[-0.04em] sm:text-7xl">Рассылка</h1><p className="mt-5 font-mono-price text-xs tracking-[0.1em] text-[color:var(--ink)]/65">ПОДПИСЧИКОВ: {subscriberCount}</p><NewsletterForm /></main>;
}

import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const customer = token ? await prisma.customer.findFirst({ where: { verificationToken: token, verificationTokenExpiry: { gt: new Date() } }, select: { id: true } }) : null;
  if (customer) {
    await prisma.customer.update({ where: { id: customer.id }, data: { emailVerified: true, verificationToken: null, verificationTokenExpiry: null, verificationEmailSentAt: null } });
  }

  return <main className="mx-auto grid min-h-[calc(100svh-73px)] max-w-md place-items-center px-4 py-12"><section className="w-full border-y border-[color:var(--border)] py-8 sm:py-10"><p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--accent)]">ЛИЧНЫЙ КАБИНЕТ</p><h1 className="font-display mt-3 text-4xl leading-none tracking-[-0.04em]">{customer ? "Email подтверждён" : "Ссылка недействительна"}</h1><p className="mt-5 text-sm leading-6 text-[color:var(--ink)]/65">{customer ? "Спасибо — email подтверждён. Теперь вы можете перейти в личный кабинет." : "Эта ссылка неверная или срок её действия истёк. Войдите в личный кабинет и отправьте письмо ещё раз."}</p><Link href={customer ? "/account" : "/account"} className="mt-7 inline-flex min-h-11 items-center bg-[color:var(--ink)] px-4 text-sm font-medium text-[color:var(--paper)] hover:bg-[color:var(--accent)]">{customer ? "Перейти в кабинет" : "Отправить письмо ещё раз"}</Link></section></main>;
}

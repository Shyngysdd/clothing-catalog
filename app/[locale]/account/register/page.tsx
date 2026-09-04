import { Link } from "@/i18n/navigation";
import { registerCustomer } from "../actions";
import { getTranslations } from "next-intl/server";

export default async function CustomerRegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const t = await getTranslations("Account");
  const errorText = error === "exists" ? "Аккаунт с таким email уже существует." : error === "terms" ? "Необходимо согласие с офертой." : error === "invalid" ? "Заполните все обязательные поля. Пароль — не менее 8 символов." : null;
  return (
    <main className="mx-auto grid min-h-[calc(100svh-73px)] max-w-md place-items-center px-4 py-12">
      <form action={registerCustomer} className="w-full border-y border-[color:var(--border)] py-8 sm:py-10">
        <p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--accent)]">{t("cabinet")}</p>
        <h1 className="font-display mt-3 text-5xl leading-none tracking-[-0.04em]">{t("register")}</h1>
        <label htmlFor="name" className="mt-8 block text-sm font-medium">{t("name")}</label>
        <input id="name" name="name" autoComplete="name" required className="mt-2 min-h-12 w-full border border-[color:var(--border)] px-3 text-sm outline-none focus:border-[color:var(--ink)]" />
        <label htmlFor="email" className="mt-5 block text-sm font-medium">{t("email")}</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="mt-2 min-h-12 w-full border border-[color:var(--border)] px-3 text-sm outline-none focus:border-[color:var(--ink)]" />
        <label htmlFor="phone" className="mt-5 block text-sm font-medium">{t("phone")} <span className="text-[color:var(--ink)]/50">{t("optional")}</span></label>
        <input id="phone" name="phone" type="tel" autoComplete="tel" className="mt-2 min-h-12 w-full border border-[color:var(--border)] px-3 text-sm outline-none focus:border-[color:var(--ink)]" />
        <label htmlFor="password" className="mt-5 block text-sm font-medium">{t("password")}</label>
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className="mt-2 min-h-12 w-full border border-[color:var(--border)] px-3 text-sm outline-none focus:border-[color:var(--ink)]" />
        <label className="mt-5 flex items-start gap-3 text-sm leading-5"><input name="agreeToTerms" type="checkbox" required className="mt-0.5 size-4 accent-[color:var(--accent)]" />Я согласен(на) с <Link href="/legal/offer" className="underline">условиями публичной оферты</Link> и обработкой персональных данных</label>
        <label className="mt-3 flex items-start gap-3 text-sm leading-5"><input name="newsletter" type="checkbox" className="mt-0.5 size-4 accent-[color:var(--accent)]" />{t("newsletter")}</label>
        {errorText ? <p className="mt-3 text-sm text-[color:var(--accent)]">{errorText}</p> : null}
        <button type="submit" className="mt-6 flex min-h-12 w-full items-center justify-center bg-[color:var(--ink)] px-5 text-sm font-medium text-[color:var(--paper)] hover:bg-[color:var(--accent)]">{t("createAccount")}</button>
        <p className="mt-5 text-sm text-[color:var(--ink)]/65">{t("hasAccount")} <Link href="/account/login" className="text-[color:var(--accent)] underline underline-offset-4">{t("login")}</Link></p>
      </form>
    </main>
  );
}

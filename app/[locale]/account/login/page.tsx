import { Link } from "@/i18n/navigation";
import { loginCustomer } from "../actions";
import { getTranslations } from "next-intl/server";

export default async function CustomerLoginPage({ searchParams }: { searchParams: Promise<{ error?: string; reset?: string }> }) {
  const { error, reset } = await searchParams;
  const t = await getTranslations("Account");
  return (
    <main className="mx-auto grid min-h-[calc(100svh-73px)] max-w-md place-items-center px-4 py-12">
      <form action={loginCustomer} className="w-full border-y border-[color:var(--border)] py-8 sm:py-10">
        <p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--accent)]">{t("cabinet")}</p>
        <h1 className="font-display mt-3 text-5xl leading-none tracking-[-0.04em]">{t("loginTitle")}</h1>
        <label htmlFor="email" className="mt-8 block text-sm font-medium">{t("email")}</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="mt-2 min-h-12 w-full border border-[color:var(--border)] px-3 text-sm outline-none focus:border-[color:var(--ink)]" />
        <label htmlFor="password" className="mt-5 block text-sm font-medium">{t("password")}</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="mt-2 min-h-12 w-full border border-[color:var(--border)] px-3 text-sm outline-none focus:border-[color:var(--ink)]" />
        {error ? <p className="mt-3 text-sm text-[color:var(--accent)]">{error === "blocked" ? t("blocked") : t("invalidCredentials")}</p> : null}
        {reset ? <p className="mt-3 text-sm text-[color:var(--accent)]">{t("passwordUpdated")}</p> : null}
        <button type="submit" className="mt-6 flex min-h-12 w-full items-center justify-center bg-[color:var(--ink)] px-5 text-sm font-medium text-[color:var(--paper)] hover:bg-[color:var(--accent)]">{t("login")}</button>
        <p className="mt-4 text-sm"><Link href="/account/forgot-password" className="text-[color:var(--accent)] underline underline-offset-4">{t("forgotPassword")}</Link></p>
        <p className="mt-5 text-sm text-[color:var(--ink)]/65">{t("noAccount")} <Link href="/account/register" className="text-[color:var(--accent)] underline underline-offset-4">{t("registerLink")}</Link></p>
      </form>
    </main>
  );
}

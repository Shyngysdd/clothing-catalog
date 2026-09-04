import { Link } from "@/i18n/navigation";
import { requestPasswordReset } from "../actions";
import { getTranslations } from "next-intl/server";

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const { sent } = await searchParams;
  const t = await getTranslations("Account");

  return (
    <main className="mx-auto grid min-h-[calc(100svh-73px)] max-w-md place-items-center px-4 py-12">
      <form action={requestPasswordReset} className="w-full border-y border-[color:var(--border)] py-8 sm:py-10">
        <p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--accent)]">{t("cabinet")}</p>
        <h1 className="font-display mt-3 text-4xl leading-none tracking-[-0.04em]">{t("resetTitle")}</h1>
        {sent ? (
          <p className="mt-5 text-sm leading-6 text-[color:var(--ink)]/65">{t("resetSent")}</p>
        ) : (
          <>
            <p className="mt-5 text-sm leading-6 text-[color:var(--ink)]/65">{t("resetIntro")}</p>
            <label htmlFor="email" className="mt-7 block text-sm font-medium">{t("email")}</label>
            <input id="email" name="email" type="email" autoComplete="email" required className="mt-2 min-h-12 w-full border border-[color:var(--border)] px-3 text-sm outline-none focus:border-[color:var(--ink)]" />
            <button type="submit" className="mt-6 flex min-h-12 w-full items-center justify-center bg-[color:var(--ink)] px-5 text-sm font-medium text-[color:var(--paper)] hover:bg-[color:var(--accent)]">{t("sendLink")}</button>
          </>
        )}
        <p className="mt-5 text-sm text-[color:var(--ink)]/65"><Link href="/account/login" className="text-[color:var(--accent)] underline underline-offset-4">{t("backToLogin")}</Link></p>
      </form>
    </main>
  );
}

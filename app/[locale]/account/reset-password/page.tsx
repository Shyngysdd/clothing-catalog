import { Link } from "@/i18n/navigation";
import { resetCustomerPassword } from "../actions";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string; error?: string }> }) {
  const { token, error } = await searchParams;
  const canReset = Boolean(token) && error !== "expired";

  return (
    <main className="mx-auto grid min-h-[calc(100svh-73px)] max-w-md place-items-center px-4 py-12">
      <form action={resetCustomerPassword} className="w-full border-y border-[color:var(--border)] py-8 sm:py-10">
        <p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--accent)]">ЛИЧНЫЙ КАБИНЕТ</p>
        <h1 className="font-display mt-3 text-4xl leading-none tracking-[-0.04em]">Новый пароль</h1>
        {canReset ? (
          <>
            <input type="hidden" name="token" value={token} />
            <label htmlFor="password" className="mt-7 block text-sm font-medium">Новый пароль</label>
            <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className="mt-2 min-h-12 w-full border border-[color:var(--border)] px-3 text-sm outline-none focus:border-[color:var(--ink)]" />
            <label htmlFor="passwordConfirmation" className="mt-5 block text-sm font-medium">Повторите пароль</label>
            <input id="passwordConfirmation" name="passwordConfirmation" type="password" autoComplete="new-password" minLength={8} required className="mt-2 min-h-12 w-full border border-[color:var(--border)] px-3 text-sm outline-none focus:border-[color:var(--ink)]" />
            {error === "invalid" ? <p className="mt-3 text-sm text-[color:var(--accent)]">Пароли должны совпадать и содержать не менее 8 символов.</p> : null}
            <button type="submit" className="mt-6 flex min-h-12 w-full items-center justify-center bg-[color:var(--ink)] px-5 text-sm font-medium text-[color:var(--paper)] hover:bg-[color:var(--accent)]">Сохранить новый пароль</button>
          </>
        ) : <p className="mt-5 text-sm leading-6 text-[color:var(--ink)]/65">Ссылка недействительна или срок её действия истёк. Запросите новую ссылку для сброса пароля.</p>}
        <p className="mt-5 text-sm text-[color:var(--ink)]/65"><Link href="/account/forgot-password" className="text-[color:var(--accent)] underline underline-offset-4">Запросить новую ссылку</Link></p>
      </form>
    </main>
  );
}

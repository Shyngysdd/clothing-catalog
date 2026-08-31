import Link from "next/link";
import { requestPasswordReset } from "../actions";

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const { sent } = await searchParams;

  return (
    <main className="mx-auto grid min-h-[calc(100svh-73px)] max-w-md place-items-center px-4 py-12">
      <form action={requestPasswordReset} className="w-full border border-[color:var(--ink)]/20 bg-[color:var(--white)] p-6 sm:p-8">
        <p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--accent)]">ЛИЧНЫЙ КАБИНЕТ</p>
        <h1 className="font-display mt-3 text-4xl leading-none tracking-[-0.04em]">Сброс пароля</h1>
        {sent ? (
          <p className="mt-5 text-sm leading-6 text-[color:var(--ink)]/65">Если аккаунт с этим email существует, мы отправили ссылку для сброса пароля.</p>
        ) : (
          <>
            <p className="mt-5 text-sm leading-6 text-[color:var(--ink)]/65">Укажите email, использованный при регистрации. Мы отправим ссылку для создания нового пароля.</p>
            <label htmlFor="email" className="mt-7 block text-sm font-medium">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required className="mt-2 min-h-12 w-full border border-[color:var(--ink)]/25 px-3 text-sm outline-none focus:border-[color:var(--ink)]" />
            <button type="submit" className="mt-6 flex min-h-12 w-full items-center justify-center bg-[color:var(--ink)] px-5 text-sm font-medium text-[color:var(--white)] hover:bg-[color:var(--accent)]">Отправить ссылку</button>
          </>
        )}
        <p className="mt-5 text-sm text-[color:var(--ink)]/65"><Link href="/account/login" className="text-[color:var(--accent)] underline underline-offset-4">Вернуться ко входу</Link></p>
      </form>
    </main>
  );
}

import Link from "next/link";
import { registerCustomer } from "../actions";

export default async function CustomerRegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const errorText = error === "exists" ? "Аккаунт с таким email уже существует." : error === "invalid" ? "Заполните все обязательные поля. Пароль — не менее 8 символов." : null;
  return (
    <main className="mx-auto grid min-h-[calc(100svh-73px)] max-w-md place-items-center px-4 py-12">
      <form action={registerCustomer} className="w-full border border-[color:var(--ink)]/20 bg-[color:var(--white)] p-6 sm:p-8">
        <p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--accent)]">ЛИЧНЫЙ КАБИНЕТ</p>
        <h1 className="font-display mt-3 text-5xl leading-none tracking-[-0.04em]">Регистрация</h1>
        <label htmlFor="name" className="mt-8 block text-sm font-medium">Имя</label>
        <input id="name" name="name" autoComplete="name" required className="mt-2 min-h-12 w-full border border-[color:var(--ink)]/25 px-3 text-sm outline-none focus:border-[color:var(--ink)]" />
        <label htmlFor="email" className="mt-5 block text-sm font-medium">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="mt-2 min-h-12 w-full border border-[color:var(--ink)]/25 px-3 text-sm outline-none focus:border-[color:var(--ink)]" />
        <label htmlFor="phone" className="mt-5 block text-sm font-medium">Телефон <span className="text-[color:var(--ink)]/50">(необязательно)</span></label>
        <input id="phone" name="phone" type="tel" autoComplete="tel" className="mt-2 min-h-12 w-full border border-[color:var(--ink)]/25 px-3 text-sm outline-none focus:border-[color:var(--ink)]" />
        <label htmlFor="password" className="mt-5 block text-sm font-medium">Пароль</label>
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className="mt-2 min-h-12 w-full border border-[color:var(--ink)]/25 px-3 text-sm outline-none focus:border-[color:var(--ink)]" />
        {errorText ? <p className="mt-3 text-sm text-[color:var(--accent)]">{errorText}</p> : null}
        <button type="submit" className="mt-6 flex min-h-12 w-full items-center justify-center bg-[color:var(--ink)] px-5 text-sm font-medium text-[color:var(--white)] hover:bg-[color:var(--accent)]">Создать аккаунт</button>
        <p className="mt-5 text-sm text-[color:var(--ink)]/65">Уже есть аккаунт? <Link href="/account/login" className="text-[color:var(--accent)] underline underline-offset-4">Войти</Link></p>
      </form>
    </main>
  );
}

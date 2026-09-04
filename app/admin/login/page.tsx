import { loginAdmin } from "../actions";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="mx-auto grid min-h-[calc(100svh-73px)] max-w-md place-items-center px-4 py-12">
      <form action={loginAdmin} className="w-full border border-[color:var(--border)] bg-[color:var(--white)] p-6 sm:p-8">
        <p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--accent)]">АДМИНИСТРАТОР</p>
        <h1 className="font-display mt-3 text-5xl leading-none tracking-[-0.04em]">Вход</h1>
        <label htmlFor="password" className="mt-8 block text-sm font-medium">Пароль</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="mt-2 min-h-12 w-full border border-[color:var(--border)] px-3 text-sm outline-none focus:border-[color:var(--ink)]" />
        {error ? <p className="mt-3 text-sm text-[color:var(--accent)]">{error === "blocked" ? "Слишком много попыток, попробуйте позже" : "Неверный пароль."}</p> : null}
        <button type="submit" className="mt-6 flex min-h-12 w-full items-center justify-center bg-[color:var(--ink)] px-5 text-sm font-medium text-[color:var(--white)] hover:bg-[color:var(--accent)]">Войти</button>
      </form>
    </main>
  );
}

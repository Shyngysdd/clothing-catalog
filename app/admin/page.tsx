import { logoutAdmin } from "./actions";

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6 sm:py-16 lg:px-10">
      <header className="flex items-end justify-between gap-6 border-b border-[color:var(--ink)]/15 pb-7">
        <div><p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--accent)]">УПРАВЛЕНИЕ</p><h1 className="font-display mt-3 text-5xl leading-none tracking-[-0.04em] sm:text-7xl">Админка</h1></div>
        <form action={logoutAdmin}><button type="submit" className="min-h-11 border border-[color:var(--ink)]/25 px-4 text-sm hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]">Выйти</button></form>
      </header>
      <p className="mt-8 max-w-lg leading-7 text-[color:var(--ink)]/70">Доступ подтверждён. Управление товарами будет добавлено на следующем этапе.</p>
    </main>
  );
}

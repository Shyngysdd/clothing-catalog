import Link from "next/link";
import { logoutAdmin } from "./actions";

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6 sm:py-16 lg:px-10">
      <header className="flex items-end justify-between gap-6 border-b border-[color:var(--ink)]/15 pb-7">
        <div><p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--accent)]">УПРАВЛЕНИЕ</p><h1 className="font-display mt-3 text-5xl leading-none tracking-[-0.04em] sm:text-7xl">Админка</h1></div>
        <form action={logoutAdmin}><button type="submit" className="min-h-11 border border-[color:var(--ink)]/25 px-4 text-sm hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]">Выйти</button></form>
      </header>
      <div className="mt-8 flex flex-wrap gap-3"><Link href="/admin/products" className="inline-flex min-h-12 items-center bg-[color:var(--ink)] px-5 text-sm font-medium text-[color:var(--white)] hover:bg-[color:var(--accent)]">Управлять товарами</Link><Link href="/admin/looks" className="inline-flex min-h-12 items-center border border-[color:var(--ink)]/25 px-5 text-sm font-medium hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]">Управлять образами</Link></div>
    </main>
  );
}

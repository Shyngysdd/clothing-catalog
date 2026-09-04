import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found-page mx-auto grid min-h-[70svh] max-w-[100rem] place-items-center px-4 py-12 sm:px-6 lg:px-10">
      <section className="w-full max-w-3xl border-y border-[color:var(--border)] py-10 text-center sm:py-16">
        <p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--accent)]">СТРАНИЦА / 404</p>
        <h1 className="font-display mt-5 text-[clamp(4rem,13vw,9rem)] leading-[0.72]">Не найдено</h1>
        <p className="mx-auto mt-7 max-w-sm text-sm leading-6 text-[color:var(--ink)]/65">Похоже, эта страница уже не существует или адрес был введён с ошибкой.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/catalog" className="flex min-h-12 items-center justify-center bg-[color:var(--ink)] px-6 text-sm font-medium text-[color:var(--paper)] hover:bg-[color:var(--accent)]">Открыть каталог</Link>
          <Link href="/" className="flex min-h-12 items-center justify-center border border-[color:var(--border)] px-6 text-sm font-medium hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]">На главную</Link>
        </div>
      </section>
    </main>
  );
}

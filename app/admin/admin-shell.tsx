"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAdmin } from "./actions";
import { BRAND_CONFIG } from "@/lib/brand-config";

type AdminShellProps = { children: React.ReactNode; newOrdersCount: number };

const navigation = [
  { href: "/admin", label: "Обзор", exact: true },
  { href: "/admin/products", label: "Товары" },
  { href: "/admin/looks", label: "Образы" },
  { href: "/admin/banners", label: "Баннеры" },
  { href: "/admin/home-sections", label: "Главная" },
  { href: "/admin/newsletter", label: "Рассылка" },
  { href: "/admin/orders", label: "Заказы" },
];

function AdminNavigation({ newOrdersCount, onNavigate }: { newOrdersCount: number; onNavigate?: () => void }) {
  const pathname = usePathname();
  return <nav aria-label="Навигация админки" className="space-y-1">
    {navigation.map((item) => {
      const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
      return <Link key={item.href} href={item.href} onClick={onNavigate} className={`relative flex min-h-11 items-center justify-between px-5 text-sm font-medium transition before:absolute before:bottom-2 before:left-0 before:top-2 before:w-0.5 ${active ? "bg-[color:var(--paper)]/10 text-[color:var(--white)] before:bg-[color:var(--accent)]" : "text-[color:var(--paper)]/60 hover:bg-[color:var(--paper)]/8 hover:text-[color:var(--paper)]"}`}><span>{item.label}</span>{item.href === "/admin/orders" && newOrdersCount > 0 ? <span className="grid size-5 place-items-center rounded-full bg-[color:var(--accent)] font-mono-price text-[10px] text-[color:var(--white)]">{newOrdersCount}</span> : null}</Link>;
    })}
  </nav>;
}

function LogoutButton() {
  return <form action={logoutAdmin}><button type="submit" className="flex min-h-11 w-full items-center px-5 text-left text-sm font-medium text-[color:var(--paper)]/65 transition hover:bg-[color:var(--paper)]/8 hover:text-[color:var(--paper)]">Выйти</button></form>;
}

export function AdminShell({ children, newOrdersCount }: AdminShellProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="min-h-[calc(100svh-8rem)] md:flex">
      <header className="sticky top-0 z-30 flex min-h-14 items-center justify-between bg-[color:var(--ink)] px-4 text-[color:var(--paper)] md:hidden">
        <Link href="/admin" className="leading-none"><span className="font-display text-lg tracking-[-0.04em]">{BRAND_CONFIG.name}</span><span className="ml-2 font-mono-price text-[9px] tracking-[0.14em] text-[color:var(--paper)]/65">АДМИНКА</span></Link>
        <button type="button" onClick={() => setIsMenuOpen((current) => !current)} aria-label="Открыть меню админки" aria-expanded={isMenuOpen} className="grid size-10 place-items-center border border-[color:var(--paper)]/25"><span className="grid gap-1"><i className="block h-px w-4 bg-current" /><i className="block h-px w-4 bg-current" /><i className="block h-px w-4 bg-current" /></span></button>
        {isMenuOpen ? <div className="absolute left-0 right-0 top-full border-t border-[color:var(--paper)]/15 bg-[color:var(--ink)] py-3 shadow-xl"><AdminNavigation newOrdersCount={newOrdersCount} onNavigate={() => setIsMenuOpen(false)} /><div className="mt-3 border-t border-[color:var(--paper)]/15 pt-3"><LogoutButton /></div></div> : null}
      </header>
      <aside className="hidden w-60 shrink-0 flex-col bg-[color:var(--ink)] text-[color:var(--paper)] md:flex">
        <div className="border-b border-[color:var(--paper)]/15 px-5 py-7"><Link href="/admin" className="font-display text-2xl tracking-[-0.05em]">{BRAND_CONFIG.name}</Link><p className="mt-2 font-mono-price text-[10px] tracking-[0.16em] text-[color:var(--paper)]/60">АДМИНКА</p></div>
        <div className="pt-5"><AdminNavigation newOrdersCount={newOrdersCount} /></div>
        <div className="mt-auto border-t border-[color:var(--paper)]/15 py-4"><LogoutButton /></div>
      </aside>
      <div className="min-w-0 flex-1 bg-[color:var(--paper)]">{children}</div>
    </div>
  );
}

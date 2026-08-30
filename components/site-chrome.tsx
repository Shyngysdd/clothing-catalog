"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/site-header";

type Category = { name: string; count: number };

export function SiteChrome({ children, categories, isCustomerLoggedIn }: { children: React.ReactNode; categories: Category[]; isCustomerLoggedIn: boolean }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return <>{children}</>;

  return <>
    <SiteHeader categories={categories} isCustomerLoggedIn={isCustomerLoggedIn} />
    <main className="flex-1">{children}</main>
    <footer className="border-t-2 border-[color:var(--ink)]/25"><div className="mx-auto max-w-6xl px-4 py-5 text-sm text-[color:var(--ink)]/60 sm:px-6">Демо-каталог одежды и обуви</div></footer>
  </>;
}

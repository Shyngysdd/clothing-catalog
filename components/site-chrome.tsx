"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

type Category = { name: string; count: number };

export function SiteChrome({ children, categories, isCustomerLoggedIn }: { children: React.ReactNode; categories: Category[]; isCustomerLoggedIn: boolean }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return <>{children}</>;

  return <>
    <SiteHeader categories={categories} isCustomerLoggedIn={isCustomerLoggedIn} />
    <main className="flex-1">{children}</main>
    <SiteFooter />
  </>;
}

"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import type { SavedAddress } from "@/lib/address-format";

type Category = { name: string; count: number };

export function SiteChrome({ children, categories, isCustomerLoggedIn, savedAddresses }: { children: React.ReactNode; categories: Category[]; isCustomerLoggedIn: boolean; savedAddresses: SavedAddress[] }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return <>{children}</>;

  return <div className="pb-[4.75rem] sm:pb-0">
    <SiteHeader categories={categories} isCustomerLoggedIn={isCustomerLoggedIn} savedAddresses={savedAddresses} />
    <main className="flex-1">{children}</main>
    <SiteFooter />
  </div>;
}

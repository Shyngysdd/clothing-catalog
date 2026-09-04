"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useSession } from "@/components/session-gate";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { categories, isCustomerLoggedIn, savedAddresses, customerName, customerPhone } = useSession();
  if (pathname.startsWith("/admin")) return <>{children}</>;

  return <div className="pb-[4.5rem] sm:pb-0">
    <SiteHeader categories={categories} isCustomerLoggedIn={isCustomerLoggedIn} savedAddresses={savedAddresses} customerName={customerName} customerPhone={customerPhone} />
    <main className="flex-1">{children}</main>
    <SiteFooter />
  </div>;
}

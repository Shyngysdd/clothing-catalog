import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CUSTOMER_SESSION_COOKIE, getCustomerIdFromSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";
import { logoutCustomer } from "./actions";

export default async function AccountPage() {
  const cookieStore = await cookies();
  const customerId = await getCustomerIdFromSession(cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value);
  if (!customerId) redirect("/account/login");

  const customer = await prisma.customer.findUnique({ where: { id: customerId }, select: { name: true, email: true, phone: true } });
  if (!customer) redirect("/account/login");

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--accent)]">ЛИЧНЫЙ КАБИНЕТ</p>
      <h1 className="font-display mt-3 text-5xl leading-none tracking-[-0.04em] sm:text-7xl">Здравствуйте, {customer.name}</h1>
      <section className="mt-10 border-y border-[color:var(--ink)]/15 py-6 text-sm">
        <p><span className="text-[color:var(--ink)]/60">Email:</span> {customer.email}</p>
        {customer.phone ? <p className="mt-3"><span className="text-[color:var(--ink)]/60">Телефон:</span> {customer.phone}</p> : null}
      </section>
      <nav className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link href="/account/orders" className="border border-[color:var(--ink)]/25 px-5 py-4 text-sm font-medium hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]">Мои заказы</Link>
        <Link href="/account/favorites" className="border border-[color:var(--ink)]/25 px-5 py-4 text-sm font-medium hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]">Избранное</Link>
      </nav>
      <form action={logoutCustomer} className="mt-8">
        <button type="submit" className="text-sm text-[color:var(--ink)]/60 underline underline-offset-4 hover:text-[color:var(--accent)]">Выйти</button>
      </form>
    </main>
  );
}

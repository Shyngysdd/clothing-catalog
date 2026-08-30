import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OrderStatusSelect } from "../order-status-select";

const formatPrice = new Intl.NumberFormat("ru-KZ");
const formatDate = new Intl.DateTimeFormat("ru-KZ", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { customer: true, items: true } });
  if (!order) notFound();

  const fulfillment = order.fulfillment === "delivery" ? "Доставка" : "Самовывоз";
  const destination = order.fulfillment === "delivery" ? (order.address || "Адрес не указан") : (order.branchName ? `Самовывоз: ${order.branchName}` : "Самовывоз");

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <Link href="/admin/orders" className="font-mono-price text-xs tracking-[0.12em] text-[color:var(--accent)]">← ВСЕ ЗАКАЗЫ</Link>
      <header className="mt-5 flex flex-wrap items-end justify-between gap-6 border-b border-[color:var(--ink)]/15 pb-7">
        <div><p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--accent)]">ЗАКАЗ</p><h1 className="font-display mt-3 text-5xl leading-none tracking-[-0.04em] sm:text-7xl">№ {order.id.slice(-6).toUpperCase()}</h1><p className="mt-4 text-sm text-[color:var(--ink)]/60">{formatDate.format(order.createdAt)}</p></div>
        <OrderStatusSelect orderId={order.id} status={order.status} />
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_18rem]">
        <section><h2 className="font-section text-lg">Состав заказа</h2><ul className="mt-4 divide-y divide-[color:var(--ink)]/12 border-y border-[color:var(--ink)]/15">{order.items.map((item) => <li key={item.id} className="flex items-start justify-between gap-4 py-4"><div><p className="font-medium">{item.name}</p><p className="mt-1 text-sm text-[color:var(--ink)]/60">Размер: {item.size} · Количество: {item.quantity}</p><p className="mt-1 font-mono-price text-xs text-[color:var(--ink)]/60">{formatPrice.format(item.price)} ₸ за шт.</p></div><p className="shrink-0 font-mono-price">{formatPrice.format(item.price * item.quantity)} ₸</p></li>)}</ul><div className="mt-5 flex items-center justify-between border-t-2 border-[color:var(--ink)] pt-4"><span className="font-section text-lg">Итого</span><span className="font-mono-price text-xl">{formatPrice.format(order.totalPrice)} ₸</span></div></section>
        <aside className="space-y-6"><section className="border border-[color:var(--ink)]/20 p-5"><p className="font-mono-price text-[10px] tracking-[0.12em] text-[color:var(--accent)]">ПОКУПАТЕЛЬ</p><p className="mt-3 font-medium">{order.customer.name}</p><a className="mt-1 block text-sm text-[color:var(--ink)]/65 hover:text-[color:var(--accent)]" href={`mailto:${order.customer.email}`}>{order.customer.email}</a><p className="mt-1 text-sm text-[color:var(--ink)]/65">{order.customer.phone || "Телефон не указан"}</p></section><section className="border border-[color:var(--ink)]/20 p-5"><p className="font-mono-price text-[10px] tracking-[0.12em] text-[color:var(--accent)]">ПОЛУЧЕНИЕ</p><p className="mt-3 font-medium">{fulfillment}</p><p className="mt-1 text-sm leading-6 text-[color:var(--ink)]/65">{destination}</p></section></aside>
      </div>
    </main>
  );
}

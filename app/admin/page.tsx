import Link from "next/link";
import { prisma } from "@/lib/prisma";

const formatPrice = new Intl.NumberFormat("ru-KZ");
const formatDate = new Intl.DateTimeFormat("ru-KZ", { day: "2-digit", month: "short", year: "numeric" });

const statusMeta: Record<string, { label: string; className: string }> = {
  new: { label: "Новый", className: "st-new" }, confirmed: { label: "Подтверждён", className: "st-transit" }, shipped: { label: "Отправлен", className: "st-transit" }, done: { label: "Выполнен", className: "st-done" }, cancelled: { label: "Отменён", className: "st-cancelled" },
};

export default async function AdminPage() {
  const [productCount, productsWithSoldOutSizes, lookCount, newOrderCount, recentOrders] = await Promise.all([
    prisma.product.count(), prisma.product.count({ where: { sizes: { some: { inStock: false } } } }), prisma.look.count(), prisma.order.count({ where: { status: "new" } }),
    prisma.order.findMany({ include: { customer: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);
  const metrics = [{ value: productCount, label: "ТОВАРОВ В КАТАЛОГЕ" }, { value: productsWithSoldOutSizes, label: "С РАСПРОДАННЫМИ РАЗМЕРАМИ" }, { value: lookCount, label: "ОБРАЗОВ" }, { value: newOrderCount, label: "НОВЫХ ЗАКАЗОВ" }];

  return <main className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6 sm:py-16 lg:px-10">
    <p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--accent)]">УПРАВЛЕНИЕ</p><h1 className="font-display mt-3 text-5xl leading-none tracking-[-0.04em] sm:text-7xl">Обзор</h1>
    <section aria-label="Ключевые показатели" className="mt-8 grid border-y border-[color:var(--ink)]/20 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((metric) => <article key={metric.label} className="border-b border-[color:var(--ink)]/15 p-5 last:border-b-0 sm:[&:nth-child(odd)]:border-r xl:border-b-0 xl:border-r xl:last:border-r-0"><p className="font-display text-5xl leading-none tracking-[-0.05em]">{metric.value}</p><p className="mt-4 font-mono-price text-[10px] tracking-[0.11em] text-[color:var(--ink)]/60">{metric.label}</p></article>)}</section>
    <section className="mt-12"><div className="flex flex-wrap items-end justify-between gap-4 border-b border-[color:var(--ink)]/15 pb-5"><div><p className="font-mono-price text-xs tracking-[0.14em] text-[color:var(--accent)]">ПОСЛЕДНИЕ</p><h2 className="font-section mt-2 text-2xl">Заказы</h2></div><Link href="/admin/orders" className="text-sm font-medium underline decoration-[color:var(--gold)] underline-offset-4 transition hover:text-[color:var(--accent)]">Все заказы →</Link></div>{recentOrders.length === 0 ? <p className="py-10 text-sm text-[color:var(--ink)]/60">Заказов пока нет.</p> : <div className="overflow-x-auto border-b border-[color:var(--ink)]/15"><table className="w-full min-w-[650px] text-left text-sm"><thead className="font-mono-price text-[10px] tracking-[0.1em] text-[color:var(--ink)]/60"><tr><th className="px-4 py-4 font-normal">ДАТА</th><th className="px-4 py-4 font-normal">ПОКУПАТЕЛЬ</th><th className="px-4 py-4 font-normal">СУММА</th><th className="px-4 py-4 font-normal">СТАТУС</th></tr></thead><tbody>{recentOrders.map((order) => { const status = statusMeta[order.status] ?? statusMeta.new; return <tr key={order.id} className="border-t border-[color:var(--ink)]/10 transition hover:bg-[color:var(--ink)]/[0.035]"><td><Link href={`/admin/orders/${order.id}`} className="block px-4 py-4 text-[color:var(--ink)]/65">{formatDate.format(order.createdAt)}</Link></td><td><Link href={`/admin/orders/${order.id}`} className="block px-4 py-4 font-medium">{order.customer.name}</Link></td><td><Link href={`/admin/orders/${order.id}`} className="block px-4 py-4 font-mono-price">{formatPrice.format(order.totalPrice)} ₸</Link></td><td><Link href={`/admin/orders/${order.id}`} className="block px-4 py-4"><span className={`order-status ${status.className}`}>{status.label}</span></Link></td></tr>; })}</tbody></table></div>}</section>
  </main>;
}

import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CUSTOMER_SESSION_COOKIE, getCustomerIdFromSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";

const formatPrice = new Intl.NumberFormat("ru-KZ");
const formatDate = new Intl.DateTimeFormat("ru-KZ", { day: "numeric", month: "long", year: "numeric" });
const statusMeta: Record<string, { label: string; className: string }> = { new: { label: "Новый", className: "st-new" }, confirmed: { label: "Подтверждён", className: "st-transit" }, shipped: { label: "В пути", className: "st-transit" }, done: { label: "Выполнен", className: "st-done" }, cancelled: { label: "Отменён", className: "st-cancelled" } };

export default async function OrdersPage() {
  const cookieStore = await cookies();
  const customerId = await getCustomerIdFromSession(cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value);
  if (!customerId) redirect("/account/login");
  const orders = await prisma.order.findMany({ where: { customerId }, include: { items: true }, orderBy: { createdAt: "desc" } });
  return <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16"><Link href="/account" className="font-mono-price text-xs tracking-[0.1em] text-[color:var(--accent)]">← ЛИЧНЫЙ КАБИНЕТ</Link><h1 className="font-display mt-5 text-[clamp(2.6rem,8vw,4.5rem)] leading-[0.9] tracking-[-0.04em]">Мои заказы</h1>{orders.length === 0 ? <div className="mt-10 border-y border-[color:var(--ink)]/15 py-10 text-center"><p className="text-[color:var(--ink)]/65">Заказов пока нет.</p><Link href="/catalog" className="mt-4 inline-block text-sm text-[color:var(--accent)] underline underline-offset-4">Перейти в каталог</Link></div> : <div className="mt-10 space-y-5">{orders.map((order) => { const status = statusMeta[order.status] ?? statusMeta.new; return <article key={order.id} className="border border-[color:var(--ink)]/20 p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono-price text-xs text-[color:var(--ink)]/60">{formatDate.format(order.createdAt)}</p><p className="font-mono-price mt-2 text-xs text-[color:var(--ink)]/45">№ {order.id.slice(-8).toUpperCase()}</p></div><span className={`order-status ${status.className}`}>{status.label}</span></div><ul className="mt-5 divide-y divide-[color:var(--ink)]/10 border-y border-[color:var(--ink)]/10">{order.items.map((item) => <li key={item.id} className="flex items-start justify-between gap-4 py-3 text-sm"><div><p className="font-medium">{item.name}</p><p className="mt-1 text-[color:var(--ink)]/60">Размер: {item.size} · {item.quantity} шт.</p></div><p className="font-mono-price shrink-0">{formatPrice.format(item.price * item.quantity)} ₸</p></li>)}</ul><div className="mt-5 flex flex-wrap items-center justify-between gap-4"><span className="text-sm text-[color:var(--ink)]/60">{order.fulfillment === "delivery" ? "Доставка" : "Самовывоз"}</span><span className="font-mono-price text-lg">{formatPrice.format(order.totalPrice)} ₸</span></div><Link href={`/account/orders/${order.id}`} className="mt-5 inline-flex min-h-11 items-center text-sm text-[color:var(--accent)] underline underline-offset-4 hover:text-[color:var(--ink)]">Подробнее о заказе →</Link></article>; })}</div>}</main>;
}

import Link from "next/link";
import { prisma } from "@/lib/prisma";

const formatPrice = new Intl.NumberFormat("ru-KZ");
const formatDate = new Intl.DateTimeFormat("ru-KZ", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const statusMeta: Record<string, { label: string; className: string }> = {
  new: { label: "Новый", className: "st-new" },
  confirmed: { label: "Подтверждён", className: "st-transit" },
  shipped: { label: "Отправлен", className: "st-transit" },
  done: { label: "Выполнен", className: "st-done" },
  cancelled: { label: "Отменён", className: "st-cancelled" },
};

const filters = [
  { value: "", label: "Все" },
  { value: "new", label: "Новые" },
  { value: "confirmed", label: "Подтверждён" },
  { value: "shipped", label: "Отправлен" },
  { value: "done", label: "Выполнен" },
  { value: "cancelled", label: "Отменён" },
];

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status: requestedStatus } = await searchParams;
  const status = statusMeta[requestedStatus ?? ""] ? requestedStatus : undefined;
  const orders = await prisma.order.findMany({
    where: status ? { status } : undefined,
    include: { customer: { select: { name: true, phone: true } }, items: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6 sm:py-16 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-5 border-b border-[color:var(--ink)]/15 pb-7">
        <div><p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--accent)]">УПРАВЛЕНИЕ</p><h1 className="font-display mt-3 text-5xl leading-none tracking-[-0.04em] sm:text-7xl">Заказы</h1></div>
        <p className="font-mono-price text-xs tracking-[0.1em] text-[color:var(--ink)]/60">ВСЕГО: {orders.length}</p>
      </div>

      <nav aria-label="Фильтр заказов" className="mt-6 flex flex-wrap gap-2">
        {filters.map((filter) => {
          const isActive = (status ?? "") === filter.value;
          const href = filter.value ? `/admin/orders?status=${filter.value}` : "/admin/orders";
          return <Link key={filter.value || "all"} href={href} className={`min-h-9 border px-3 py-2 text-xs transition ${isActive ? "border-[color:var(--ink)] bg-[color:var(--ink)] text-[color:var(--paper)]" : "border-[color:var(--ink)]/25 hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"}`}>{filter.label}</Link>;
        })}
      </nav>

      {orders.length === 0 ? <div className="mt-8 border-y border-[color:var(--ink)]/15 py-12 text-center text-[color:var(--ink)]/65">Заказов с таким статусом пока нет.</div> : (
        <div className="mt-8 overflow-x-auto border-y border-[color:var(--ink)]/20">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="font-mono-price text-[10px] tracking-[0.1em] text-[color:var(--ink)]/60"><tr className="border-b border-[color:var(--ink)]/15"><th className="px-4 py-4 font-normal">ЗАКАЗ</th><th className="px-4 py-4 font-normal">ПОКУПАТЕЛЬ</th><th className="px-4 py-4 font-normal">СУММА</th><th className="px-4 py-4 font-normal">ПОЛУЧЕНИЕ</th><th className="px-4 py-4 font-normal">СТАТУС</th><th className="px-4 py-4 text-right font-normal">ТОВАРЫ</th></tr></thead>
            <tbody>
              {orders.map((order) => {
                const orderStatus = statusMeta[order.status] ?? statusMeta.new;
                const href = `/admin/orders/${order.id}`;
                return <tr key={order.id} className="border-b border-[color:var(--ink)]/10 transition hover:bg-[color:var(--ink)]/[0.035]">
                  <td><Link href={href} className="block px-4 py-4"><span className="font-mono-price">№ {order.id.slice(-6).toUpperCase()}</span><span className="mt-1 block text-xs text-[color:var(--ink)]/55">{formatDate.format(order.createdAt)}</span></Link></td>
                  <td><Link href={href} className="block px-4 py-4"><span className="font-medium">{order.customer.name}</span><span className="mt-1 block text-xs text-[color:var(--ink)]/60">{order.customer.phone || "Телефон не указан"}</span></Link></td>
                  <td><Link href={href} className="block px-4 py-4 font-mono-price">{formatPrice.format(order.totalPrice)} ₸</Link></td>
                  <td><Link href={href} className="block px-4 py-4">{order.fulfillment === "delivery" ? "Доставка" : "Самовывоз"}</Link></td>
                  <td><Link href={href} className="block px-4 py-4"><span className={`order-status ${orderStatus.className}`}>{orderStatus.label}</span></Link></td>
                  <td><Link href={href} className="block px-4 py-4 text-right font-mono-price">{order.items.length}</Link></td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

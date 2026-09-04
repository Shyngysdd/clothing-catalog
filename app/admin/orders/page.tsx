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

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { status: requestedStatus, q: rawQuery } = await searchParams;
  const status = statusMeta[requestedStatus ?? ""] ? requestedStatus : undefined;
  const query = rawQuery?.trim() ?? "";
  const orders = await prisma.order.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(query ? { OR: [
        { customer: { is: { name: { contains: query, mode: "insensitive" } } } },
        { customer: { is: { phone: { contains: query } } } },
        { id: { equals: query } },
        { id: { endsWith: query } },
      ] } : {}),
    },
    include: { customer: { select: { name: true, phone: true } }, items: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6 sm:py-16 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-5 border-b border-[color:var(--border)] pb-7">
        <div><p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--accent)]">УПРАВЛЕНИЕ</p><h1 className="font-display mt-3 text-5xl leading-none tracking-[-0.04em] sm:text-7xl">Заказы</h1></div>
        <p className="font-mono-price text-xs tracking-[0.1em] text-[color:var(--ink)]/60">ВСЕГО: {orders.length}</p>
      </div>

      <nav aria-label="Фильтр заказов" className="mt-6 flex flex-wrap gap-2">
        {filters.map((filter) => {
          const isActive = (status ?? "") === filter.value;
          const params = new URLSearchParams();
          if (filter.value) params.set("status", filter.value);
          if (query) params.set("q", query);
          const href = params.size ? `/admin/orders?${params.toString()}` : "/admin/orders";
          return <Link key={filter.value || "all"} href={href} className={`min-h-9 border px-3 py-2 text-xs transition ${isActive ? "border-[color:var(--ink)] bg-[color:var(--ink)] text-[color:var(--paper)]" : "border-[color:var(--border)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"}`}>{filter.label}</Link>;
        })}
      </nav>

      <form method="get" className="mt-5 flex max-w-xl gap-2">
        {status ? <input type="hidden" name="status" value={status} /> : null}
        <input name="q" defaultValue={query} placeholder="Имя, телефон или номер заказа" className="min-h-11 min-w-0 flex-1 border border-[color:var(--border)] bg-[color:var(--white)] px-3 text-sm outline-none placeholder:text-[color:var(--ink)]/45 focus:border-[color:var(--accent)]" />
        <button type="submit" className="min-h-11 bg-[color:var(--ink)] px-4 text-sm font-medium text-[color:var(--white)] hover:bg-[color:var(--accent)]">Найти</button>
        {query ? <Link href={status ? `/admin/orders?status=${status}` : "/admin/orders"} className="flex min-h-11 items-center px-2 text-sm text-[color:var(--accent)] underline underline-offset-4">Сбросить</Link> : null}
      </form>

      {orders.length === 0 ? <div className="mt-8 border-y border-[color:var(--border)] py-12 text-center text-[color:var(--ink)]/65">Заказов с таким статусом пока нет.</div> : (
        <div className="mt-8 overflow-x-auto border-y border-[color:var(--border)]">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="font-mono-price text-[10px] tracking-[0.1em] text-[color:var(--ink)]/60"><tr className="border-b border-[color:var(--border)]"><th className="px-4 py-4 font-normal">ЗАКАЗ</th><th className="px-4 py-4 font-normal">ПОКУПАТЕЛЬ</th><th className="px-4 py-4 font-normal">СУММА</th><th className="px-4 py-4 font-normal">ПОЛУЧЕНИЕ</th><th className="px-4 py-4 font-normal">СТАТУС</th><th className="px-4 py-4 text-right font-normal">ТОВАРЫ</th></tr></thead>
            <tbody>
              {orders.map((order) => {
                const orderStatus = statusMeta[order.status] ?? statusMeta.new;
                const href = `/admin/orders/${order.id}`;
                return <tr key={order.id} className="border-b border-[color:var(--border)] transition hover:bg-[color:var(--ink)]/[0.035]">
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

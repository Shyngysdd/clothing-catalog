import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { CUSTOMER_SESSION_COOKIE, getCustomerIdFromSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";
import { BuyAgainButton } from "./buy-again-button";
import { toCatalogProduct } from "@/lib/catalog-types";

const formatPrice = new Intl.NumberFormat("ru-KZ");
const formatDate = new Intl.DateTimeFormat("ru-KZ", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
const statusMeta: Record<string, { label: string; className: string }> = { new: { label: "Новый", className: "st-new" }, confirmed: { label: "Подтверждён", className: "st-transit" }, shipped: { label: "В пути", className: "st-transit" }, done: { label: "Выполнен", className: "st-done" }, cancelled: { label: "Отменён", className: "st-cancelled" } };

export default async function AccountOrderPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params;
  const cookieStore = await cookies();
  const customerId = await getCustomerIdFromSession(cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value);
  if (!customerId) redirect("/account/login");

  const order = await prisma.order.findFirst({ where: { id, customerId }, include: { items: true } });
  if (!order) notFound();

  const productIds = [...new Set(order.items.map((item) => item.productId))];
  const products = await prisma.product.findMany({ where: { id: { in: productIds } }, include: { sizes: true, category: true } });
  const productsById = new Map(products.map((product) => [product.id, product]));
  const repeatItems = order.items.flatMap((item) => {
    const product = productsById.get(item.productId);
    const selectedSize = product?.sizes.find((size) => size.size === item.size);
    return product && selectedSize?.inStock ? [{ product: toCatalogProduct(product, locale), size: item.size, quantity: item.quantity }] : [];
  });
  const unavailableItemCount = order.items.length - repeatItems.length;
  const status = statusMeta[order.status] ?? statusMeta.new;
  const fulfillment = order.fulfillment === "delivery" ? "Доставка" : "Самовывоз";
  const destination = order.fulfillment === "delivery" ? order.address || "Адрес не указан" : order.branchName ? `Филиал: ${order.branchName}` : "Филиал уточнит менеджер";

  return (
    <main className="order-detail-page mx-auto max-w-[100rem] px-4 py-10 sm:px-6 sm:py-16">
      <Link href="/account/orders" className="product-back-link inline-flex min-h-11 items-center font-mono-price text-xs tracking-[0.1em] text-[color:var(--accent)]">← К ЗАКАЗАМ</Link>
      <header className="order-detail-header mt-4 border-b border-[color:var(--border)] pb-8 sm:mt-5 sm:pb-10">
        <p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--accent)]">ЗАКАЗ</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-5"><div><h1 className="font-display text-[clamp(2.6rem,8vw,4.5rem)] leading-[0.9] tracking-[-0.04em]">№ {order.id.slice(-8).toUpperCase()}</h1><p className="mt-4 text-sm text-[color:var(--ink)]/60">{formatDate.format(order.createdAt)}</p></div><span className={`order-status ${status.className}`}>{status.label}</span></div>
      </header>

      <div className="order-detail-layout mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section>
          <h2 className="font-section text-xl">Состав заказа</h2>
          <ul className="mt-4 divide-y divide-[color:var(--ink)]/12 border-y border-[color:var(--border)]">
            {order.items.map((item) => {
              const product = productsById.get(item.productId);
              return <li key={item.id} className="flex gap-3 py-4 sm:gap-5"><div className="relative size-16 shrink-0 overflow-hidden border border-[color:var(--border)] sm:size-20">{product?.imageUrl ? <Image src={product.imageUrl} alt="" fill sizes="80px" className="object-cover" /> : <div className="size-full" style={{ backgroundColor: product?.imageColor ?? "var(--ink)" }} />}</div><div className="min-w-0 flex-1"><p className="line-clamp-2 font-medium">{item.name}</p><p className="mt-1 text-sm text-[color:var(--ink)]/60">Размер: {item.size}</p><div className="mt-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-2"><p className="font-mono-price text-xs text-[color:var(--ink)]/60">{formatPrice.format(item.price)} ₸ × {item.quantity} шт.</p><p className="font-mono-price shrink-0 text-sm">{formatPrice.format(item.price * item.quantity)} ₸</p></div></div></li>;
            })}
          </ul>
          <div className="mt-5 flex items-center justify-between gap-4 border-t-2 border-[color:var(--ink)] pt-4"><span className="font-section text-xl">Итого</span><span className="font-mono-price text-xl">{formatPrice.format(order.totalPrice)} ₸</span></div>
        </section>

        <aside className="order-detail-aside space-y-5"><section className="border border-[color:var(--border)] p-5"><p className="font-mono-price text-[10px] tracking-[0.12em] text-[color:var(--accent)]">ПОЛУЧЕНИЕ</p><p className="mt-3 font-medium">{fulfillment}</p><p className="mt-1 text-sm leading-6 text-[color:var(--ink)]/65">{destination}</p></section><BuyAgainButton items={repeatItems} unavailableItemCount={unavailableItemCount} /></aside>
      </div>
    </main>
  );
}

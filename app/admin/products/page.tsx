import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteProduct } from "./actions";
import { DeleteProductButton } from "./delete-product-button";
import { ImportCsvForm } from "./import-csv-form";

const formatPrice = new Intl.NumberFormat("ru-KZ");

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({ include: { sizes: true }, orderBy: { createdAt: "desc" } });

  return (
    <main className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6 sm:py-16 lg:px-10">
      <div className="flex items-end justify-between gap-5 border-b border-[color:var(--ink)]/15 pb-7"><div><p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--accent)]">УПРАВЛЕНИЕ / КАТАЛОГ</p><h1 className="font-display mt-3 text-5xl leading-none tracking-[-0.04em] sm:text-7xl">Товары</h1></div><div className="flex flex-wrap justify-end gap-3"><Link href="/admin/products/csv-template" className="flex min-h-11 items-center border border-[color:var(--ink)]/25 px-4 text-sm font-medium hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]">Скачать шаблон CSV</Link><Link href="/admin/products/new" className="flex min-h-11 items-center bg-[color:var(--ink)] px-4 text-sm font-medium text-[color:var(--white)] hover:bg-[color:var(--accent)]">Новый товар</Link></div></div>
      <ImportCsvForm />
      <div className="mt-8 overflow-x-auto border border-[color:var(--ink)]/15 bg-[color:var(--white)]"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-[color:var(--ink)]/15 font-mono-price text-xs tracking-[0.1em] text-[color:var(--ink)]/60"><tr><th className="px-4 py-4 font-normal">ПРЕВЬЮ</th><th className="px-4 py-4 font-normal">НАЗВАНИЕ</th><th className="px-4 py-4 font-normal">КАТЕГОРИЯ</th><th className="px-4 py-4 font-normal">ЦЕНА</th><th className="px-4 py-4 font-normal">РАЗМЕРЫ</th><th className="px-4 py-4 font-normal" /></tr></thead><tbody className="divide-y divide-[color:var(--ink)]/10">{products.map((product) => { const inStock = product.sizes.filter((size) => size.inStock).length; return <tr key={product.id}><td className="px-4 py-4"><div className="size-11 border border-[color:var(--ink)]/10" style={{ backgroundColor: product.imageColor }} /></td><td className="px-4 py-4 font-medium">{product.name}<p className="font-mono-price mt-1 text-xs text-[color:var(--ink)]/55">{product.sku}</p></td><td className="px-4 py-4 text-[color:var(--ink)]/70">{product.category}</td><td className="px-4 py-4"><span className="font-mono-price">{formatPrice.format(product.price)} ₸</span>{product.originalPrice ? <span className="font-mono-price ml-2 text-xs text-[color:var(--ink)]/45 line-through">{formatPrice.format(product.originalPrice)} ₸</span> : null}</td><td className="px-4 py-4 text-[color:var(--ink)]/70">{inStock} из {product.sizes.length}</td><td className="px-4 py-4"><div className="flex items-center gap-4"><Link href={`/admin/products/${product.id}`} className="text-sm underline decoration-[color:var(--gold)] underline-offset-4 hover:text-[color:var(--accent)]">Редактировать</Link><DeleteProductButton action={deleteProduct.bind(null, product.id)} /></div></td></tr>; })}</tbody></table></div>
    </main>
  );
}

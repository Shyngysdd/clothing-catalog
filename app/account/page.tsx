import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CUSTOMER_SESSION_COOKIE, getCustomerIdFromSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";
import { changePassword, logoutCustomer, resendVerificationEmail, updateProfile } from "./actions";
import { RecentlyViewed } from "@/components/recently-viewed";

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ verification?: string; profile?: string; password?: string }> }) {
  const cookieStore = await cookies();
  const { verification, profile, password } = await searchParams;
  const customerId = await getCustomerIdFromSession(cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value);
  if (!customerId) redirect("/account/login");

  const customer = await prisma.customer.findUnique({ where: { id: customerId }, select: { name: true, email: true, phone: true, emailVerified: true } });
  if (!customer) redirect("/account/login");
  const allProducts = await prisma.product.findMany({ include: { sizes: true }, orderBy: { createdAt: "desc" } });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <p className="font-mono-price text-xs tracking-[0.16em] text-[color:var(--accent)]">ЛИЧНЫЙ КАБИНЕТ</p>
      <h1 className="font-display mt-3 text-[clamp(2.5rem,8vw,4.5rem)] leading-[0.9] tracking-[-0.04em]">Здравствуйте, {customer.name}</h1>
      <section className="mt-10 border-y border-[color:var(--ink)]/15 py-6">
        <div className="flex flex-wrap items-baseline justify-between gap-4"><div><p className="font-mono-price text-xs tracking-[0.14em] text-[color:var(--accent)]">ПРОФИЛЬ</p><h2 className="font-section mt-2 text-2xl">Личные данные</h2></div><Link href="/account/edit" className="inline-flex min-h-11 items-center text-sm text-[color:var(--accent)] underline underline-offset-4 hover:text-[color:var(--ink)]">Редактировать профиль</Link><p className="text-sm text-[color:var(--ink)]/60">Email: {customer.email}</p></div>
        <form action={updateProfile} className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-medium">Имя<input name="name" defaultValue={customer.name} autoComplete="name" required className="mt-2 min-h-11 w-full border border-[color:var(--ink)]/25 bg-[color:var(--white)] px-3 text-sm font-normal outline-none focus:border-[color:var(--accent)]" /></label>
          <label className="block text-sm font-medium">Телефон<input name="phone" type="tel" defaultValue={customer.phone ?? ""} autoComplete="tel" className="mt-2 min-h-11 w-full border border-[color:var(--ink)]/25 bg-[color:var(--white)] px-3 text-sm font-normal outline-none focus:border-[color:var(--accent)]" /></label>
          <div className="sm:col-span-2"><p className="text-sm text-[color:var(--ink)]/60">Email: {customer.email}</p>{profile === "success" ? <p className="mt-3 text-sm text-[color:var(--accent)]">Данные профиля сохранены.</p> : null}{profile === "invalid" ? <p className="mt-3 text-sm text-[color:var(--accent)]">Укажите имя.</p> : null}<button type="submit" className="mt-5 min-h-11 bg-[color:var(--ink)] px-5 text-sm font-medium text-[color:var(--white)] transition-colors hover:bg-[color:var(--accent)]">Сохранить</button></div>
        </form>
      </section>
      <section className="mt-8 border-y border-[color:var(--ink)]/15 py-6">
        <p className="font-mono-price text-xs tracking-[0.14em] text-[color:var(--accent)]">БЕЗОПАСНОСТЬ</p>
        <h2 className="font-section mt-2 text-2xl">Смена пароля</h2>
        <form action={changePassword} className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-medium sm:col-span-2">Текущий пароль<input name="currentPassword" type="password" autoComplete="current-password" required className="mt-2 min-h-11 w-full border border-[color:var(--ink)]/25 bg-[color:var(--white)] px-3 text-sm font-normal outline-none focus:border-[color:var(--accent)]" /></label>
          <label className="block text-sm font-medium">Новый пароль<input name="newPassword" type="password" autoComplete="new-password" minLength={8} required className="mt-2 min-h-11 w-full border border-[color:var(--ink)]/25 bg-[color:var(--white)] px-3 text-sm font-normal outline-none focus:border-[color:var(--accent)]" /></label>
          <label className="block text-sm font-medium">Подтвердите новый пароль<input name="passwordConfirmation" type="password" autoComplete="new-password" minLength={8} required className="mt-2 min-h-11 w-full border border-[color:var(--ink)]/25 bg-[color:var(--white)] px-3 text-sm font-normal outline-none focus:border-[color:var(--accent)]" /></label>
          <div className="sm:col-span-2"><p className="text-xs text-[color:var(--ink)]/60">Минимум 8 символов.</p>{password === "success" ? <p className="mt-3 text-sm text-[color:var(--accent)]">Пароль успешно изменён.</p> : null}{password === "current" ? <p className="mt-3 text-sm text-[color:var(--accent)]">Неверный текущий пароль.</p> : null}{password === "short" ? <p className="mt-3 text-sm text-[color:var(--accent)]">Новый пароль должен содержать минимум 8 символов.</p> : null}{password === "mismatch" ? <p className="mt-3 text-sm text-[color:var(--accent)]">Пароли не совпадают.</p> : null}{password === "invalid" ? <p className="mt-3 text-sm text-[color:var(--accent)]">Заполните все поля пароля.</p> : null}<button type="submit" className="mt-5 min-h-11 border border-[color:var(--ink)]/45 px-5 text-sm font-medium transition-colors hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]">Изменить пароль</button></div>
        </form>
      </section>
      {!customer.emailVerified ? <section className="mt-6 border border-[color:var(--gold)]/60 bg-[color:var(--gold)]/10 p-4 text-sm"><p className="font-medium">Подтвердите email</p><p className="mt-1 leading-6 text-[color:var(--ink)]/65">Подтверждение поможет сохранить доступ к вашему личному кабинету.</p><form action={resendVerificationEmail} className="mt-3"><button type="submit" className="text-[color:var(--accent)] underline underline-offset-4 hover:text-[color:var(--ink)]">Отправить письмо ещё раз</button></form>{verification === "sent" ? <p className="mt-3 text-[color:var(--accent)]">Письмо отправлено.</p> : null}{verification === "wait" ? <p className="mt-3 text-[color:var(--ink)]/65">Письмо уже отправлено. Повторите попытку через 2 минуты.</p> : null}{verification === "error" ? <p className="mt-3 text-[color:var(--accent)]">Не удалось отправить письмо. Проверьте настройки Resend.</p> : null}</section> : null}
      <nav className="mt-8 grid gap-3 sm:grid-cols-3">
        <Link href="/account/orders" className="border border-[color:var(--ink)]/25 px-5 py-4 text-sm font-medium hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]">Мои заказы</Link>
        <Link href="/account/favorites" className="border border-[color:var(--ink)]/25 px-5 py-4 text-sm font-medium hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]">Избранное</Link>
        <Link href="/account/addresses" className="border border-[color:var(--ink)]/25 px-5 py-4 text-sm font-medium hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]">Адреса</Link>
      </nav>
      <RecentlyViewed allProducts={allProducts} disableAnimationForSmallSelection />
      <form action={logoutCustomer} className="mt-8">
        <button type="submit" className="text-sm text-[color:var(--ink)]/60 underline underline-offset-4 hover:text-[color:var(--accent)]">Выйти</button>
      </form>
    </main>
  );
}

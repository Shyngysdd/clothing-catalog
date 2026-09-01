"use client";

import Link from "next/link";
import { useState } from "react";
import { createOrderFromCart } from "@/app/account/order-actions";
import { useCart } from "@/context/cart-context";
import { BRAND_CONFIG } from "@/lib/brand-config";
import { formatSavedAddress } from "@/lib/address-format";
import type { SavedAddress } from "@/lib/address-format";
import { CartSummary } from "./cart-summary";
import { CartItemsList } from "./cart-items-list";
import { OverlayPanel } from "./overlay-panel";

const formatPrice = new Intl.NumberFormat("ru-KZ");

type DeliveryMethod = "pickup" | "delivery";
type FormErrors = Partial<Record<"name" | "phone" | "address", string>>;

export function CartDrawer({ onClose, isCustomerLoggedIn, savedAddresses }: { onClose: () => void; isCustomerLoggedIn: boolean; savedAddresses: SavedAddress[] }) {
  const { items, totalPrice, clearCart } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("pickup");
  const [address, setAddress] = useState(() => {
    const defaultAddress = savedAddresses.find((savedAddress) => savedAddress.isDefault);
    return defaultAddress ? formatSavedAddress(defaultAddress) : "";
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [orderFormed, setOrderFormed] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function clearError(field: keyof FormErrors) {
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
  }

  function handleClearCart() {
    if (window.confirm("Очистить корзину?")) clearCart();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FormErrors = {};
    if (!name.trim()) nextErrors.name = "Укажите имя";
    if (!phone.trim()) nextErrors.phone = "Укажите телефон";
    if (deliveryMethod === "delivery" && !address.trim()) {
      nextErrors.address = "Укажите адрес доставки";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setOrderError("");

    if (isCustomerLoggedIn) {
      const result = await createOrderFromCart({
        items: items.map((item) => ({ productId: item.id, size: item.size, quantity: item.quantity })),
        fulfillment: deliveryMethod,
        address: deliveryMethod === "delivery" ? address.trim() : undefined,
      });

      if (!result.saved && result.reason !== "unauthenticated") {
        setOrderError(result.reason === "unavailable" ? "Один из товаров больше недоступен. Обновите корзину." : "Не удалось сохранить заказ. Попробуйте ещё раз.");
        setIsSubmitting(false);
        return;
      }
    }

    const itemLines = items.map(
      (item) =>
        `• ${item.name}, размер ${item.size} — ${item.quantity} шт. × ${formatPrice.format(item.price)} ₸ = ${formatPrice.format(item.price * item.quantity)} ₸`,
    );
    const deliveryLabel = deliveryMethod === "delivery" ? "Доставка" : "Самовывоз";
    const orderText = [
      "Новый заказ",
      "",
      "Товары:",
      ...itemLines,
      "",
      `Итого: ${formatPrice.format(totalPrice)} ₸`,
      "",
      `Имя: ${name.trim()}`,
      `Телефон: ${phone.trim()}`,
      `Способ получения: ${deliveryLabel}`,
      ...(deliveryMethod === "delivery" ? [`Адрес: ${address.trim()}`] : []),
    ].join("\n");

    window.open(`https://wa.me/${BRAND_CONFIG.whatsappNumber}?text=${encodeURIComponent(orderText)}`, "_blank", "noopener,noreferrer");
    clearCart();
    setOrderFormed(true);
    setIsSubmitting(false);
  }

  return (
    <OverlayPanel labelledBy="cart-drawer-title" onClose={onClose} position="right">
      <div className="flex items-center justify-between border-b border-[color:var(--ink)]/15 px-5 py-5 sm:px-6">
        <h2 id="cart-drawer-title" className="font-display text-4xl leading-none tracking-[-0.04em]">
          {orderFormed ? "Заказ" : "Корзина"}
        </h2>
        <div className="flex items-center gap-1"><button type="button" onClick={handleClearCart} disabled={orderFormed || items.length === 0} className="min-h-11 px-2 text-sm text-[color:var(--ink)]/60 underline underline-offset-4 hover:text-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-0" aria-label="Очистить корзину">Очистить всё</button><button type="button" onClick={onClose} className="grid size-11 place-items-center rounded-lg text-xl text-[color:var(--ink)]/60 hover:bg-[color:var(--ink)]/5 hover:text-[color:var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ink)]" aria-label="Закрыть корзину">×</button></div>
      </div>

      {orderFormed ? (
        <div className="grid flex-1 place-items-center px-6 text-center">
          <div>
            <p className="font-display text-4xl leading-none tracking-[-0.04em]">Заказ сформирован</p>
            <p className="mt-3 text-sm leading-6 text-[color:var(--ink)]/60">
              Сообщение с данными заказа открыто в WhatsApp.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-7 min-h-11 rounded-lg border border-[color:var(--ink)]/25 px-4 text-sm font-medium hover:border-[color:var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ink)]"
            >
              Вернуться к каталогу
            </button>
          </div>
        </div>
      ) : items.length > 0 ? (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <CartItemsList className="px-5 sm:px-6" />
          <form noValidate onSubmit={handleSubmit} className="border-t border-[color:var(--ink)]/15 px-5 py-5 sm:px-6">
            <CartSummary items={items} />

            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="customer-name" className="text-sm font-medium">Имя</label>
                <input
                  id="customer-name"
                  type="text"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    clearError("name");
                  }}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "customer-name-error" : undefined}
                  className="mt-2 min-h-11 w-full rounded-lg border border-[color:var(--ink)]/25 px-3 text-sm outline-none transition-colors focus:border-[color:var(--ink)]"
                />
                {errors.name ? <p id="customer-name-error" className="mt-1 text-sm text-[color:var(--accent)]">{errors.name}</p> : null}
              </div>

              <div>
                <label htmlFor="customer-phone" className="text-sm font-medium">Телефон</label>
                <input
                  id="customer-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) => {
                    setPhone(event.target.value);
                    clearError("phone");
                  }}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? "customer-phone-error" : undefined}
                  className="mt-2 min-h-11 w-full rounded-lg border border-[color:var(--ink)]/25 px-3 text-sm outline-none transition-colors focus:border-[color:var(--ink)]"
                />
                {errors.phone ? <p id="customer-phone-error" className="mt-1 text-sm text-[color:var(--accent)]">{errors.phone}</p> : null}
              </div>

              <fieldset>
                <legend className="text-sm font-medium">Способ получения</legend>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="radio"
                      name="delivery-method"
                      value="pickup"
                      checked={deliveryMethod === "pickup"}
                      onChange={() => setDeliveryMethod("pickup")}
                      className="peer sr-only"
                    />
                    <span className="flex min-h-11 items-center justify-center rounded-lg border border-[color:var(--ink)]/25 px-3 text-center text-sm font-medium peer-checked:border-[color:var(--ink)] peer-checked:bg-[color:var(--ink)] peer-checked:text-[color:var(--white)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[color:var(--ink)]">
                      Самовывоз
                    </span>
                  </label>
                  <label className="cursor-pointer">
                    <input
                      type="radio"
                      name="delivery-method"
                      value="delivery"
                      checked={deliveryMethod === "delivery"}
                      onChange={() => setDeliveryMethod("delivery")}
                      className="peer sr-only"
                    />
                    <span className="flex min-h-11 items-center justify-center rounded-lg border border-[color:var(--ink)]/25 px-3 text-center text-sm font-medium peer-checked:border-[color:var(--ink)] peer-checked:bg-[color:var(--ink)] peer-checked:text-[color:var(--white)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[color:var(--ink)]">
                      Доставка
                    </span>
                  </label>
                </div>
              </fieldset>

              {deliveryMethod === "delivery" ? (
                <div>
                  <label htmlFor="delivery-address" className="text-sm font-medium">Адрес доставки</label>
                  {savedAddresses.length > 0 ? <div className="mt-3"><p className="font-mono-price text-[10px] tracking-[0.1em] text-[color:var(--ink)]/55">СОХРАНЁННЫЕ АДРЕСА</p><div className="mt-2 grid gap-2">{savedAddresses.map((savedAddress) => { const formattedAddress = formatSavedAddress(savedAddress); return <button key={savedAddress.id} type="button" onClick={() => { setAddress(formattedAddress); clearError("address"); }} aria-pressed={address === formattedAddress} className={`min-h-11 border px-3 py-2 text-left text-sm transition-colors ${address === formattedAddress ? "border-[color:var(--accent)] bg-[color:var(--accent)]/8" : "border-[color:var(--ink)]/20 hover:border-[color:var(--accent)]"}`}><span className="font-medium">{savedAddress.label || "Адрес доставки"}{savedAddress.isDefault ? " · основной" : ""}</span><span className="mt-1 block text-xs leading-5 text-[color:var(--ink)]/65">{formattedAddress}</span></button>; })}</div></div> : null}
                  <input
                    id="delivery-address"
                    type="text"
                    autoComplete="street-address"
                    value={address}
                    onChange={(event) => {
                      setAddress(event.target.value);
                      clearError("address");
                    }}
                    aria-invalid={Boolean(errors.address)}
                    aria-describedby={errors.address ? "delivery-address-error" : undefined}
                  className="mt-3 min-h-11 w-full rounded-lg border border-[color:var(--ink)]/25 px-3 text-sm outline-none transition-colors focus:border-[color:var(--ink)]"
                  />
                  {errors.address ? <p id="delivery-address-error" className="mt-1 text-sm text-[color:var(--accent)]">{errors.address}</p> : null}
                </div>
              ) : null}
            </div>

            {!isCustomerLoggedIn ? (
              <p className="mt-5 text-sm leading-6 text-[color:var(--ink)]/60">
                <Link href="/account/login" className="text-[color:var(--accent)] underline underline-offset-4">Войдите</Link>, чтобы видеть историю заказов.
              </p>
            ) : null}
            {orderError ? <p className="mt-4 text-sm text-[color:var(--accent)]">{orderError}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-7 flex min-h-12 w-full items-center justify-center rounded-lg bg-[color:var(--ink)] px-5 text-sm font-medium text-[color:var(--white)] hover:bg-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ink)] disabled:cursor-wait disabled:opacity-60"
            >
              {isSubmitting ? "Сохраняем заказ…" : "Отправить заказ в WhatsApp"}
            </button>
          </form>
        </div>
      ) : (
        <div className="grid flex-1 place-items-center px-6 text-center">
          <p className="text-[color:var(--ink)]/60">Корзина пока пуста</p>
        </div>
      )}
    </OverlayPanel>
  );
}

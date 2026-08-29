"use client";

import { useState } from "react";
import { useCart } from "@/context/cart-context";
import { OverlayPanel } from "./overlay-panel";

export const WHATSAPP_PHONE = "77081306033";

const formatPrice = new Intl.NumberFormat("ru-KZ");

type DeliveryMethod = "pickup" | "delivery";
type FormErrors = Partial<Record<"name" | "phone" | "address", string>>;

export function CartDrawer({ onClose }: { onClose: () => void }) {
  const { items, totalPrice, removeItem } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("pickup");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [orderFormed, setOrderFormed] = useState(false);

  function clearError(field: keyof FormErrors) {
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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

    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(orderText)}`, "_blank", "noopener,noreferrer");
    setOrderFormed(true);
  }

  return (
    <OverlayPanel labelledBy="cart-drawer-title" onClose={onClose} position="right">
      <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-5 sm:px-6">
        <h2 id="cart-drawer-title" className="text-xl font-semibold tracking-tight">
          {orderFormed ? "Заказ" : "Корзина"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="grid size-11 place-items-center rounded-lg text-xl text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
          aria-label="Закрыть корзину"
        >
          ×
        </button>
      </div>

      {orderFormed ? (
        <div className="grid flex-1 place-items-center px-6 text-center">
          <div>
            <p className="text-2xl font-semibold tracking-tight">Заказ сформирован</p>
            <p className="mt-3 text-sm leading-6 text-zinc-500">
              Сообщение с данными заказа открыто в WhatsApp.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-7 min-h-11 rounded-lg border border-zinc-300 px-4 text-sm font-medium hover:border-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
            >
              Вернуться к каталогу
            </button>
          </div>
        </div>
      ) : items.length > 0 ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <ul className="shrink-0 divide-y divide-zinc-200 px-5 sm:px-6">
            {items.map((item) => (
              <li key={`${item.id}-${item.size}`} className="py-5">
                <div className="flex gap-3">
                  <div className="size-16 shrink-0 rounded-md" style={{ backgroundColor: item.imageColor }} />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="mt-1 text-sm text-zinc-500">Размер: {item.size} · {item.quantity} шт.</p>
                    <p className="mt-2 text-sm">{formatPrice.format(item.price * item.quantity)} ₸</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id, item.size)}
                    className="self-start text-sm text-zinc-500 underline underline-offset-4 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
                  >
                    Удалить
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <form noValidate onSubmit={handleSubmit} className="min-h-0 flex-1 overflow-y-auto border-t border-zinc-200 px-5 py-5 sm:px-6">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Итого</span>
              <span>{formatPrice.format(totalPrice)} ₸</span>
            </div>

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
                  className="mt-2 min-h-11 w-full rounded-lg border border-zinc-300 px-3 text-sm outline-none transition-colors focus:border-zinc-900"
                />
                {errors.name ? <p id="customer-name-error" className="mt-1 text-sm text-red-700">{errors.name}</p> : null}
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
                  className="mt-2 min-h-11 w-full rounded-lg border border-zinc-300 px-3 text-sm outline-none transition-colors focus:border-zinc-900"
                />
                {errors.phone ? <p id="customer-phone-error" className="mt-1 text-sm text-red-700">{errors.phone}</p> : null}
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
                    <span className="flex min-h-11 items-center justify-center rounded-lg border border-zinc-300 px-3 text-center text-sm font-medium peer-checked:border-zinc-900 peer-checked:bg-zinc-900 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-zinc-900">
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
                    <span className="flex min-h-11 items-center justify-center rounded-lg border border-zinc-300 px-3 text-center text-sm font-medium peer-checked:border-zinc-900 peer-checked:bg-zinc-900 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-zinc-900">
                      Доставка
                    </span>
                  </label>
                </div>
              </fieldset>

              {deliveryMethod === "delivery" ? (
                <div>
                  <label htmlFor="delivery-address" className="text-sm font-medium">Адрес доставки</label>
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
                    className="mt-2 min-h-11 w-full rounded-lg border border-zinc-300 px-3 text-sm outline-none transition-colors focus:border-zinc-900"
                  />
                  {errors.address ? <p id="delivery-address-error" className="mt-1 text-sm text-red-700">{errors.address}</p> : null}
                </div>
              ) : null}
            </div>

            <button
              type="submit"
              className="mt-7 flex min-h-12 w-full items-center justify-center rounded-lg bg-zinc-900 px-5 text-sm font-medium text-white hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
            >
              Оформить заказ
            </button>
          </form>
        </div>
      ) : (
        <div className="grid flex-1 place-items-center px-6 text-center">
          <p className="text-zinc-500">Корзина пока пуста</p>
        </div>
      )}
    </OverlayPanel>
  );
}

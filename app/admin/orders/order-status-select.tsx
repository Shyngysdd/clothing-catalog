"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "./actions";

const statuses = [
  { value: "new", label: "Новый" },
  { value: "confirmed", label: "Подтверждён" },
  { value: "shipped", label: "Отправлен" },
  { value: "done", label: "Выполнен" },
  { value: "cancelled", label: "Отменён" },
];

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <label className="block max-w-xs text-sm font-medium">
      <span>Статус заказа</span>
      <select
        value={status}
        disabled={isPending}
        onChange={(event) => startTransition(() => updateOrderStatus(orderId, event.target.value))}
        className="mt-2 min-h-11 w-full border border-[color:var(--ink)]/25 bg-transparent px-3 text-sm outline-none transition focus:border-[color:var(--accent)] disabled:cursor-wait disabled:opacity-60"
      >
        {statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
      <span className="mt-2 block min-h-4 font-mono-price text-[10px] tracking-[0.1em] text-[color:var(--ink)]/55">
        {isPending ? "СОХРАНЯЕМ…" : "ИЗМЕНЕНИЯ СОХРАНЯЮТСЯ СРАЗУ"}
      </span>
    </label>
  );
}

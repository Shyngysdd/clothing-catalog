"use client";

import { useState } from "react";

type DangerZoneFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  productCount: number;
  title: string;
  description: string;
  buttonLabel: string;
};

const CONFIRMATION_WORD = "УДАЛИТЬ";

export function DangerZoneForm({ action, productCount, title, description, buttonLabel }: DangerZoneFormProps) {
  const [confirmation, setConfirmation] = useState("");
  const isConfirmed = confirmation === CONFIRMATION_WORD;

  return (
    <form action={action} className="flex min-w-0 flex-col border border-[color:var(--accent)]/35 p-4 sm:p-5">
      <h3 className="font-section text-2xl leading-none">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-[color:var(--ink)]/65">{description}</p>
      <p className="font-mono-price mt-3 text-xs tracking-[0.08em] text-[color:var(--accent)]">БУДЕТ ЗАТРОНУТО ТОВАРОВ: {productCount}</p>
      <label className="mt-5 text-sm font-medium">
        Напишите «{CONFIRMATION_WORD}» для подтверждения
        <input
          name="confirmation"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          className="mt-2 min-h-11 w-full border border-[color:var(--border)] bg-[color:var(--white)] px-3 text-sm outline-none focus:border-[color:var(--accent)]"
          aria-label={`Подтверждение: ${title}`}
        />
      </label>
      <button
        type="submit"
        disabled={!isConfirmed}
        className="mt-4 min-h-11 border border-[color:var(--accent)] bg-[color:var(--accent)] px-4 text-sm font-medium text-[color:var(--white)] disabled:cursor-not-allowed disabled:border-[color:var(--border)] disabled:bg-transparent disabled:text-[color:var(--ink)]/40"
      >
        {buttonLabel}
      </button>
    </form>
  );
}

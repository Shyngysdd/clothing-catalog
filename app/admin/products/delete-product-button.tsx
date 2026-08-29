"use client";

export function DeleteProductButton({ action }: { action: () => void | Promise<void> }) {
  return <form action={action} onSubmit={(event) => { if (!window.confirm("Удалить товар без возможности восстановления?")) event.preventDefault(); }}><button type="submit" className="text-sm text-[color:var(--accent)] underline underline-offset-4">Удалить</button></form>;
}

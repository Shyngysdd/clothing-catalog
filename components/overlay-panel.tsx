"use client";

import { useEffect, useRef } from "react";
import type { KeyboardEvent, ReactNode } from "react";

type OverlayPanelProps = {
  children: ReactNode;
  labelledBy: string;
  onClose: () => void;
  position?: "center" | "right";
};

export function OverlayPanel({ children, labelledBy, onClose, position = "center" }: OverlayPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
      previouslyFocused?.focus();
    };
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      onClose();
      return;
    }

    if (event.key !== "Tab" || !panelRef.current) return;

    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  const panelClass =
    position === "right"
      ? "ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
      : "my-6 w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl sm:p-8";

  return (
    <div className="fixed inset-0 z-50 bg-black/40 p-4" onMouseDown={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={panelClass}
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </div>
  );
}

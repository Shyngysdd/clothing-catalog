"use client";

import { useRef } from "react";
import type { Dispatch, MouseEvent, SetStateAction, TouchEvent } from "react";

type UseSwipeGalleryOptions = {
  frameCount: number;
  setActiveFrame: Dispatch<SetStateAction<number>>;
  maxSwipeDistance?: number;
};

export function useSwipeGallery({ frameCount, setActiveFrame, maxSwipeDistance = Number.POSITIVE_INFINITY }: UseSwipeGalleryOptions) {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const suppressClickRef = useRef(false);

  function resetTouch() {
    touchStartRef.current = null;
  }

  function onTouchStart(event: TouchEvent<HTMLElement>) {
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }

  function onTouchEnd(event: TouchEvent<HTMLElement>) {
    const touchStart = touchStartRef.current;
    resetTouch();
    if (!touchStart || frameCount < 2) return;

    const touch = event.changedTouches[0];
    const horizontalDistance = touch.clientX - touchStart.x;
    const verticalDistance = touch.clientY - touchStart.y;
    const absoluteHorizontalDistance = Math.abs(horizontalDistance);

    if (
      Math.abs(verticalDistance) >= absoluteHorizontalDistance ||
      absoluteHorizontalDistance < 48 ||
      absoluteHorizontalDistance > maxSwipeDistance
    ) return;

    setActiveFrame((current) => horizontalDistance < 0 ? (current + 1) % frameCount : (current - 1 + frameCount) % frameCount);
    suppressClickRef.current = true;
    window.setTimeout(() => { suppressClickRef.current = false; }, 250);
  }

  function onClick(event: MouseEvent<HTMLElement>) {
    if (!suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
  }

  return { onTouchStart, onTouchEnd, onTouchCancel: resetTouch, onClick };
}

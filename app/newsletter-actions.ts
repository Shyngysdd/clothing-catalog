"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type SubscribeState = { status: "idle" | "success" | "exists" | "error"; message?: string };

export async function subscribeToNewsletter(_: SubscribeState, formData: FormData): Promise<SubscribeState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return { status: "error", message: "Укажите корректный email." };
  try {
    await prisma.subscriber.create({ data: { email } });
    return { status: "success", message: "Спасибо, вы подписаны." };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return { status: "exists", message: "Вы уже подписаны." };
    return { status: "error", message: "Не удалось оформить подписку. Попробуйте ещё раз." };
  }
}

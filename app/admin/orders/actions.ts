"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const orderStatuses = new Set(["new", "confirmed", "shipped", "done", "cancelled"]);

export async function updateOrderStatus(id: string, status: string) {
  if (!orderStatuses.has(status)) {
    throw new Error("Неизвестный статус заказа.");
  }

  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

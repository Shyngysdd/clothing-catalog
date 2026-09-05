"use server";

import { cookies } from "next/headers";
import { CUSTOMER_SESSION_COOKIE, getCustomerIdFromSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";

type CheckoutItem = {
  productId: string;
  size: string;
  quantity: number;
};

type CreateOrderInput = {
  items: CheckoutItem[];
  fulfillment: "pickup" | "delivery";
  address?: string;
};

export async function createOrderFromCart(input: CreateOrderInput) {
  const cookieStore = await cookies();
  const customerId = await getCustomerIdFromSession(cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value);
  if (!customerId) return { saved: false as const, reason: "unauthenticated" as const };

  const items = input.items.filter((item) => item.productId && item.size && Number.isInteger(item.quantity) && item.quantity > 0);
  if (items.length === 0 || items.length !== input.items.length) {
    return { saved: false as const, reason: "invalid" as const };
  }

  const productIds = [...new Set(items.map((item) => item.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { sizes: true },
  });
  const productsById = new Map(products.map((product) => [product.id, product]));

  const orderItems = items.map((item) => {
    const product = productsById.get(item.productId);
    const selectedSize = product?.sizes.find((size) => size.size === item.size);
    if (!product || !selectedSize?.inStock) return null;

    return {
      productId: product.id,
      name: product.nameRu,
      size: selectedSize.size,
      price: product.price,
      quantity: item.quantity,
    };
  });

  if (orderItems.some((item) => item === null)) {
    return { saved: false as const, reason: "unavailable" as const };
  }

  const confirmedItems = orderItems.filter((item): item is NonNullable<typeof item> => item !== null);
  const totalPrice = confirmedItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const address = input.fulfillment === "delivery" ? input.address?.trim() : null;
  if (input.fulfillment === "delivery" && !address) {
    return { saved: false as const, reason: "invalid" as const };
  }

  const order = await prisma.order.create({
    data: {
      customerId,
      totalPrice,
      fulfillment: input.fulfillment,
      address,
      branchName: null,
      items: { create: confirmedItems },
    },
    select: { id: true },
  });

  return { saved: true as const, orderId: order.id };
}

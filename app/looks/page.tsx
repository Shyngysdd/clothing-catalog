import { prisma } from "@/lib/prisma";
import { toCatalogLook } from "@/lib/catalog-types";
import { LooksClient } from "./looks-client";

export const dynamic = "force-dynamic";

export default async function LooksPage() {
  const dbLooks = await prisma.look.findMany({
    include: { items: { include: { product: { include: { sizes: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  return <LooksClient looks={dbLooks.map(toCatalogLook)} />;
}

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toCatalogLook } from "@/lib/catalog-types";
import { LookDetailClient } from "./look-detail-client";

export const dynamic = "force-dynamic";

export default async function LookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const look = await prisma.look.findUnique({
    where: { id },
    include: { items: { include: { product: { include: { sizes: true } } } } },
  });

  if (!look) notFound();

  return <LookDetailClient look={toCatalogLook(look)} />;
}

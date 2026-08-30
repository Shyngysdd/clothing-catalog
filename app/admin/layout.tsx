import { prisma } from "@/lib/prisma";
import { AdminShell } from "./admin-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const newOrdersCount = await prisma.order.count({ where: { status: "new" } });
  return <AdminShell newOrdersCount={newOrdersCount}>{children}</AdminShell>;
}

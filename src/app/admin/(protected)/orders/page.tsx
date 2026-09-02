import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { OrderList } from "@/components/admin/OrderList";

export default async function AdminOrdersPage() {
  const [orders, revenue, statusCounts] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { orderItems: { include: { sheetMusic: true } } },
    }),
    prisma.order.aggregate({
      where: { status: "SUCCESS" },
      _sum: { totalAmount: true },
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  // Prisma's Decimal isn't serializable across the Server -> Client
  // Component boundary as-is - same pattern as /sheets and /admin/sheets.
  const serializedOrders = orders.map((order) => ({
    ...order,
    totalAmount: order.totalAmount.toNumber(),
    orderItems: order.orderItems.map((item) => ({
      ...item,
      price: item.price.toNumber(),
      sheetMusic: {
        ...item.sheetMusic,
        price: item.sheetMusic.price.toNumber(),
      },
    })),
  }));

  const counts = { PENDING: 0, SUCCESS: 0, FAILED: 0 };
  for (const row of statusCounts) {
    counts[row.status] = row._count;
  }

  return (
    <main className="min-h-screen bg-paper px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/admin"
          className="font-mono text-xs uppercase tracking-[0.15em] text-ink/50 hover:text-brass"
        >
          ← 返回後台首頁
        </Link>

        <h1 className="mt-4 font-display text-2xl font-semibold text-ink">
          訂單與收入統計
        </h1>

        <div className="mt-10">
          <OrderList
            orders={serializedOrders}
            totalRevenue={revenue._sum.totalAmount?.toNumber() ?? 0}
            statusCounts={counts}
          />
        </div>
      </div>
    </main>
  );
}

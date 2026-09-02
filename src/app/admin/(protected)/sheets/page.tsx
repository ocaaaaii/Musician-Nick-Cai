import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SheetMusicManager } from "@/components/admin/SheetMusicManager";

export default async function AdminSheetsPage() {
  const sheets = await prisma.sheetMusic.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { orderItems: { where: { order: { status: "SUCCESS" } } } },
      },
    },
  });

  // Prisma's Decimal isn't serializable across the Server -> Client
  // Component boundary as-is - same pattern as the public /sheets page.
  const serialized = sheets.map((sheet) => ({
    ...sheet,
    price: sheet.price.toNumber(),
    salesCount: sheet._count.orderItems,
  }));

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
          樂譜商品管理
        </h1>

        <div className="mt-10">
          <SheetMusicManager sheets={serialized} />
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ServicePackageManager } from "@/components/admin/ServicePackageManager";

export default async function AdminServicesPage() {
  const packages = await prisma.servicePackage.findMany({
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
  });

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
          服務與定價管理
        </h1>

        <div className="mt-10">
          <ServicePackageManager packages={packages} />
        </div>
      </div>
    </main>
  );
}

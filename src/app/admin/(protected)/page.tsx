import { logout } from "./actions";

const modules = [
  { href: "/admin/profile", label: "個人品牌與首頁" },
  { href: "/admin/sheets", label: "樂譜商品管理" },
  { href: "/admin/services", label: "服務與定價管理" },
  { href: "/admin/orders", label: "訂單與收入統計" },
  { href: "/admin/commissions", label: "委託與詢問看板" },
];

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-paper px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between border-b border-ink/15 pb-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-ink/50">
              已登入為 ADMIN
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold text-ink">
              後台管理
            </h1>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="border border-ink/30 px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-ink transition-colors hover:border-brass hover:text-brass"
            >
              登出
            </button>
          </form>
        </div>

        <ul className="mt-8 divide-y divide-ink/10">
          {modules.map((m) => (
            <li key={m.href} className="py-4 font-body text-sm text-ink/40">
              {m.label}
              <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.1em] text-ink/25">
                即將推出
              </span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

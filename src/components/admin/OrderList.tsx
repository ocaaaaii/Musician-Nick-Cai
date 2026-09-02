"use client";

import { useState } from "react";
import { resendDownloadEmail } from "@/app/admin/(protected)/orders/actions";

type OrderRow = {
  id: string;
  userEmail: string;
  totalAmount: number;
  status: "PENDING" | "SUCCESS" | "FAILED";
  createdAt: Date;
  orderItems: {
    id: string;
    price: number;
    sheetMusic: { title: string };
  }[];
};

const STATUS_LABELS: Record<OrderRow["status"], string> = {
  PENDING: "待付款",
  SUCCESS: "已付款",
  FAILED: "失敗",
};

const STATUS_STYLES: Record<OrderRow["status"], string> = {
  PENDING: "text-ink/50",
  SUCCESS: "text-brass",
  FAILED: "text-red-700",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function OrderList({
  orders,
  totalRevenue,
  statusCounts,
}: {
  orders: OrderRow[];
  totalRevenue: number;
  statusCounts: Record<OrderRow["status"], number>;
}) {
  const [resending, setResending] = useState<string | null>(null);
  const [rowMessage, setRowMessage] = useState<Record<string, string>>({});

  async function handleResend(orderId: string) {
    setResending(orderId);
    setRowMessage((m) => ({ ...m, [orderId]: "" }));
    const result = await resendDownloadEmail(orderId);
    setRowMessage((m) => ({
      ...m,
      [orderId]: result.ok ? "已重新寄出" : "重發失敗，請稍後再試",
    }));
    setResending(null);
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="總營收" value={`NT$ ${totalRevenue.toLocaleString()}`} />
        <StatCard label="已付款" value={String(statusCounts.SUCCESS)} />
        <StatCard label="待付款" value={String(statusCounts.PENDING)} />
        <StatCard label="失敗" value={String(statusCounts.FAILED)} />
      </div>

      <ul className="divide-y divide-ink/10">
        {orders.map((order) => (
          <li key={order.id} className="py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-body text-sm text-ink">{order.userEmail}</p>
                <p className="mt-1 font-mono text-[11px] text-ink/50">
                  {order.orderItems
                    .map((item) => item.sheetMusic.title)
                    .join("、")}
                </p>
                <p className="mt-1 font-mono text-[11px] text-ink/40">
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-body text-sm text-ink">
                  NT$ {order.totalAmount.toLocaleString()}
                </p>
                <p
                  className={`mt-1 font-mono text-[11px] uppercase tracking-[0.08em] ${STATUS_STYLES[order.status]}`}
                >
                  {STATUS_LABELS[order.status]}
                </p>
                {order.status === "SUCCESS" && (
                  <button
                    type="button"
                    onClick={() => handleResend(order.id)}
                    disabled={resending === order.id}
                    className="mt-2 border border-ink/30 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-ink transition-colors hover:border-brass hover:text-brass disabled:opacity-50"
                  >
                    {resending === order.id ? "寄送中…" : "重發下載信"}
                  </button>
                )}
              </div>
            </div>
            {rowMessage[order.id] && (
              <p className="mt-2 text-right font-mono text-[11px] text-ink/50">
                {rowMessage[order.id]}
              </p>
            )}
          </li>
        ))}
        {orders.length === 0 && (
          <li className="py-4 font-body text-sm text-ink/40">
            尚無訂單紀錄
          </li>
        )}
      </ul>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-ink/15 bg-cream/60 p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink/50">
        {label}
      </p>
      <p className="mt-1 font-display text-xl font-semibold text-ink">
        {value}
      </p>
    </div>
  );
}

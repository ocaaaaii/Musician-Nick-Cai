"use client";

import { useEffect, useState } from "react";
import type { Commission } from "@prisma/client";
import { toggleCommissionHandled } from "@/app/admin/(protected)/commissions/actions";

const TYPE_LABELS: Record<Commission["type"], string> = {
  LESSON: "教學詢問",
  TRANSCRIPTION: "採譜委託",
  COLLABORATION: "合作邀約",
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

function sortCommissions(list: Commission[]) {
  return [...list].sort((a, b) => {
    if (a.isHandled !== b.isHandled) return a.isHandled ? 1 : -1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}

export function CommissionBoard({
  commissions: initialCommissions,
}: {
  commissions: Commission[];
}) {
  const [commissions, setCommissions] = useState(initialCommissions);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    setCommissions(initialCommissions);
  }, [initialCommissions]);

  async function handleToggle(commission: Commission) {
    const nextHandled = !commission.isHandled;
    setPendingId(commission.id);
    setCommissions((list) =>
      sortCommissions(
        list.map((c) =>
          c.id === commission.id ? { ...c, isHandled: nextHandled } : c
        )
      )
    );

    const result = await toggleCommissionHandled(commission.id, nextHandled);
    if (!result.ok) {
      // Revert on failure
      setCommissions((list) =>
        sortCommissions(
          list.map((c) =>
            c.id === commission.id
              ? { ...c, isHandled: commission.isHandled }
              : c
          )
        )
      );
    }
    setPendingId(null);
  }

  return (
    <ul className="divide-y divide-ink/10">
      {commissions.map((commission) => (
        <li
          key={commission.id}
          className={`py-4 ${commission.isHandled ? "opacity-50" : ""}`}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink/40">
                {TYPE_LABELS[commission.type]}
              </p>
              <p className="mt-1 font-body text-sm text-ink">
                {commission.name}
                <span className="ml-2 text-ink/50">{commission.email}</span>
                {commission.phone && (
                  <span className="ml-2 text-ink/50">{commission.phone}</span>
                )}
              </p>
              <p className="mt-2 whitespace-pre-wrap font-body text-sm text-ink/70">
                {commission.details}
              </p>
              {commission.audioUrl && (
                <a
                  href={commission.audioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block font-mono text-[11px] text-brass underline"
                >
                  參考連結
                </a>
              )}
              <p className="mt-2 font-mono text-[11px] text-ink/40">
                {formatDate(commission.createdAt)}
              </p>
            </div>
            <label className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-ink/60">
              <input
                type="checkbox"
                checked={commission.isHandled}
                disabled={pendingId === commission.id}
                onChange={() => handleToggle(commission)}
              />
              已處理
            </label>
          </div>
        </li>
      ))}
      {commissions.length === 0 && (
        <li className="py-4 font-body text-sm text-ink/40">
          尚無委託或詢問紀錄
        </li>
      )}
    </ul>
  );
}

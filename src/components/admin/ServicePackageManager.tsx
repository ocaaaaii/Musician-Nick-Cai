"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ServicePackage } from "@prisma/client";
import {
  createServicePackage,
  updateServicePackage,
  deleteServicePackage,
  toggleServicePackagePublished,
} from "@/app/admin/(protected)/services/actions";
import type { ServicePackageInput } from "@/lib/validation/service-package";

const TYPE_LABELS: Record<ServicePackageInput["type"], string> = {
  TRANSCRIPTION: "採譜委託",
  LESSON: "一對一鋼琴教學",
  COLLABORATION: "合作邀約",
};

const TYPE_ORDER: ServicePackageInput["type"][] = [
  "TRANSCRIPTION",
  "LESSON",
  "COLLABORATION",
];

const EMPTY_FORM: ServicePackageInput = {
  type: "LESSON",
  title: "",
  priceInfo: "",
  description: "",
  sortOrder: 0,
};

function toFormInput(pkg: ServicePackage): ServicePackageInput {
  return {
    type: pkg.type,
    title: pkg.title,
    priceInfo: pkg.priceInfo,
    description: pkg.description,
    sortOrder: pkg.sortOrder,
  };
}

function fieldErrorText(code: string) {
  return code === "required" ? "此欄位必填" : "格式不正確";
}

export function ServicePackageManager({
  packages,
}: {
  packages: ServicePackage[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<ServicePackageInput>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [rowMessage, setRowMessage] = useState<Record<string, string>>({});
  const [togglingId, setTogglingId] = useState<string | null>(null);

  function startAdd(type: ServicePackageInput["type"]) {
    setEditingId("new");
    setForm({ ...EMPTY_FORM, type });
    setFieldErrors({});
    setFormMessage(null);
  }

  function startEdit(pkg: ServicePackage) {
    setEditingId(pkg.id);
    setForm(toFormInput(pkg));
    setFieldErrors({});
    setFormMessage(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function handleSave() {
    setSaving(true);
    setFieldErrors({});
    setFormMessage(null);

    const result =
      editingId === "new"
        ? await createServicePackage(form)
        : await updateServicePackage(editingId as string, form);

    if (result.ok) {
      setEditingId(null);
      router.refresh();
    } else {
      setFieldErrors(result.fieldErrors ?? {});
      if (result.message) setFormMessage("儲存失敗，請稍後再試");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    setRowMessage((m) => ({ ...m, [id]: "" }));
    const result = await deleteServicePackage(id);
    if (result.ok) {
      router.refresh();
    } else {
      setRowMessage((m) => ({ ...m, [id]: "刪除失敗，請稍後再試" }));
    }
  }

  async function handleToggle(pkg: ServicePackage) {
    setTogglingId(pkg.id);
    await toggleServicePackagePublished(pkg.id, !pkg.isPublished);
    router.refresh();
    setTogglingId(null);
  }

  const form_panel = editingId && (
    <div className="border border-ink/15 bg-cream/60 p-5">
      <p className="font-mono text-xs uppercase tracking-[0.15em] text-ink/50">
        {editingId === "new" ? "新增服務項目" : "編輯服務項目"}
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block font-mono text-xs uppercase tracking-[0.1em] text-ink/60">
            類型
          </label>
          <select
            value={form.type}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                type: e.target.value as ServicePackageInput["type"],
              }))
            }
            className="mt-1.5 w-full border border-ink/20 bg-transparent px-3 py-2 font-body text-sm text-ink focus:border-brass focus:outline-none"
          >
            {TYPE_ORDER.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <TextField
          label="排序"
          type="number"
          value={String(form.sortOrder)}
          onChange={(v) => setForm((f) => ({ ...f, sortOrder: Number(v) }))}
        />
        <TextField
          label="標題"
          value={form.title}
          onChange={(v) => setForm((f) => ({ ...f, title: v }))}
          error={fieldErrors.title}
        />
        <TextField
          label="價格說明"
          value={form.priceInfo}
          onChange={(v) => setForm((f) => ({ ...f, priceInfo: v }))}
          error={fieldErrors.priceInfo}
          placeholder="NT$ 1,500 起 / 每堂 NT$ 2,000 / 面議"
        />
      </div>

      <div className="mt-4">
        <label className="block font-mono text-xs uppercase tracking-[0.1em] text-ink/60">
          說明文字
        </label>
        <textarea
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          rows={3}
          className="mt-1.5 w-full border border-ink/20 bg-transparent px-3 py-2 font-body text-sm text-ink focus:border-brass focus:outline-none"
        />
        {fieldErrors.description && (
          <p className="mt-1 font-mono text-[11px] text-red-700">
            {fieldErrorText(fieldErrors.description)}
          </p>
        )}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="border border-ink/30 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.15em] text-ink transition-colors hover:border-brass hover:text-brass disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "儲存中…" : "儲存"}
        </button>
        <button
          type="button"
          onClick={cancelEdit}
          disabled={saving}
          className="font-mono text-xs uppercase tracking-[0.15em] text-ink/50 hover:text-ink"
        >
          取消
        </button>
        {formMessage && (
          <span className="font-mono text-[11px] text-red-700">
            {formMessage}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-10">
      {form_panel}

      {TYPE_ORDER.map((type) => {
        const items = packages.filter((p) => p.type === type);
        return (
          <div key={type}>
            <div className="flex items-center justify-between border-b border-ink/15 pb-2">
              <h2 className="font-mono text-xs uppercase tracking-[0.15em] text-ink/50">
                {TYPE_LABELS[type]}
              </h2>
              <button
                type="button"
                onClick={() => startAdd(type)}
                className="border border-ink/30 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink transition-colors hover:border-brass hover:text-brass"
              >
                新增
              </button>
            </div>
            <ul className="divide-y divide-ink/10">
              {items.map((pkg) => (
                <li key={pkg.id} className="py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-body text-sm text-ink">
                        {pkg.title}
                        {!pkg.isPublished && (
                          <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ink/40">
                            未上架
                          </span>
                        )}
                      </p>
                      <p className="mt-1 font-mono text-[11px] text-ink/50">
                        {pkg.priceInfo} · 排序 {pkg.sortOrder}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-ink/60">
                        <input
                          type="checkbox"
                          checked={pkg.isPublished}
                          disabled={togglingId === pkg.id}
                          onChange={() => handleToggle(pkg)}
                        />
                        上架
                      </label>
                      <button
                        type="button"
                        onClick={() => startEdit(pkg)}
                        className="border border-ink/30 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink transition-colors hover:border-brass hover:text-brass"
                      >
                        編輯
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(pkg.id)}
                        className="border border-ink/30 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink transition-colors hover:border-red-700 hover:text-red-700"
                      >
                        刪除
                      </button>
                    </div>
                  </div>
                  {rowMessage[pkg.id] && (
                    <p className="mt-2 font-mono text-[11px] text-red-700">
                      {rowMessage[pkg.id]}
                    </p>
                  )}
                </li>
              ))}
              {items.length === 0 && (
                <li className="py-4 font-body text-sm text-ink/40">
                  尚未新增任何項目
                </li>
              )}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block font-mono text-xs uppercase tracking-[0.1em] text-ink/60">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full border border-ink/20 bg-transparent px-3 py-2 font-body text-sm text-ink focus:border-brass focus:outline-none"
      />
      {error && (
        <p className="mt-1 font-mono text-[11px] text-red-700">
          {fieldErrorText(error)}
        </p>
      )}
    </div>
  );
}

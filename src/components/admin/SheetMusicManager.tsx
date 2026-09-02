"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createSheetMusic,
  updateSheetMusic,
  deleteSheetMusic,
  toggleSheetMusicPublished,
} from "@/app/admin/(protected)/sheets/actions";
import {
  createUploadUrl,
  type UploadKind,
} from "@/app/admin/(protected)/sheets/upload-actions";
import type { SheetMusicInput } from "@/lib/validation/sheet-music";

const SIZE_HINT_MB: Record<UploadKind, number> = {
  pdf: 20,
  image: 5,
  audio: 15,
};

async function uploadFile(
  kind: UploadKind,
  file: File
): Promise<{ key: string; publicUrl?: string } | { error: string }> {
  const result = await createUploadUrl(kind, file.name, file.type);
  if (!result.ok) {
    return {
      error:
        result.message === "invalid_type" ? "檔案類型不正確" : "上傳失敗，請稍後再試",
    };
  }

  const putResponse = await fetch(result.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!putResponse.ok) {
    return { error: "上傳失敗，請稍後再試" };
  }

  return { key: result.key, publicUrl: result.publicUrl };
}

export type SheetMusicRow = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  difficulty: string;
  genre: string;
  key: string | null;
  pdfFileKey: string;
  sampleImages: string[];
  audioSampleUrl: string;
  isPublished: boolean;
  salesCount: number;
};

const EMPTY_FORM: SheetMusicInput = {
  title: "",
  description: "",
  price: 0,
  difficulty: "",
  genre: "",
  key: "",
  pdfFileKey: "",
  sampleImages: [],
  audioSampleUrl: "",
};

function toFormInput(sheet: SheetMusicRow): SheetMusicInput {
  return {
    title: sheet.title,
    description: sheet.description ?? "",
    price: sheet.price,
    difficulty: sheet.difficulty,
    genre: sheet.genre,
    key: sheet.key ?? "",
    pdfFileKey: sheet.pdfFileKey,
    sampleImages: sheet.sampleImages,
    audioSampleUrl: sheet.audioSampleUrl,
  };
}

function fieldErrorText(code: string) {
  return code === "required" ? "此欄位必填" : "格式不正確";
}

export function SheetMusicManager({ sheets }: { sheets: SheetMusicRow[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<SheetMusicInput>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [rowMessage, setRowMessage] = useState<Record<string, string>>({});
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [uploading, setUploading] = useState<
    Partial<Record<"pdf" | "audio" | "images", boolean>>
  >({});
  const [uploadError, setUploadError] = useState<
    Partial<Record<"pdf" | "audio" | "images", string>>
  >({});

  function startAdd() {
    setEditingId("new");
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setFormMessage(null);
    setUploadError({});
  }

  function startEdit(sheet: SheetMusicRow) {
    setEditingId(sheet.id);
    setForm(toFormInput(sheet));
    setFieldErrors({});
    setFormMessage(null);
    setUploadError({});
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
        ? await createSheetMusic(form)
        : await updateSheetMusic(editingId as string, form);

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
    const result = await deleteSheetMusic(id);
    if (result.ok) {
      router.refresh();
    } else {
      setRowMessage((m) => ({
        ...m,
        [id]:
          result.message === "has_orders"
            ? "此樂譜已有訂單紀錄，無法刪除，請改用下架"
            : "刪除失敗，請稍後再試",
      }));
    }
  }

  async function handleToggle(sheet: SheetMusicRow) {
    setTogglingId(sheet.id);
    await toggleSheetMusicPublished(sheet.id, !sheet.isPublished);
    router.refresh();
    setTogglingId(null);
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={startAdd}
          className="border border-ink/30 px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-ink transition-colors hover:border-brass hover:text-brass"
        >
          新增樂譜
        </button>
      </div>

      {editingId && (
        <div className="border border-ink/15 bg-cream/60 p-5">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-ink/50">
            {editingId === "new" ? "新增樂譜" : "編輯樂譜"}
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <TextField
              label="曲名"
              value={form.title}
              onChange={(v) => setForm((f) => ({ ...f, title: v }))}
              error={fieldErrors.title}
            />
            <TextField
              label="價格 (NT$)"
              type="number"
              value={String(form.price)}
              onChange={(v) => setForm((f) => ({ ...f, price: Number(v) }))}
              error={fieldErrors.price}
            />
            <TextField
              label="難易度"
              value={form.difficulty}
              onChange={(v) => setForm((f) => ({ ...f, difficulty: v }))}
              error={fieldErrors.difficulty}
              placeholder="Beginner / Intermediate / Advanced"
            />
            <TextField
              label="曲風"
              value={form.genre}
              onChange={(v) => setForm((f) => ({ ...f, genre: v }))}
              error={fieldErrors.genre}
              placeholder="Pop / Jazz / Classical..."
            />
            <TextField
              label="調性（選填）"
              value={form.key ?? ""}
              onChange={(v) => setForm((f) => ({ ...f, key: v }))}
            />
          </div>

          <div className="mt-4">
            <label className="block font-mono text-xs uppercase tracking-[0.1em] text-ink/60">
              描述（選填）
            </label>
            <textarea
              value={form.description ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={3}
              className="mt-1.5 w-full border border-ink/20 bg-transparent px-3 py-2 font-body text-sm text-ink focus:border-brass focus:outline-none"
            />
          </div>

          <div className="mt-6 grid gap-5">
            <div>
              <label className="block font-mono text-xs uppercase tracking-[0.1em] text-ink/60">
                PDF 正本（上限建議 {SIZE_HINT_MB.pdf}MB）
              </label>
              <input
                type="file"
                accept="application/pdf"
                disabled={uploading.pdf}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  setUploading((u) => ({ ...u, pdf: true }));
                  setUploadError((u) => ({ ...u, pdf: "" }));
                  const result = await uploadFile("pdf", file);
                  if ("error" in result) {
                    setUploadError((u) => ({ ...u, pdf: result.error }));
                  } else {
                    setForm((f) => ({ ...f, pdfFileKey: result.key }));
                  }
                  setUploading((u) => ({ ...u, pdf: false }));
                }}
                className="mt-1.5 block font-body text-sm text-ink"
              />
              {uploading.pdf && (
                <p className="mt-1 font-mono text-[11px] text-ink/50">上傳中…</p>
              )}
              {form.pdfFileKey && !uploading.pdf && (
                <p className="mt-1 font-mono text-[11px] text-ink/50">
                  已上傳：{form.pdfFileKey}
                </p>
              )}
              {(uploadError.pdf || fieldErrors.pdfFileKey) && (
                <p className="mt-1 font-mono text-[11px] text-red-700">
                  {uploadError.pdf || fieldErrorText(fieldErrors.pdfFileKey!)}
                </p>
              )}
            </div>

            <div>
              <label className="block font-mono text-xs uppercase tracking-[0.1em] text-ink/60">
                試聽音檔（上限建議 {SIZE_HINT_MB.audio}MB）
              </label>
              <input
                type="file"
                accept="audio/*"
                disabled={uploading.audio}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  setUploading((u) => ({ ...u, audio: true }));
                  setUploadError((u) => ({ ...u, audio: "" }));
                  const result = await uploadFile("audio", file);
                  if ("error" in result) {
                    setUploadError((u) => ({ ...u, audio: result.error }));
                  } else {
                    setForm((f) => ({
                      ...f,
                      audioSampleUrl: result.publicUrl!,
                    }));
                  }
                  setUploading((u) => ({ ...u, audio: false }));
                }}
                className="mt-1.5 block font-body text-sm text-ink"
              />
              {uploading.audio && (
                <p className="mt-1 font-mono text-[11px] text-ink/50">上傳中…</p>
              )}
              {form.audioSampleUrl && !uploading.audio && (
                <audio
                  controls
                  src={form.audioSampleUrl}
                  className="mt-2 h-9 w-full max-w-xs"
                />
              )}
              {(uploadError.audio || fieldErrors.audioSampleUrl) && (
                <p className="mt-1 font-mono text-[11px] text-red-700">
                  {uploadError.audio ||
                    fieldErrorText(fieldErrors.audioSampleUrl!)}
                </p>
              )}
            </div>

            <div>
              <label className="block font-mono text-xs uppercase tracking-[0.1em] text-ink/60">
                預覽圖（上限建議 {SIZE_HINT_MB.image}MB／張，可多選）
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploading.images}
                onChange={async (e) => {
                  const files = Array.from(e.target.files ?? []);
                  e.target.value = "";
                  if (files.length === 0) return;
                  setUploading((u) => ({ ...u, images: true }));
                  setUploadError((u) => ({ ...u, images: "" }));
                  const results = await Promise.all(
                    files.map((file) => uploadFile("image", file))
                  );
                  const urls = results
                    .filter(
                      (r): r is { key: string; publicUrl?: string } =>
                        !("error" in r)
                    )
                    .map((r) => r.publicUrl!);
                  if (urls.length > 0) {
                    setForm((f) => ({
                      ...f,
                      sampleImages: [...f.sampleImages, ...urls],
                    }));
                  }
                  const failedCount = results.length - urls.length;
                  if (failedCount > 0) {
                    setUploadError((u) => ({
                      ...u,
                      images: `${failedCount} 張上傳失敗`,
                    }));
                  }
                  setUploading((u) => ({ ...u, images: false }));
                }}
                className="mt-1.5 block font-body text-sm text-ink"
              />
              {uploading.images && (
                <p className="mt-1 font-mono text-[11px] text-ink/50">上傳中…</p>
              )}
              {form.sampleImages.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-2">
                  {form.sampleImages.map((url) => (
                    <li key={url} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt=""
                        className="h-16 w-16 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            sampleImages: f.sampleImages.filter(
                              (u) => u !== url
                            ),
                          }))
                        }
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[11px] text-cream"
                        aria-label="移除"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {uploadError.images && (
                <p className="mt-1 font-mono text-[11px] text-red-700">
                  {uploadError.images}
                </p>
              )}
            </div>
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
      )}

      <ul className="divide-y divide-ink/10">
        {sheets.map((sheet) => (
          <li key={sheet.id} className="py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-body text-sm text-ink">
                  {sheet.title}
                  {!sheet.isPublished && (
                    <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ink/40">
                      未上架
                    </span>
                  )}
                </p>
                <p className="mt-1 font-mono text-[11px] text-ink/50">
                  NT$ {sheet.price} · {sheet.difficulty} · {sheet.genre} ·
                  已售 {sheet.salesCount}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-ink/60">
                  <input
                    type="checkbox"
                    checked={sheet.isPublished}
                    disabled={togglingId === sheet.id}
                    onChange={() => handleToggle(sheet)}
                  />
                  上架
                </label>
                <button
                  type="button"
                  onClick={() => startEdit(sheet)}
                  className="border border-ink/30 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink transition-colors hover:border-brass hover:text-brass"
                >
                  編輯
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(sheet.id)}
                  className="border border-ink/30 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink transition-colors hover:border-red-700 hover:text-red-700"
                >
                  刪除
                </button>
              </div>
            </div>
            {rowMessage[sheet.id] && (
              <p className="mt-2 font-mono text-[11px] text-red-700">
                {rowMessage[sheet.id]}
              </p>
            )}
          </li>
        ))}
        {sheets.length === 0 && (
          <li className="py-4 font-body text-sm text-ink/40">
            尚未新增任何樂譜商品
          </li>
        )}
      </ul>
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

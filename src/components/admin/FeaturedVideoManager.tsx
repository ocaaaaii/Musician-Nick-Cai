"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { FeaturedVideo, VideoPlatform } from "@prisma/client";
import {
  addFeaturedVideo,
  updateFeaturedVideo,
  deleteFeaturedVideo,
} from "@/app/admin/(protected)/profile/actions";

type Draft = {
  title: string;
  videoUrl: string;
  platform: VideoPlatform;
  sortOrder: number;
  isPublished: boolean;
};

function toDraft(video: FeaturedVideo): Draft {
  return {
    title: video.title,
    videoUrl: video.videoUrl,
    platform: video.platform,
    sortOrder: video.sortOrder,
    isPublished: video.isPublished,
  };
}

function PlatformSelect({
  value,
  onChange,
}: {
  value: VideoPlatform;
  onChange: (value: VideoPlatform) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as VideoPlatform)}
      className="border border-ink/20 bg-transparent px-2 py-1.5 font-body text-sm text-ink focus:border-brass focus:outline-none"
    >
      <option value="YOUTUBE">YouTube</option>
      <option value="INSTAGRAM">Instagram Reels</option>
    </select>
  );
}

export function FeaturedVideoManager({
  videos: initialVideos,
}: {
  videos: FeaturedVideo[];
}) {
  const router = useRouter();
  const [videos, setVideos] = useState(initialVideos);
  const [drafts, setDrafts] = useState<Record<string, Draft>>(
    Object.fromEntries(initialVideos.map((v) => [v.id, toDraft(v)]))
  );
  const [rowState, setRowState] = useState<
    Record<string, { saving?: boolean; error?: string }>
  >({});

  // Resyncs after router.refresh() brings in server-assigned data (new rows
  // get their id from the database, not from this client) - see handleAdd.
  useEffect(() => {
    setVideos(initialVideos);
    setDrafts(Object.fromEntries(initialVideos.map((v) => [v.id, toDraft(v)])));
  }, [initialVideos]);

  const [newDraft, setNewDraft] = useState<Draft>({
    title: "",
    videoUrl: "",
    platform: "YOUTUBE",
    sortOrder: videos.length,
    isPublished: true,
  });
  const [addError, setAddError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  function setDraft(id: string, patch: Partial<Draft>) {
    setDrafts((d) => ({ ...d, [id]: { ...d[id], ...patch } }));
  }

  async function saveRow(id: string) {
    const draft = drafts[id];
    setRowState((s) => ({ ...s, [id]: { saving: true } }));
    const result = await updateFeaturedVideo(id, draft);
    if (result.ok) {
      setVideos((vs) =>
        vs.map((v) => (v.id === id ? { ...v, ...draft } : v))
      );
      setRowState((s) => ({ ...s, [id]: {} }));
    } else {
      setRowState((s) => ({
        ...s,
        [id]: { error: result.message ?? "儲存失敗" },
      }));
    }
  }

  async function removeRow(id: string) {
    setRowState((s) => ({ ...s, [id]: { saving: true } }));
    const result = await deleteFeaturedVideo(id);
    if (result.ok) {
      setVideos((vs) => vs.filter((v) => v.id !== id));
      setDrafts((d) => {
        const next = { ...d };
        delete next[id];
        return next;
      });
    } else {
      setRowState((s) => ({
        ...s,
        [id]: { error: result.message ?? "刪除失敗" },
      }));
    }
  }

  async function handleAdd() {
    setAdding(true);
    setAddError(null);
    const result = await addFeaturedVideo(newDraft);
    if (result.ok) {
      setNewDraft({
        title: "",
        videoUrl: "",
        platform: "YOUTUBE",
        sortOrder: videos.length + 1,
        isPublished: true,
      });
      router.refresh();
    } else {
      setAddError(
        result.fieldErrors
          ? Object.values(result.fieldErrors)[0] === "required"
            ? "請填寫標題與影片連結"
            : "影片連結格式不正確"
          : "新增失敗，請稍後再試"
      );
    }
    setAdding(false);
  }

  return (
    <div className="space-y-6">
      <ul className="divide-y divide-ink/10">
        {videos.map((video) => {
          const draft = drafts[video.id];
          const state = rowState[video.id] ?? {};
          return (
            <li
              key={video.id}
              className="grid gap-2 py-4 sm:grid-cols-[120px_1fr_1fr_70px_auto_auto]"
            >
              <PlatformSelect
                value={draft.platform}
                onChange={(platform) => setDraft(video.id, { platform })}
              />
              <input
                type="text"
                value={draft.title}
                onChange={(e) => setDraft(video.id, { title: e.target.value })}
                placeholder="標題"
                className="border border-ink/20 bg-transparent px-2 py-1.5 font-body text-sm text-ink focus:border-brass focus:outline-none"
              />
              <input
                type="text"
                value={draft.videoUrl}
                onChange={(e) =>
                  setDraft(video.id, { videoUrl: e.target.value })
                }
                placeholder="影片連結"
                className="border border-ink/20 bg-transparent px-2 py-1.5 font-body text-sm text-ink focus:border-brass focus:outline-none"
              />
              <input
                type="number"
                value={draft.sortOrder}
                onChange={(e) =>
                  setDraft(video.id, { sortOrder: Number(e.target.value) })
                }
                className="border border-ink/20 bg-transparent px-2 py-1.5 font-body text-sm text-ink focus:border-brass focus:outline-none"
              />
              <label className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-ink/60">
                <input
                  type="checkbox"
                  checked={draft.isPublished}
                  onChange={(e) =>
                    setDraft(video.id, { isPublished: e.target.checked })
                  }
                />
                上架
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => saveRow(video.id)}
                  disabled={state.saving}
                  className="border border-ink/30 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink transition-colors hover:border-brass hover:text-brass disabled:opacity-50"
                >
                  儲存
                </button>
                <button
                  type="button"
                  onClick={() => removeRow(video.id)}
                  disabled={state.saving}
                  className="border border-ink/30 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink transition-colors hover:border-red-700 hover:text-red-700 disabled:opacity-50"
                >
                  刪除
                </button>
              </div>
              {state.error && (
                <p className="col-span-full font-mono text-[11px] text-red-700">
                  {state.error}
                </p>
              )}
            </li>
          );
        })}
        {videos.length === 0 && (
          <li className="py-4 font-body text-sm text-ink/40">
            尚未新增任何精選影片
          </li>
        )}
      </ul>

      <div className="border-t border-ink/15 pt-4">
        <p className="font-mono text-xs uppercase tracking-[0.1em] text-ink/60">
          新增影片
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-[120px_1fr_1fr_70px_auto]">
          <PlatformSelect
            value={newDraft.platform}
            onChange={(platform) =>
              setNewDraft((d) => ({ ...d, platform }))
            }
          />
          <input
            type="text"
            value={newDraft.title}
            onChange={(e) =>
              setNewDraft((d) => ({ ...d, title: e.target.value }))
            }
            placeholder="標題"
            className="border border-ink/20 bg-transparent px-2 py-1.5 font-body text-sm text-ink focus:border-brass focus:outline-none"
          />
          <input
            type="text"
            value={newDraft.videoUrl}
            onChange={(e) =>
              setNewDraft((d) => ({ ...d, videoUrl: e.target.value }))
            }
            placeholder="影片連結"
            className="border border-ink/20 bg-transparent px-2 py-1.5 font-body text-sm text-ink focus:border-brass focus:outline-none"
          />
          <input
            type="number"
            value={newDraft.sortOrder}
            onChange={(e) =>
              setNewDraft((d) => ({ ...d, sortOrder: Number(e.target.value) }))
            }
            className="border border-ink/20 bg-transparent px-2 py-1.5 font-body text-sm text-ink focus:border-brass focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={adding}
            className="border border-ink/30 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink transition-colors hover:border-brass hover:text-brass disabled:opacity-50"
          >
            {adding ? "新增中…" : "新增"}
          </button>
        </div>
        {addError && (
          <p className="mt-2 font-mono text-[11px] text-ink/60">{addError}</p>
        )}
      </div>
    </div>
  );
}

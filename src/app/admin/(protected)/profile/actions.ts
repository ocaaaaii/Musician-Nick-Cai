"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  validateProfileUpdate,
  validateFeaturedVideoInput,
  type ProfileUpdateInput,
  type FeaturedVideoInput,
  type LocalizedTextInput,
  type LocalizedStringArrayInput,
} from "@/lib/validation/profile";

// Trims every locale's value and drops empty ones (except "zh-TW", the
// required fallback source) before writing to the JSON column.
function cleanLocalizedText(input: LocalizedTextInput) {
  const result: Record<string, string> = { "zh-TW": input["zh-TW"].trim() };
  for (const [locale, value] of Object.entries(input)) {
    if (locale === "zh-TW" || !value?.trim()) continue;
    result[locale] = value.trim();
  }
  return result;
}

function cleanLocalizedStringArray(input: LocalizedStringArrayInput) {
  const result: Record<string, string[]> = { "zh-TW": input["zh-TW"] };
  for (const [locale, value] of Object.entries(input)) {
    if (locale === "zh-TW" || !value?.length) continue;
    result[locale] = value;
  }
  return result;
}

export type ActionResult =
  | { ok: true }
  | { ok: false; fieldErrors?: Record<string, string>; message?: string };

// Revalidates the homepage across every locale - see admin-profile's
// design.md, Goal "存檔成功後首頁下一次讀取 MUST 反映最新內容". Passing the
// [locale] layout's on-disk path with type "layout" invalidates the page
// for all locale values, not just one.
function revalidateHomepage() {
  revalidatePath("/[locale]", "layout");
}

export async function updateProfile(
  input: ProfileUpdateInput
): Promise<ActionResult> {
  const fieldErrors = validateProfileUpdate(input);
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  try {
    await prisma.profileConfig.update({
      where: { id: "site-config" },
      data: {
        heroTitle: cleanLocalizedText(input.heroTitle),
        heroSubtitle: cleanLocalizedText(input.heroSubtitle),
        aboutBio: cleanLocalizedText(input.aboutBio),
        styleTags: cleanLocalizedStringArray(input.styleTags),
        instagramUrl: input.instagramUrl?.trim() || null,
        youtubeUrl: input.youtubeUrl?.trim() || null,
        contactEmail: input.contactEmail?.trim() || null,
        calendlyUrl: input.calendlyUrl?.trim() || null,
      },
    });
    revalidateHomepage();
    return { ok: true };
  } catch {
    return { ok: false, message: "server_error" };
  }
}

export async function addFeaturedVideo(
  input: FeaturedVideoInput & { sortOrder: number }
): Promise<ActionResult> {
  const fieldErrors = validateFeaturedVideoInput(input);
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  try {
    await prisma.featuredVideo.create({
      data: {
        title: input.title.trim(),
        videoUrl: input.videoUrl.trim(),
        platform: input.platform,
        sortOrder: input.sortOrder,
      },
    });
    revalidateHomepage();
    return { ok: true };
  } catch {
    return { ok: false, message: "server_error" };
  }
}

export async function updateFeaturedVideo(
  id: string,
  input: FeaturedVideoInput & { sortOrder: number; isPublished: boolean }
): Promise<ActionResult> {
  const fieldErrors = validateFeaturedVideoInput(input);
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  try {
    await prisma.featuredVideo.update({
      where: { id },
      data: {
        title: input.title.trim(),
        videoUrl: input.videoUrl.trim(),
        platform: input.platform,
        sortOrder: input.sortOrder,
        isPublished: input.isPublished,
      },
    });
    revalidateHomepage();
    return { ok: true };
  } catch {
    return { ok: false, message: "server_error" };
  }
}

export async function deleteFeaturedVideo(id: string): Promise<ActionResult> {
  try {
    await prisma.featuredVideo.delete({ where: { id } });
    revalidateHomepage();
    return { ok: true };
  } catch {
    return { ok: false, message: "server_error" };
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  validateSheetMusicInput,
  type SheetMusicInput,
} from "@/lib/validation/sheet-music";

export type ActionResult =
  | { ok: true }
  | { ok: false; fieldErrors?: Record<string, string>; message?: string };

// Revalidates every locale under the front-of-site layout - /sheets and
// /sheets/[id] both live under it. Same approach as admin-profile's
// revalidateHomepage.
function revalidateSheetsRoutes() {
  revalidatePath("/[locale]", "layout");
}

export async function createSheetMusic(
  input: SheetMusicInput
): Promise<ActionResult> {
  const fieldErrors = validateSheetMusicInput(input);
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  try {
    await prisma.sheetMusic.create({
      data: {
        title: input.title.trim(),
        description: input.description?.trim() || null,
        price: input.price,
        difficulty: input.difficulty.trim(),
        genre: input.genre.trim(),
        key: input.key?.trim() || null,
        pdfFileKey: input.pdfFileKey.trim(),
        sampleImages: input.sampleImages,
        audioSampleUrl: input.audioSampleUrl.trim(),
      },
    });
    revalidateSheetsRoutes();
    return { ok: true };
  } catch {
    return { ok: false, message: "server_error" };
  }
}

export async function updateSheetMusic(
  id: string,
  input: SheetMusicInput
): Promise<ActionResult> {
  const fieldErrors = validateSheetMusicInput(input);
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  try {
    await prisma.sheetMusic.update({
      where: { id },
      data: {
        title: input.title.trim(),
        description: input.description?.trim() || null,
        price: input.price,
        difficulty: input.difficulty.trim(),
        genre: input.genre.trim(),
        key: input.key?.trim() || null,
        pdfFileKey: input.pdfFileKey.trim(),
        sampleImages: input.sampleImages,
        audioSampleUrl: input.audioSampleUrl.trim(),
      },
    });
    revalidateSheetsRoutes();
    return { ok: true };
  } catch {
    return { ok: false, message: "server_error" };
  }
}

export async function deleteSheetMusic(id: string): Promise<ActionResult> {
  try {
    const orderItemCount = await prisma.orderItem.count({
      where: { sheetMusicId: id },
    });
    if (orderItemCount > 0) {
      return { ok: false, message: "has_orders" };
    }

    await prisma.sheetMusic.delete({ where: { id } });
    revalidateSheetsRoutes();
    return { ok: true };
  } catch {
    return { ok: false, message: "server_error" };
  }
}

export async function toggleSheetMusicPublished(
  id: string,
  isPublished: boolean
): Promise<ActionResult> {
  try {
    await prisma.sheetMusic.update({
      where: { id },
      data: { isPublished },
    });
    revalidateSheetsRoutes();
    return { ok: true };
  } catch {
    return { ok: false, message: "server_error" };
  }
}

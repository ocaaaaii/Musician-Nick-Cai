"use server";

import { prisma } from "@/lib/prisma";
import {
  validateLessonInquiry,
  type LessonInquiryInput,
} from "@/lib/validation/lesson-inquiry";
import { isLikelyBot } from "@/lib/validation/anti-spam";

export type SubmitLessonInquiryResult =
  | { ok: true }
  | { ok: false; fieldErrors?: Record<string, string>; message?: string };

export async function submitLessonInquiry(
  input: LessonInquiryInput
): Promise<SubmitLessonInquiryResult> {
  const fieldErrors = validateLessonInquiry(input);
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  // Looks successful to the caller either way - see
  // openspec/changes/inquiry-spam-protection/design.md, Decision 2.
  if (isLikelyBot(input)) {
    return { ok: true };
  }

  try {
    await prisma.commission.create({
      data: {
        type: "LESSON",
        name: input.name.trim(),
        email: input.email.trim(),
        phone: input.phone?.trim() || null,
        details: input.details.trim(),
      },
    });
    return { ok: true };
  } catch {
    return { ok: false, message: "server_error" };
  }
}

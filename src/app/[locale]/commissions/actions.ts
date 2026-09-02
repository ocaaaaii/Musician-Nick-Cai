"use server";

import { prisma } from "@/lib/prisma";
import {
  validateCommissionInquiry,
  type CommissionInquiryInput,
} from "@/lib/validation/commission-inquiry";

export type SubmitCommissionInquiryResult =
  | { ok: true }
  | { ok: false; fieldErrors?: Record<string, string>; message?: string };

export async function submitCommissionInquiry(
  input: CommissionInquiryInput
): Promise<SubmitCommissionInquiryResult> {
  const fieldErrors = validateCommissionInquiry(input);
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  try {
    await prisma.commission.create({
      data: {
        type: input.type,
        name: input.name.trim(),
        email: input.email.trim(),
        phone: input.phone?.trim() || null,
        audioUrl: input.audioUrl?.trim() || null,
        details: input.details.trim(),
      },
    });
    return { ok: true };
  } catch {
    return { ok: false, message: "server_error" };
  }
}

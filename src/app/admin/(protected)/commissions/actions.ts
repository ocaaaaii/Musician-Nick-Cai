"use server";

import { prisma } from "@/lib/prisma";

export type ActionResult = { ok: true } | { ok: false; message: string };

export async function toggleCommissionHandled(
  id: string,
  isHandled: boolean
): Promise<ActionResult> {
  try {
    await prisma.commission.update({
      where: { id },
      data: { isHandled },
    });
    return { ok: true };
  } catch {
    return { ok: false, message: "server_error" };
  }
}

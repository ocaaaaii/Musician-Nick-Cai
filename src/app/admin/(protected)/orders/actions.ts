"use server";

import { prisma } from "@/lib/prisma";
import { createDownloadUrl } from "@/lib/r2";
import { sendDownloadEmail } from "@/lib/email";

export type ActionResult = { ok: true } | { ok: false; message: string };

export async function resendDownloadEmail(
  orderId: string
): Promise<ActionResult> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { orderItems: { include: { sheetMusic: true } } },
  });

  if (!order || order.status !== "SUCCESS") {
    return { ok: false, message: "not_eligible" };
  }

  try {
    const items = await Promise.all(
      order.orderItems.map(async (item) => ({
        title: item.sheetMusic.title,
        downloadUrl: await createDownloadUrl(item.sheetMusic.pdfFileKey),
      }))
    );

    const { error } = await sendDownloadEmail({
      to: order.userEmail,
      items,
    });
    if (error) {
      return { ok: false, message: "send_failed" };
    }

    return { ok: true };
  } catch {
    return { ok: false, message: "server_error" };
  }
}

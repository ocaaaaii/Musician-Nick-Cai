import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCheckMacValue } from "@/lib/ecpay";
import { createDownloadUrl } from "@/lib/r2";
import { sendDownloadEmail } from "@/lib/email";

function reject() {
  return new Response("0|Error", {
    headers: { "Content-Type": "text/plain" },
  });
}

function accept() {
  return new Response("1|OK", { headers: { "Content-Type": "text/plain" } });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const params: Record<string, string> = {};
  for (const [key, value] of Array.from(formData.entries())) {
    params[key] = String(value);
  }

  const hashKey = process.env.ECPAY_HASH_KEY!;
  const hashIV = process.env.ECPAY_HASH_IV!;

  // 1. Signature verification - see design.md Decision 2/3.
  if (!verifyCheckMacValue(params, hashKey, hashIV)) {
    return reject();
  }

  const merchantTradeNo = params.MerchantTradeNo;
  const order = await prisma.order.findUnique({
    where: { merchantTradeNo },
    include: { orderItems: { include: { sheetMusic: true } } },
  });
  if (!order) {
    return reject();
  }

  // 2. Amount verification - independent of the signature check, guards
  // against a replayed/tampered request that still carries a valid
  // signature for different (older) parameters.
  const tradeAmt = Number(params.TradeAmt);
  if (!Number.isFinite(tradeAmt) || tradeAmt !== order.totalAmount.toNumber()) {
    return reject();
  }

  if (params.RtnCode !== "1") {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "FAILED" },
    });
    return accept();
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "SUCCESS",
      tradeNo: params.TradeNo ?? null,
      paymentMethod: params.PaymentType ?? null,
    },
  });

  const items = await Promise.all(
    order.orderItems.map(async (item) => ({
      title: item.sheetMusic.title,
      downloadUrl: await createDownloadUrl(item.sheetMusic.pdfFileKey),
    }))
  );

  await sendDownloadEmail({ to: order.userEmail, items });

  return accept();
}

import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { buildEcpayFormFields } from "@/lib/ecpay";
import {
  validateCheckoutInput,
  type CheckoutPaymentMethod,
} from "@/lib/validation/checkout";

function refererLocaleBase(request: NextRequest): string {
  const referer = request.headers.get("referer");
  if (!referer) return "";
  try {
    const path = new URL(referer).pathname;
    const match = path.match(/^\/(en|ja|ko)(\/|$)/);
    return match ? `/${match[1]}` : "";
  } catch {
    return "";
  }
}

function generateMerchantTradeNo(): string {
  // ECPay requires alphanumeric, <=20 chars. Base36 timestamp + short
  // random suffix keeps this well under the limit while staying unique.
  return `${Date.now().toString(36)}${randomBytes(3).toString("hex")}`.slice(
    0,
    20
  );
}

// Auto-submitting form per design.md Decision 1 - ECPay requires the
// signed params to arrive as a POST body, which a plain redirect can't do.
function renderAutoSubmitForm(
  actionUrl: string,
  fields: Record<string, string | number>
): string {
  const inputs = Object.entries(fields)
    .map(
      ([name, value]) =>
        `<input type="hidden" name="${name}" value="${String(value).replace(/"/g, "&quot;")}" />`
    )
    .join("\n");

  return `<!doctype html>
<html><body>
<form id="ecpay-form" method="POST" action="${actionUrl}">
${inputs}
</form>
<script>document.getElementById("ecpay-form").submit();</script>
</body></html>`;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const sheetMusicId = String(formData.get("sheetMusicId") ?? "");
  const email = String(formData.get("email") ?? "");
  const paymentMethod = String(
    formData.get("paymentMethod") ?? ""
  ) as CheckoutPaymentMethod;

  const localeBase = refererLocaleBase(request);

  const fieldErrors = validateCheckoutInput({ email, paymentMethod });
  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.redirect(
      new URL(`${localeBase}/checkout/${sheetMusicId}?error=1`, request.url)
    );
  }

  const sheet = await prisma.sheetMusic.findUnique({
    where: { id: sheetMusicId },
  });
  if (!sheet || !sheet.isPublished) {
    return NextResponse.redirect(new URL(`${localeBase}/sheets`, request.url));
  }

  const merchantTradeNo = generateMerchantTradeNo();
  const totalAmount = sheet.price.toNumber();

  await prisma.order.create({
    data: {
      userEmail: email.trim(),
      totalAmount,
      status: "PENDING",
      merchantTradeNo,
      orderItems: {
        create: { sheetMusicId: sheet.id, price: sheet.price },
      },
    },
  });

  const fields = buildEcpayFormFields({
    merchantTradeNo,
    totalAmount,
    itemName: sheet.title,
    paymentMethod,
  });

  const html = renderAutoSubmitForm(process.env.ECPAY_CHECKOUT_URL!, fields);
  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

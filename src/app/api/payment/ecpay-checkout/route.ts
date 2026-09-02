import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildEcpayFormFields } from "@/lib/ecpay";
import {
  refererLocaleBase,
  generateMerchantTradeNo,
} from "@/lib/checkout-helpers";
import {
  validateCheckoutInput,
  type CheckoutPaymentMethod,
} from "@/lib/validation/checkout";

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
      provider: "ECPAY",
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

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { refererLocaleBase } from "@/lib/checkout-helpers";
import { validateCheckoutInput } from "@/lib/validation/checkout";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const sheetMusicId = String(formData.get("sheetMusicId") ?? "");
  const email = String(formData.get("email") ?? "");

  const localeBase = refererLocaleBase(request);

  // Stripe route doesn't have ECPay's payment-method sub-choice, so only
  // the email half of validateCheckoutInput is relevant here - pass a
  // placeholder valid value for the field this route doesn't use.
  const fieldErrors = validateCheckoutInput({ email, paymentMethod: "credit" });
  if (fieldErrors.email) {
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  const totalAmount = sheet.price.toNumber();

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          // TWD is a zero-decimal currency for Stripe - unit_amount is the
          // amount as-is, not multiplied by 100. See design.md Decision 3.
          currency: "twd",
          product_data: { name: sheet.title },
          unit_amount: Math.round(totalAmount),
        },
        quantity: 1,
      },
    ],
    customer_email: email.trim(),
    success_url: `${siteUrl}${localeBase}/checkout/success`,
    cancel_url: `${siteUrl}${localeBase}/checkout/${sheetMusicId}`,
  });

  if (!session.url) {
    return NextResponse.redirect(new URL(`${localeBase}/sheets`, request.url));
  }

  await prisma.order.create({
    data: {
      userEmail: email.trim(),
      totalAmount,
      status: "PENDING",
      provider: "STRIPE",
      merchantTradeNo: session.id,
      orderItems: {
        create: { sheetMusicId: sheet.id, price: sheet.price },
      },
    },
  });

  return NextResponse.redirect(session.url, 303);
}

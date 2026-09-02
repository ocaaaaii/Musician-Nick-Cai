import { NextRequest } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { createDownloadUrl } from "@/lib/r2";
import { sendDownloadEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  // Signature verification needs the exact raw bytes - must not be parsed
  // as JSON first. See design.md Decision 4.
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      rawBody,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return new Response("ok", { status: 200 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  const order = await prisma.order.findUnique({
    where: { merchantTradeNo: session.id },
    include: { orderItems: { include: { sheetMusic: true } } },
  });
  if (!order) {
    return new Response("ok", { status: 200 });
  }

  // Amount verification, independent of signature - see checkout-flow
  // design.md Decision 3, applied identically here.
  const amountMatches = session.amount_total === Math.round(order.totalAmount.toNumber());
  if (!amountMatches) {
    return new Response("Amount mismatch", { status: 400 });
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "SUCCESS",
      tradeNo: session.payment_intent?.toString() ?? null,
      paymentMethod: "stripe",
    },
  });

  const items = await Promise.all(
    order.orderItems.map(async (item) => ({
      title: item.sheetMusic.title,
      downloadUrl: await createDownloadUrl(item.sheetMusic.pdfFileKey),
    }))
  );

  await sendDownloadEmail({ to: order.userEmail, items });

  return new Response("ok", { status: 200 });
}

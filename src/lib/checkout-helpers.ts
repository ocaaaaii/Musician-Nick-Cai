import { randomBytes } from "crypto";
import type { NextRequest } from "next/server";

// Shared by both payment providers' checkout routes.

export function refererLocaleBase(request: NextRequest): string {
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

// ECPay-specific: MerchantTradeNo must be alphanumeric, <=20 chars. Only
// used by the ECPay route - Stripe's checkout route uses the Checkout
// Session's own session.id instead, so it needs no generator.
export function generateMerchantTradeNo(): string {
  return `${Date.now().toString(36)}${randomBytes(3).toString("hex")}`.slice(
    0,
    20
  );
}

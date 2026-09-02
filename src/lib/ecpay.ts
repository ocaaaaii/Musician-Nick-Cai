import { createHash } from "crypto";

// ECPay's CheckMacValue algorithm: sort params by key, build a query
// string, wrap with HashKey/HashIV, apply .NET-style URL encoding (lowercase
// hex, space -> '+', and a handful of characters restored to their literal
// form), then MD5 and uppercase. See design.md Decision 2 - this single
// function is shared by both signing (ecpay-checkout) and verifying
// (ecpay-callback) so the two can never drift apart.
function dotNetUrlEncode(value: string): string {
  return encodeURIComponent(value)
    .replace(/%20/g, "+")
    .toLowerCase()
    .replace(/%2d/g, "-")
    .replace(/%5f/g, "_")
    .replace(/%2e/g, ".")
    .replace(/%21/g, "!")
    .replace(/%2a/g, "*")
    .replace(/%28/g, "(")
    .replace(/%29/g, ")");
}

export function generateCheckMacValue(
  params: Record<string, string | number>,
  hashKey: string,
  hashIV: string
): string {
  const entries = Object.entries(params)
    .filter(([key]) => key !== "CheckMacValue")
    .sort(([a], [b]) => a.toLowerCase().localeCompare(b.toLowerCase()));

  const raw = entries.map(([key, value]) => `${key}=${value}`).join("&");
  const wrapped = `HashKey=${hashKey}&${raw}&HashIV=${hashIV}`;
  const encoded = dotNetUrlEncode(wrapped);

  // EncryptType: 1 (the only type ECPay's current API accepts) means
  // SHA256, not MD5 - this was wrong on the first pass and produced a
  // "CheckMacValue Error" from ECPay's sandbox. Confirmed against a
  // reference Node.js ECPay SDK implementation (mode=1 default).
  return createHash("sha256").update(encoded).digest("hex").toUpperCase();
}

export function verifyCheckMacValue(
  params: Record<string, string>,
  hashKey: string,
  hashIV: string
): boolean {
  const received = params.CheckMacValue;
  if (!received) return false;
  const expected = generateCheckMacValue(params, hashKey, hashIV);
  return received.toUpperCase() === expected;
}

function formatTradeDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

const CHOOSE_PAYMENT_MAP: Record<string, string> = {
  credit: "Credit",
  webatm: "WebATM",
  cvs: "CVS",
};

export function buildEcpayFormFields({
  merchantTradeNo,
  totalAmount,
  itemName,
  paymentMethod,
}: {
  merchantTradeNo: string;
  totalAmount: number;
  itemName: string;
  paymentMethod: keyof typeof CHOOSE_PAYMENT_MAP;
}) {
  const merchantId = process.env.ECPAY_MERCHANT_ID!;
  const hashKey = process.env.ECPAY_HASH_KEY!;
  const hashIV = process.env.ECPAY_HASH_IV!;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  const params: Record<string, string | number> = {
    MerchantID: merchantId,
    MerchantTradeNo: merchantTradeNo,
    MerchantTradeDate: formatTradeDate(new Date()),
    PaymentType: "aio",
    TotalAmount: Math.round(totalAmount),
    TradeDesc: "Sheet music purchase",
    ItemName: itemName,
    ReturnURL: `${siteUrl}/api/payment/ecpay-callback`,
    ChoosePayment: CHOOSE_PAYMENT_MAP[paymentMethod] ?? "ALL",
    ClientBackURL: `${siteUrl}/sheets`,
    EncryptType: 1,
  };

  const checkMacValue = generateCheckMacValue(params, hashKey, hashIV);

  return { ...params, CheckMacValue: checkMacValue };
}

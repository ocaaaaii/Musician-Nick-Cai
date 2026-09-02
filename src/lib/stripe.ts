import Stripe from "stripe";

// Lazily constructed - constructing eagerly at module load crashes
// Next.js's build-time "Collecting page data" step whenever
// STRIPE_SECRET_KEY is unset (it imports route modules without invoking
// them, but `new Stripe()` still throws on a missing key immediately).
let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (!cached) {
    cached = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return cached;
}

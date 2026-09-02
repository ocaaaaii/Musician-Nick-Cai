import { getTranslations } from "next-intl/server";

// Reached after a successful Stripe redirect. This page is purely
// informational - order fulfillment (marking SUCCESS, sending the
// download email) happens server-side via the webhook, never based on a
// buyer's browser landing here. See stripe-checkout design.md.
export default async function CheckoutSuccessPage() {
  const t = await getTranslations("checkout");

  return (
    <main className="mx-auto max-w-lg px-6 py-24 text-center">
      <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
        {t("successTitle")}
      </h1>
      <p className="mt-4 font-body text-sm text-ink/70">{t("successBody")}</p>
    </main>
  );
}

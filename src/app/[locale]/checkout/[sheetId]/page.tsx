import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ sheetId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { sheetId } = await params;
  const { error } = await searchParams;
  const t = await getTranslations("checkout");

  const sheet = await prisma.sheetMusic.findUnique({
    where: { id: sheetId },
  });

  if (!sheet || !sheet.isPublished) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-16 sm:py-20">
      <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
        {t("title")}
      </h1>

      <div className="mt-6 border-y border-ink/10 py-4">
        <p className="font-body text-sm text-ink">{sheet.title}</p>
        <p className="mt-1 font-mono text-sm text-ink/70">
          NT$ {sheet.price.toNumber().toLocaleString()}
        </p>
      </div>

      {error && (
        <p className="mt-6 font-mono text-xs text-red-700">
          {t("formError")}
        </p>
      )}

      <form
        method="POST"
        action="/api/payment/ecpay-checkout"
        className="mt-8 space-y-5"
      >
        <input type="hidden" name="sheetMusicId" value={sheet.id} />

        <div>
          <label className="block font-mono text-xs uppercase tracking-[0.1em] text-ink/60">
            Email
          </label>
          <input
            type="email"
            name="email"
            required
            className="mt-1.5 w-full border border-ink/20 bg-transparent px-3 py-2 font-body text-sm text-ink focus:border-brass focus:outline-none"
          />
        </div>

        <fieldset>
          <legend className="block font-mono text-xs uppercase tracking-[0.1em] text-ink/60">
            {t("paymentMethod")}
          </legend>
          <div className="mt-2 space-y-2">
            <label className="flex items-center gap-2 font-body text-sm text-ink">
              <input type="radio" name="paymentMethod" value="credit" defaultChecked />
              {t("credit")}
            </label>
            <label className="flex items-center gap-2 font-body text-sm text-ink">
              <input type="radio" name="paymentMethod" value="webatm" />
              {t("webatm")}
            </label>
            <label className="flex items-center gap-2 font-body text-sm text-ink">
              <input type="radio" name="paymentMethod" value="cvs" />
              {t("cvs")}
            </label>
          </div>
        </fieldset>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            formAction="/api/payment/ecpay-checkout"
            className="inline-flex items-center justify-center gap-2 bg-ink px-5 py-2.5 font-mono text-xs uppercase tracking-[0.15em] text-cream transition-colors hover:bg-brass"
          >
            {t("submit")}
          </button>
          <button
            type="submit"
            formAction="/api/payment/stripe-checkout"
            className="inline-flex items-center justify-center gap-2 border border-ink/30 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.15em] text-ink transition-colors hover:border-brass hover:text-brass"
          >
            {t("submitStripe")}
          </button>
        </div>
      </form>
    </main>
  );
}

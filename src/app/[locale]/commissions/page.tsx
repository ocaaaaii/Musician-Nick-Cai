import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { CommissionPackages } from "@/components/commissions/CommissionPackages";
import { CommissionInquiryForm } from "@/components/commissions/CommissionInquiryForm";

export default async function CommissionsPage() {
  const t = await getTranslations("commissions");
  const [transcriptionPackages, collaborationPackages] = await Promise.all([
    prisma.servicePackage.findMany({
      where: { type: "TRANSCRIPTION", isPublished: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.servicePackage.findMany({
      where: { type: "COLLABORATION", isPublished: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
      <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
        {t("title")}
      </h1>

      <section className="mt-10">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-ink/50">
          {t("transcriptionHeading")}
        </h2>
        <div className="mt-4">
          <CommissionPackages
            packages={transcriptionPackages}
            emptyText={t("transcriptionEmpty")}
          />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-ink/50">
          {t("collaborationHeading")}
        </h2>
        <div className="mt-4">
          <CommissionPackages
            packages={collaborationPackages}
            emptyText={t("collaborationEmpty")}
          />
        </div>
      </section>

      <div className="mt-16 border-t border-ink/10 pt-10">
        <CommissionInquiryForm />
      </div>
    </main>
  );
}

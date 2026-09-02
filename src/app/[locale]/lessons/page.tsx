import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { LessonPackages } from "@/components/lessons/LessonPackages";
import { CalendlyEmbed } from "@/components/lessons/CalendlyEmbed";
import { LessonInquiryForm } from "@/components/lessons/LessonInquiryForm";

export default async function LessonsPage() {
  const t = await getTranslations("lessons");
  const [packages, profile] = await Promise.all([
    prisma.servicePackage.findMany({
      where: { type: "LESSON", isPublished: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.profileConfig.findUnique({ where: { id: "site-config" } }),
  ]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
      <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
        {t("title")}
      </h1>

      <div className="mt-10">
        <LessonPackages packages={packages} />
      </div>

      <div className="mt-16 border-t border-ink/10 pt-10">
        {profile?.calendlyUrl ? (
          <CalendlyEmbed calendlyUrl={profile.calendlyUrl} />
        ) : (
          <LessonInquiryForm />
        )}
      </div>
    </main>
  );
}

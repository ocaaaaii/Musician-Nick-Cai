import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink/50">
        404
      </p>
      <h1 className="mt-4 font-display text-3xl font-semibold text-ink">
        {t("title")}
      </h1>
      <p className="mt-3 font-body text-sm text-ink/60">{t("body")}</p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 border border-ink/30 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.15em] text-ink transition-colors hover:border-brass hover:text-brass"
      >
        {t("backHome")}
      </Link>
    </main>
  );
}

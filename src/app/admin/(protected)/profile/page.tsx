import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/admin/ProfileForm";
import { FeaturedVideoManager } from "@/components/admin/FeaturedVideoManager";

export default async function AdminProfilePage() {
  const [profile, videos] = await Promise.all([
    prisma.profileConfig.findUniqueOrThrow({ where: { id: "site-config" } }),
    prisma.featuredVideo.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <main className="min-h-screen bg-paper px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/admin"
          className="font-mono text-xs uppercase tracking-[0.15em] text-ink/50 hover:text-brass"
        >
          ← 返回後台首頁
        </Link>

        <h1 className="mt-4 font-display text-2xl font-semibold text-ink">
          個人品牌與首頁
        </h1>

        <section className="mt-10">
          <h2 className="font-mono text-xs uppercase tracking-[0.15em] text-ink/50">
            品牌設定
          </h2>
          <div className="mt-4">
            <ProfileForm profile={profile} />
          </div>
        </section>

        <section className="mt-14 border-t border-ink/15 pt-10">
          <h2 className="font-mono text-xs uppercase tracking-[0.15em] text-ink/50">
            精選影片
          </h2>
          <div className="mt-4">
            <FeaturedVideoManager videos={videos} />
          </div>
        </section>
      </div>
    </main>
  );
}

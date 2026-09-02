import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// Auth gate for every /admin/* page except /admin/login. Route group
// "(protected)" doesn't affect the URL, so the dashboard still lives at
// /admin - only the login page (a sibling, outside this group) is exempt.
export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (dbUser?.role !== "ADMIN") {
    redirect("/admin/login");
  }

  return <>{children}</>;
}

import { prisma } from "@/lib/prisma";

// Single ADMIN-managed row, edited via /admin/profile - see
// openspec/changes/admin-profile/design.md, Decision 1 for why this isn't
// localized (site-wide content is one Chinese version, not per-locale).
export async function getProfileConfig() {
  return prisma.profileConfig.findUniqueOrThrow({
    where: { id: "site-config" },
  });
}

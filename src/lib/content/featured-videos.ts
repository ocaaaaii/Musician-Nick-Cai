import { prisma } from "@/lib/prisma";

export async function getFeaturedVideos() {
  return prisma.featuredVideo.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: "asc" },
  });
}

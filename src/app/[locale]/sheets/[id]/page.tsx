import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SheetMusicDetail } from "@/components/sheets/SheetMusicDetail";

export default async function SheetMusicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sheet = await prisma.sheetMusic.findUnique({ where: { id } });

  if (!sheet || !sheet.isPublished) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
      <SheetMusicDetail sheet={{ ...sheet, price: sheet.price.toNumber() }} />
    </main>
  );
}

import { prisma } from "@/lib/prisma";
import { SheetMusicBrowser } from "@/components/sheets/SheetMusicBrowser";

export default async function SheetsPage() {
  const sheets = await prisma.sheetMusic.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
  });

  // Prisma's Decimal isn't serializable across the Server -> Client
  // Component boundary as-is.
  const serialized = sheets.map((sheet) => ({
    ...sheet,
    price: sheet.price.toNumber(),
  }));

  return (
    <main className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <SheetMusicBrowser sheets={serialized} />
    </main>
  );
}

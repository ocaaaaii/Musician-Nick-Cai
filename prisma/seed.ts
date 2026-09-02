import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, CommissionType } from "@prisma/client";

// The CLI's `prisma db seed` loads prisma.config.ts first (which resolves
// DIRECT_URL), but this script's own PrismaClient still needs its own
// adapter per Prisma 7 - seeding runs against the same direct connection
// migrations use, not the pooled runtime DATABASE_URL.
const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // ProfileConfig is a fixed-id singleton (see schema.prisma) - upsert keeps
  // re-running the seed idempotent instead of erroring on the second run.
  await prisma.profileConfig.upsert({
    where: { id: "site-config" },
    update: {},
    create: {
      id: "site-config",
      heroTitle: "鋼琴家 Nick Cai",
      heroSubtitle: "編曲・採譜・鋼琴教學",
      aboutBio:
        "以流行改編與即興編曲見長的鋼琴演奏家，擅長將原曲重新詮釋為適合演出與教學的鋼琴版本。",
      styleTags: ["流行改編", "爵士即興", "動漫 OST"],
      instagramUrl: "https://instagram.com/example",
      contactEmail: "contact@example.com",
    },
  });

  const featuredVideo = await prisma.featuredVideo.findFirst({
    where: { youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
  });
  if (!featuredVideo) {
    await prisma.featuredVideo.create({
      data: {
        title: "示範演奏影片",
        youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        sortOrder: 0,
      },
    });
  }

  const sheetMusic = await prisma.sheetMusic.findFirst({
    where: { title: "示範樂譜" },
  });
  const resolvedSheetMusic =
    sheetMusic ??
    (await prisma.sheetMusic.create({
      data: {
        title: "示範樂譜",
        description: "用於本地開發測試的範例樂譜商品。",
        price: 150,
        difficulty: "Intermediate",
        genre: "Pop",
        key: "C Major",
        pdfFileKey: "private/sheets/sample.pdf",
        sampleImages: ["https://example.com/sample-preview.png"],
        audioSampleUrl: "https://example.com/sample-audio.mp3",
      },
    }));

  const servicePackages: Array<{
    type: CommissionType;
    title: string;
    priceInfo: string;
    description: string;
    sortOrder: number;
  }> = [
    {
      type: "TRANSCRIPTION",
      title: "流行單曲採譜",
      priceInfo: "NT$ 1,500 起",
      description: "依指定曲目製作鋼琴獨奏或伴奏譜。",
      sortOrder: 0,
    },
    {
      type: "LESSON",
      title: "一對一鋼琴教學",
      priceInfo: "每堂 NT$ 2,000",
      description: "適合各程度學生的一對一鋼琴課程。",
      sortOrder: 1,
    },
    {
      type: "COLLABORATION",
      title: "鋼琴合作／伴奏邀約",
      priceInfo: "依場次面議",
      description: "現場演出、樂團合作、歌手/樂器伴奏等鋼琴合作邀約，依場地與演出長度彈性報價。",
      sortOrder: 2,
    },
    {
      type: "COLLABORATION",
      title: "商業合作邀約",
      priceInfo: "面議",
      description: "商演、錄音室合作、品牌合作洽談。",
      sortOrder: 3,
    },
  ];
  for (const pkg of servicePackages) {
    const existing = await prisma.servicePackage.findFirst({
      where: { type: pkg.type, title: pkg.title },
    });
    if (!existing) {
      await prisma.servicePackage.create({ data: pkg });
    }
  }

  // NOTE: not seeding a `User` row here. RLS's is_admin() (see
  // supabase/rls-policies.sql) requires public."User".id to match a real
  // auth.users.id created via Supabase Auth - a seeded row with a random
  // uuid would satisfy "one row per table" but couldn't authenticate as
  // anyone. The first real admin User row gets created by the upcoming
  // `/admin/login` change once a Supabase Auth account exists to link to.

  const merchantTradeNo = "SEED0000000001";
  const existingOrder = await prisma.order.findUnique({
    where: { merchantTradeNo },
  });
  if (!existingOrder) {
    await prisma.order.create({
      data: {
        userEmail: "buyer@example.com",
        totalAmount: resolvedSheetMusic.price,
        status: "SUCCESS",
        paymentMethod: "CREDIT_CARD",
        merchantTradeNo,
        tradeNo: "SEEDTRADE0001",
        orderItems: {
          create: {
            sheetMusicId: resolvedSheetMusic.id,
            price: resolvedSheetMusic.price,
          },
        },
      },
    });
  }

  const existingCommission = await prisma.commission.findFirst({
    where: { email: "commission@example.com" },
  });
  if (!existingCommission) {
    await prisma.commission.create({
      data: {
        type: "TRANSCRIPTION",
        name: "測試委託人",
        email: "commission@example.com",
        details: "希望委託一首流行歌的鋼琴獨奏譜。",
      },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

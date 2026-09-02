/*
  Warnings:

  - You are about to drop the column `youtubeUrl` on the `FeaturedVideo` table. All the data in the column will be lost.
  - Added the required column `videoUrl` to the `FeaturedVideo` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VideoPlatform" AS ENUM ('YOUTUBE', 'INSTAGRAM');

-- AlterTable
ALTER TABLE "FeaturedVideo" DROP COLUMN "youtubeUrl",
ADD COLUMN     "platform" "VideoPlatform" NOT NULL DEFAULT 'YOUTUBE',
ADD COLUMN     "videoUrl" TEXT NOT NULL;

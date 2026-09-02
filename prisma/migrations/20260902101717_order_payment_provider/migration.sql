-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('ECPAY', 'STRIPE');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "provider" "PaymentProvider" NOT NULL DEFAULT 'ECPAY';

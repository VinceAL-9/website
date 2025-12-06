/*
  Warnings:

  - Changed the type of `category` on the `officers` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "OfficerCategory" AS ENUM ('EXEC', 'ADMIN', 'REP', 'FINANCE', 'AMBASSADOR');

-- AlterTable
ALTER TABLE "officers" DROP COLUMN "category",
ADD COLUMN     "category" "OfficerCategory" NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verificationToken" TEXT;

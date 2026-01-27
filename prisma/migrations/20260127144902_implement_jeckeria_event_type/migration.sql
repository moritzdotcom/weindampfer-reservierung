-- CreateEnum
CREATE TYPE "MinimumSpendMode" AS ENUM ('PerCapita', 'PerTable');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('WEINDAMPFER', 'JECKERIA');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "eventType" "EventType" NOT NULL DEFAULT 'WEINDAMPFER',
ADD COLUMN     "minimumSpendMode" "MinimumSpendMode" NOT NULL DEFAULT 'PerCapita';

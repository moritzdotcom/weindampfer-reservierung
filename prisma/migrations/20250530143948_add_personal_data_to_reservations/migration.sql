/*
  Warnings:

  - Made the column `occasion` on table `Reservation` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "city" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "phone" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "streetAddress" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "zipCode" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "occasion" SET NOT NULL,
ALTER COLUMN "occasion" SET DEFAULT '';

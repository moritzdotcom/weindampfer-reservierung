-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "minimumSpendPremium" INTEGER,
ADD COLUMN     "ticketPricePremium" INTEGER;

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "isPremium" BOOLEAN NOT NULL DEFAULT false;

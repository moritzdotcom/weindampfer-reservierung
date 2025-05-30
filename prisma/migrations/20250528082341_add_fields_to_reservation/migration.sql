-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "notified" TIMESTAMP(3),
ADD COLUMN     "payed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentReminderSent" TIMESTAMP(3);

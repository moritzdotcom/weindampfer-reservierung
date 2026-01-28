import {
  reservationMinimumSpendPrice,
  reservationTicketPrice,
} from '@/lib/reservation';
import { MinimumSpendMode } from '@/prisma/generated/client';
import { Box } from '@mui/material';

type EventProp = {
  minimumSpend: number;
  ticketPrice: number;
  minimumSpendPremium: number | null;
  ticketPricePremium: number | null;
  minimumSpendMode: MinimumSpendMode;
};
export default function ReservationCostSummary({
  personCount,
  ticketsNeeded,
  isPremium = false,
  minimumSpendLabel = 'Mindestverzehr',
  event,
}: {
  personCount: number;
  ticketsNeeded: boolean;
  isPremium?: boolean;
  minimumSpendLabel?: string;
  event: EventProp;
}) {
  const {
    minimumSpend,
    ticketPrice,
    minimumSpendPremium,
    ticketPricePremium,
    minimumSpendMode,
  } = event;

  const totalMinimumSpend = reservationMinimumSpendPrice({
    people: personCount,
    isPremium,
    event,
  });
  const totalTicketCost = reservationTicketPrice({
    people: personCount,
    ticketsNeeded,
    isPremium,
    event,
  });

  const totalCost = totalMinimumSpend + totalTicketCost;

  return (
    <Box
      className="p-4 rounded"
      bgcolor={(theme) => theme.palette.background.paper}
    >
      <h2 className="text-lg font-semibold">Kostenübersicht</h2>
      <div className="flex flex-col gap-2 mt-2">
        <div className="flex justify-between">
          {minimumSpendMode === 'PerCapita' ? (
            <span>
              {minimumSpendLabel} (
              {isPremium ? minimumSpendPremium : minimumSpend} € x {personCount}{' '}
              Personen):
            </span>
          ) : (
            <span>
              {minimumSpendLabel} (
              {isPremium ? minimumSpendPremium : minimumSpend} € pro Tisch):
            </span>
          )}
          <span className="whitespace-nowrap">{totalMinimumSpend} €</span>
        </div>
        {ticketsNeeded && (
          <div className="flex justify-between">
            <span>
              Tickets ({personCount} x{' '}
              {isPremium ? ticketPricePremium : ticketPrice} €):
            </span>
            <span className="whitespace-nowrap">{totalTicketCost} €</span>
          </div>
        )}
        <div className="border-t-2 border-neutral-400 pt-3 mt-2 flex justify-between font-bold">
          <span>Gesamtpreis:</span>
          <span className="whitespace-nowrap">{totalCost} €</span>
        </div>
      </div>
    </Box>
  );
}

import { MinimumSpendMode } from '@/generated/prisma';
import { Box } from '@mui/material';

export default function ReservationCostSummary({
  personCount,
  ticketsNeeded,
  minimumSpend,
  ticketPrice,
  minimumSpendMode,
}: {
  personCount: number;
  ticketsNeeded: boolean;
  minimumSpend: number;
  ticketPrice: number;
  minimumSpendMode: MinimumSpendMode;
}) {
  const totalMinimumSpend =
    minimumSpendMode === 'PerCapita'
      ? personCount * minimumSpend
      : minimumSpend;
  const totalTicketCost = ticketsNeeded ? personCount * ticketPrice : 0;
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
              Mindestverzehr ({minimumSpend} € x {personCount} Personen):
            </span>
          ) : (
            <span>Mindestverzehr ({minimumSpend} € pro Tisch):</span>
          )}
          <span className="whitespace-nowrap">{totalMinimumSpend} €</span>
        </div>
        {ticketsNeeded && (
          <div className="flex justify-between">
            <span>
              Tickets ({personCount} x {ticketPrice} €):
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

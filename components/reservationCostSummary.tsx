export default function ReservationCostSummary({
  personCount,
  ticketsNeeded,
  minimumSpend,
  ticketPrice,
}: {
  personCount: number;
  ticketsNeeded: boolean;
  minimumSpend: number;
  ticketPrice: number;
}) {
  const totalMinimumSpend = personCount * minimumSpend;
  const totalTicketCost = ticketsNeeded ? personCount * ticketPrice : 0;
  const totalCost = totalMinimumSpend + totalTicketCost;

  return (
    <div className="p-4 bg-neutral-700 rounded">
      <h2 className="text-lg font-semibold">Kostenübersicht</h2>
      <div className="flex flex-col gap-2 mt-2">
        <div className="flex justify-between">
          <span>
            Mindestverzehr ({minimumSpend} € x {personCount} Personen):
          </span>
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
          <span>Gesamtkosten:</span>
          <span className="whitespace-nowrap">{totalCost} €</span>
        </div>
      </div>
    </div>
  );
}

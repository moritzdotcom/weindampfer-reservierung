import { ConfirmationState } from '@/generated/prisma';

export function translateState(state: ConfirmationState) {
  if (state == 'REQUESTED') return 'Offen';
  if (state == 'CANCELLED') return 'Abgelehnt';
  if (state == 'CONFIRMED') return 'Bestätigt';
}

export function translateStateAdj(state: ConfirmationState) {
  if (state == 'REQUESTED') return 'offenen';
  if (state == 'CANCELLED') return 'abgelehnten';
  if (state == 'CONFIRMED') return 'bestätigten';
}

export function fullReservationPrice(reservation: {
  people: number;
  ticketsNeeded: boolean;
  event: { minimumSpend: number; ticketPrice: number };
}): number {
  const { event, people, ticketsNeeded } = reservation;
  if (!event.minimumSpend) return 0;
  return (
    people * (event.minimumSpend + (ticketsNeeded ? event.ticketPrice : 0))
  );
}

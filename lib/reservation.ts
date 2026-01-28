import { MinimumSpendMode, ConfirmationState } from '@/prisma/generated/client';

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
  isPremium: boolean;
  event: {
    minimumSpend: number;
    ticketPrice: number;
    minimumSpendMode: MinimumSpendMode;
    minimumSpendPremium: number | null;
    ticketPricePremium: number | null;
  };
}): number {
  return (
    reservationMinimumSpendPrice(reservation) +
    reservationTicketPrice(reservation)
  );
}

export function reservationMinimumSpendPrice(reservation: {
  people: number;
  isPremium: boolean;
  event: {
    minimumSpendMode: MinimumSpendMode;
    minimumSpend: number;
    minimumSpendPremium: number | null;
  };
}): number {
  const { event, people, isPremium } = reservation;

  if (isPremium && event.minimumSpendPremium !== null) {
    if (event.minimumSpendMode === 'PerCapita') {
      return people * event.minimumSpendPremium;
    } else {
      return event.minimumSpendPremium;
    }
  } else {
    if (event.minimumSpendMode === 'PerCapita') {
      return people * event.minimumSpend;
    } else {
      return event.minimumSpend;
    }
  }
}

export function reservationTicketPrice(reservation: {
  people: number;
  ticketsNeeded: boolean;
  isPremium: boolean;
  event: {
    ticketPrice: number;
    ticketPricePremium: number | null;
  };
}): number {
  const { event, people, ticketsNeeded, isPremium } = reservation;
  if (isPremium && event.ticketPricePremium !== null) {
    return ticketsNeeded ? people * event.ticketPricePremium : 0;
  } else {
    return ticketsNeeded ? people * event.ticketPrice : 0;
  }
}

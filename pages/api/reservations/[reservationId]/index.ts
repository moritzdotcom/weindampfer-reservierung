import { Prisma } from '@/generated/prisma';
import sendReservationDeclinedMail from '@/lib/mailer/reservationDeclinedMail';
import prisma from '@/lib/prismadb';
import { getServerSession } from '@/lib/session';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req);
  if (!session) return res.status(401).json('Not authenticated');

  const { reservationId } = req.query;
  if (typeof reservationId !== 'string')
    return res.status(401).json('Reservation required');

  if (req.method === 'PUT') {
    await handlePUT(req, res, reservationId);
  } else {
    throw new Error(
      `The HTTP ${req.method} method is not supported at this route.`
    );
  }
}

export type ApiPutReservationResponse = Prisma.ReservationGetPayload<{}>;

async function handlePUT(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string
) {
  const {
    confirmationState,
    tableNumber,
    payed,
    name,
    email,
    phone,
    streetAddress,
    city,
    zipCode,
    people,
    occasion,
    ticketsNeeded,
    tableType,
  } = req.body;

  const reservation = await prisma.reservation.update({
    data: {
      confirmationState,
      tableNumber,
      payed,
      name,
      email,
      phone,
      streetAddress,
      city,
      zipCode,
      people,
      occasion,
      ticketsNeeded,
      tableType,
    },
    where: { id },
    include: {
      event: {
        select: {
          date: true,
        },
      },
    },
  });

  if (confirmationState === 'CANCELLED' && !reservation.cancellationMailSent) {
    await sendReservationDeclinedMail(
      reservation.email,
      reservation.name,
      reservation.people.toString(),
      reservation.event.date.toLocaleDateString('de-DE')
    );
    await prisma.reservation.update({
      where: { id },
      data: { cancellationMailSent: true },
    });
  }

  return res.json(reservation);
}

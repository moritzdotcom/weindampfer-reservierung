import { Prisma } from '@/generated/prisma';
import sendReservationConfirmationMail from '@/lib/mailer/reservationConfirmationMail';
import prisma from '@/lib/prismadb';
import { getServerSession } from '@/lib/session';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req);
  if (!session) return res.status(401).json('Not authenticated');

  if (req.method === 'POST') {
    await handlePOST(req, res);
  } else {
    throw new Error(
      `The HTTP ${req.method} method is not supported at this route.`
    );
  }
}

export type ApiPostReservationResponse = Prisma.ReservationGetPayload<{
  include: {
    event: {
      select: {
        date: true;
      };
    };
  };
}>;

async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
  const { name, email, people, ticketsNeeded, occasion, eventId, tableType } =
    req.body;

  if (typeof name !== 'string') return res.status(400).json('Name is required');
  if (typeof email !== 'string')
    return res.status(400).json('Email is required');
  if (typeof people !== 'number')
    return res.status(400).json('Person count is required');
  if (typeof ticketsNeeded !== 'boolean')
    return res.status(400).json('Need tickets is required');
  if (typeof eventId !== 'string')
    return res.status(400).json('Event ID is required');
  if (typeof occasion !== 'string')
    return res.status(400).json('Occasion is required');

  const reservation = await prisma.reservation.create({
    data: {
      name,
      email,
      people,
      ticketsNeeded,
      occasion,
      tableType,
      event: { connect: { id: eventId } },
    },
    include: {
      event: {
        select: {
          date: true,
        },
      },
    },
  });

  await sendReservationConfirmationMail(
    email,
    name,
    people,
    reservation.event.date.toLocaleDateString('de-DE')
  );

  return res.json(reservation);
}

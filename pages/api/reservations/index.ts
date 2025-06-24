import { Prisma } from '@/generated/prisma';
import sendReservationConfirmationMail from '@/lib/mailer/reservationConfirmationMail';
import prisma from '@/lib/prismadb';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
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
  const {
    name,
    email,
    people,
    ticketsNeeded,
    occasion,
    eventId,
    phone,
    streetAddress,
    tableType,
    city,
    zipCode,
  } = req.body;

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
  if (typeof phone !== 'string')
    return res.status(400).json('Phone number is required');
  if (typeof streetAddress !== 'string')
    return res.status(400).json('Street address is required');
  if (typeof city !== 'string') return res.status(400).json('City is required');
  if (typeof zipCode !== 'string')
    return res.status(400).json('Zip code is required');

  const reservation = await prisma.reservation.create({
    data: {
      name,
      email,
      people,
      ticketsNeeded,
      occasion,
      phone,
      streetAddress,
      tableType,
      city,
      zipCode,
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

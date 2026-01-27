import { Prisma } from '@/generated/prisma';
import sendReservationConfirmationMail from '@/lib/mailer/reservationConfirmationMail';
import prisma from '@/lib/prismadb';
import { getServerSession } from '@/lib/session';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    await handleGET(req, res);
  } else if (req.method === 'POST') {
    await handlePOST(req, res);
  } else {
    throw new Error(
      `The HTTP ${req.method} method is not supported at this route.`,
    );
  }
}

export type ApiGetReservationsResponse = Prisma.ReservationGetPayload<{
  include: {
    event: true;
  };
}>[];

async function handleGET(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req);
  if (!session) return res.status(401).json('Not authenticated');

  const reservations = await prisma.reservation.findMany({});
  const events = await prisma.event.findMany();

  const reservationsWithEvent = reservations.map((reservation) => {
    const event = events.find((e) => e.id === reservation.eventId);
    return {
      ...reservation,
      event,
    };
  });
  return res.json(reservationsWithEvent);
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
    drinkPackage,
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
      drinkPackage,
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
          eventType: true,
        },
      },
    },
  });

  await sendReservationConfirmationMail(
    email,
    name,
    people,
    reservation.event.date.toLocaleDateString('de-DE'),
    reservation.event.eventType,
  );

  return res.json(reservation);
}

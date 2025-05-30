import { Prisma } from '@/generated/prisma';
import prisma from '@/lib/prismadb';
import { getServerSession } from '@/lib/session';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req);
  if (!session) return res.status(401).json('Not authenticated');
  const { eventId } = req.query;
  if (typeof eventId !== 'string')
    return res.status(400).json('Event ID is required');

  if (req.method === 'GET') {
    await handleGET(req, res, eventId);
  } else {
    throw new Error(
      `The HTTP ${req.method} method is not supported at this route.`
    );
  }
}

export type ApiGetReservationsResponse = Prisma.ReservationGetPayload<{
  include: {
    event: {
      select: {
        minimumSpend: true;
        ticketPrice: true;
      };
    };
  };
}>[];

async function handleGET(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string
) {
  const reservations = await prisma.reservation.findMany({
    where: { eventId: id },
    include: {
      event: {
        select: {
          minimumSpend: true,
          ticketPrice: true,
        },
      },
    },
  });
  return res.json(reservations);
}

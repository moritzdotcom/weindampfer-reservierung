import sendReservationChangeEventMail from '@/lib/mailer/reservationChangeEventMail';
import prisma from '@/lib/prismadb';
import { getServerSession } from '@/lib/session';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getServerSession(req);
  if (!session) return res.status(401).json('Not authenticated');

  const { reservationId } = req.query;
  if (typeof reservationId !== 'string')
    return res.status(401).json('Reservation required');

  if (req.method === 'POST') {
    await handlePOST(req, res, reservationId);
  } else {
    throw new Error(
      `The HTTP ${req.method} method is not supported at this route.`,
    );
  }
}

async function handlePOST(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string,
) {
  const { eventId } = req.body;

  const oldEvent = (
    await prisma.reservation.findFirst({
      where: { id },
      select: { event: { select: { id: true, date: true } } },
    })
  )?.event;
  if (!oldEvent) return res.status(404).json({ error: 'No Reservation Found' });
  if (eventId === oldEvent.id)
    return res.status(401).json({ error: 'Cannot Move to same Event' });

  const reservation = await prisma.reservation.update({
    where: { id },
    data: {
      eventId,
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

  await sendReservationChangeEventMail(
    reservation.email,
    reservation.name,
    reservation.people,
    oldEvent.date.toLocaleDateString('de-DE'),
    reservation.event.date.toLocaleDateString('de-DE'),
    reservation.event.eventType,
  );

  return res.json(reservation);
}

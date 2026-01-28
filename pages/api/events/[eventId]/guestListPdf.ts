import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prismadb';
import { getServerSession } from '@/lib/session';
import renderWeindampferPDF from '@/lib/pdf/weindampfer';
import renderJeckeriaPDF from '@/lib/pdf/jeckeria';

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getServerSession(req);
  if (!session) return res.status(401).json('Not authenticated');
  const { eventId } = req.query;
  if (typeof eventId !== 'string')
    return res.status(401).json('Event required');

  if (req.method === 'GET') {
    await handleGET(req, res, eventId);
  } else {
    throw new Error(
      `The HTTP ${req.method} method is not supported at this route.`,
    );
  }
}

async function handleGET(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string,
) {
  const event = await prisma.event.findFirst({
    where: { id },
    include: {
      reservations: {
        where: { confirmationState: 'CONFIRMED' },
      },
    },
  });

  if (!event) return res.status(404).json('Event not found');

  if (event.eventType === 'WEINDAMPFER') {
    return renderWeindampferPDF(res, event);
  } else if (event.eventType === 'JECKERIA') {
    return renderJeckeriaPDF(res, event);
  } else {
    return res.status(400).json('Invalid event type');
  }
}

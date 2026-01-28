import { Prisma } from '@/prisma/generated/client';
import prisma from '@/lib/prismadb';
import { getServerSession } from '@/lib/session';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getServerSession(req);
  if (!session) return res.status(401).json('Not authenticated');
  const { eventId } = req.query;
  if (typeof eventId !== 'string')
    return res.status(400).json('Event ID is required');

  if (req.method === 'PUT') {
    await handlePUT(req, res, eventId);
  } else {
    throw new Error(
      `The HTTP ${req.method} method is not supported at this route.`,
    );
  }
}

export type ApiPutEventResponse = Prisma.EventGetPayload<{}>;

async function handlePUT(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string,
) {
  const event = await prisma.event.update({
    where: { id },
    data: {
      name: req.body.name,
      date: req.body.date ? new Date(req.body.date) : undefined,
      minimumSpend: req.body.minimumSpend,
      eventType: req.body.eventType,
      minimumSpendMode: req.body.minimumSpendMode,
      ticketPrice: req.body.ticketPrice,
      minimumSpendPremium: req.body.minimumSpendPremium,
      ticketPricePremium: req.body.ticketPricePremium,
    },
  });
  return res.json(event);
}

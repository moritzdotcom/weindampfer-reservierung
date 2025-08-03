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

  if (req.method === 'GET') {
    await handleGET(req, res);
  } else if (req.method === 'POST') {
    await handlePOST(req, res);
  } else {
    throw new Error(
      `The HTTP ${req.method} method is not supported at this route.`
    );
  }
}

export type ApiGetEventsResponse = Prisma.EventGetPayload<{}>[];

async function handleGET(req: NextApiRequest, res: NextApiResponse) {
  const oneWeekAgo = new Date(new Date().getTime() - 604800000);
  const events = await prisma.event.findMany({
    where: { date: { gte: oneWeekAgo } },
  });
  return res.json(events);
}

export type ApiPostEventResponse = Prisma.EventGetPayload<{}>;

async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
  const { name, date, minimumSpend, ticketPrice } = req.body;
  if (!name || !date) return res.status(400).json('Name and date are required');

  const event = await prisma.event.create({
    data: {
      name,
      date: new Date(date),
      minimumSpend,
      ticketPrice,
    },
  });
  return res.json(event);
}

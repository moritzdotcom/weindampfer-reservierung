import sendReservationMail from '@/lib/mailer/reservationMail';
import prisma from '@/lib/prismadb';
import { fullReservationPrice } from '@/lib/reservation';
import { getServerSession } from '@/lib/session';
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
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
      `The HTTP ${req.method} method is not supported at this route.`
    );
  }
}

async function handlePOST(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string
) {
  const reservation = await prisma.reservation.update({
    where: { id },
    data: {
      notified: new Date(),
    },
    include: {
      event: {
        select: {
          date: true,
          minimumSpend: true,
          ticketPrice: true,
        },
      },
    },
  });

  let attachments: {
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }[] = [];
  if (reservation.invoiceUrl) {
    const { data, error } = await supabase.storage
      .from('invoices')
      .download(reservation.invoiceUrl);

    if (error) {
      console.error('Error downloading invoice:', error);
      return res.status(500).json({ error: 'Error downloading invoice' });
    }

    const arrayBuffer = await data.arrayBuffer();
    const content = Buffer.from(arrayBuffer);
    attachments.push({
      filename: `Rechnung-Weindampfer.pdf`,
      content: content,
      contentType: 'application/pdf',
    });
  }

  await sendReservationMail(
    reservation.email,
    reservation.name,
    String(reservation.people),
    reservation.event.date.toLocaleDateString('de-DE'),
    fullReservationPrice(reservation),
    attachments
  );

  return res.json(reservation);
}

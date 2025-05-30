import { NextApiRequest, NextApiResponse } from 'next';
import PDFDocument from 'pdfkit';
import prisma from '@/lib/prismadb';
import { getServerSession } from '@/lib/session';
import fs from 'fs';
import path from 'path';
import { fullEventName } from '@/lib/event';

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
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
      `The HTTP ${req.method} method is not supported at this route.`
    );
  }
}

async function handleGET(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string
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

  const doc = new PDFDocument({ margin: 40 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename=gaesteliste.pdf');
  doc.pipe(res);

  // Logo
  const logoPath = path.resolve('./public/logo-black.png');
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, doc.page.width / 2 - 100, 40, { width: 200 });
  }
  doc.moveDown(6);

  doc
    .fontSize(18)
    .text(`Gästeliste ${fullEventName(event)}`, { align: 'center' });
  doc.moveDown(2);

  // Tabelle
  const tableTop = doc.y;
  // const colWidths = [230, 80, 100, 90];
  const colWidths = [
    ((doc.page.width - 80) / 100) * 48,
    ((doc.page.width - 80) / 100) * 15,
    ((doc.page.width - 80) / 100) * 20,
    ((doc.page.width - 80) / 100) * 17,
  ];
  const headers = ['Name', 'Personen', 'Tischnummer', 'Eingecheckt'];

  // Header-Zeile zeichnen
  let x = 40;
  headers.forEach((text, i) => {
    doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .fillColor('black')
      .text(text, x + 4, tableTop, {
        width: colWidths[i],
        align: 'left',
      });
    x += colWidths[i];
  });

  // Vertikale Linien + Inhalte
  event.reservations
    .sort((a, b) => (a.tableNumber || '').localeCompare(b.tableNumber || ''))
    .forEach((r, idx) => {
      const rowTop = tableTop + 28 + idx * 40;
      const values = [r.name, r.people.toString(), r.tableNumber || '', ''];

      // Horizontale Linie oben
      doc
        .moveTo(40, rowTop - 5)
        .lineTo(40 + colWidths.reduce((a, b) => a + b, 0), rowTop - 5)
        .strokeColor('#000000')
        .stroke();

      // Inhalte mit vertikalen Linien
      let xPos = 40;
      values.forEach((text, i) => {
        doc
          .font('Helvetica')
          .fontSize(14)
          .fillColor('black')
          .text(text, xPos + 6, rowTop + 8, {
            width: colWidths[i] - 8,
            align: 'left',
          });

        xPos += colWidths[i];
      });
    });

  // horizontale Linie unter letzter Zeile
  const endY = tableTop + 28 + event.reservations.length * 40 - 5;
  doc
    .moveTo(40, endY)
    .lineTo(40 + colWidths.reduce((a, b) => a + b, 0), endY)
    .strokeColor('#000000')
    .stroke();

  doc.moveDown(4);
  doc.end();
}

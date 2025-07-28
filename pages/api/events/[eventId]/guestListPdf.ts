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

type TableItem = { text: string; align: 'left' | 'right'; color?: string };

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
    doc.image(logoPath, doc.page.width / 2 - 100, 20, { width: 200 });
  }
  doc.moveDown(5);

  doc
    .fontSize(18)
    .text(`Gästeliste ${fullEventName(event)}`, { align: 'center' });
  doc.moveDown(1);

  // Tabelle
  const tableTop = doc.y;
  // const colWidths = [230, 80, 100, 90];
  const colWidths = [
    ((doc.page.width - 80) / 100) * 38,
    ((doc.page.width - 80) / 100) * 15,
    ((doc.page.width - 80) / 100) * 20,
    ((doc.page.width - 80) / 100) * 17,
    ((doc.page.width - 80) / 100) * 10,
  ];
  const headers: TableItem[] = [
    { text: 'Name', align: 'left' },
    { text: 'Personen', align: 'right' },
    { text: 'Tischnummer', align: 'right' },
    { text: 'Eingecheckt', align: 'right' },
    { text: 'MVZ', align: 'right' },
  ];

  // Header-Zeile zeichnen
  let x = 40;
  headers.forEach(({ text, align }, i) => {
    doc
      .font('Helvetica-Bold')
      .fontSize(13)
      .fillColor('black')
      .text(text, x, tableTop, {
        width: colWidths[i],
        align,
      });
    x += colWidths[i];
  });

  // Vertikale Linien + Inhalte
  event.reservations
    .sort((a, b) => (a.tableNumber || '').localeCompare(b.tableNumber || ''))
    .forEach((r, idx) => {
      const rowTop = tableTop + 28 + idx * 32;
      const values: TableItem[] = [
        // HIER ICON
        { text: `${r.name} (${r.payed ? 'bezahlt' : 'offen'})`, align: 'left' },
        { text: r.people.toString(), align: 'right' },
        { text: r.tableNumber || '', align: 'right' },
        { text: '', align: 'left' },
        {
          text: `${event.minimumSpend * r.people} €`,
          align: 'right',
          color: r.payed ? 'green' : 'red',
        },
      ];

      // Horizontale Linie oben
      doc
        .moveTo(40, rowTop - 5)
        .lineTo(40 + colWidths.reduce((a, b) => a + b, 0), rowTop - 5)
        .strokeColor('#000000')
        .stroke();

      // Inhalte mit vertikalen Linien
      let xPos = 40;
      values.forEach(({ text, align, color }, i) => {
        doc
          .font('Helvetica')
          .fontSize(12)
          .fillColor(color || 'black')
          .text(text, xPos + 6, rowTop + 7, {
            width: colWidths[i] - 8,
            align,
          });

        xPos += colWidths[i];
      });
    });

  // horizontale Linie unter letzter Zeile
  const endY = tableTop + 28 + event.reservations.length * 32 - 5;
  doc
    .moveTo(40, endY)
    .lineTo(40 + colWidths.reduce((a, b) => a + b, 0), endY)
    .strokeColor('#000000')
    .stroke();

  doc.moveDown(3);
  const boatLayout = path.resolve('./public/rheinfaehre-layout.jpg');
  if (fs.existsSync(boatLayout)) {
    doc.image(boatLayout, 50, doc.y, {
      width: doc.page.width - 100,
    });
  }
  doc.end();
}

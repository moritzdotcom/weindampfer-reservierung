// /pages/api/upload-invoice.ts
import { supabase } from '@/lib/supabase';
import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import prisma from '@/lib/prismadb';

export const config = {
  api: {
    bodyParser: false, // wichtig für Datei-Upload
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { reservationId } = req.query;
  if (typeof reservationId !== 'string') {
    return res.status(400).json({ error: 'Ungültige Reservation ID.' });
  }
  const form = formidable({});

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Fehler beim Parsen der Datei:', err);
      return res.status(500).json({ error: 'Fehler beim Parsen der Datei.' });
    }

    const file = files.file?.[0];
    if (!file || file.mimetype !== 'application/pdf') {
      return res
        .status(400)
        .json({ error: 'Ungültige Datei. Bitte eine PDF hochladen.' });
    }
    const data = fs.readFileSync(file.filepath);

    const { data: uploadedFile, error } = await supabase.storage
      .from('invoices')
      .upload(`reservations/${reservationId}.pdf`, data, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (error) {
      console.error('Fehler beim Hochladen der Datei:', error);
      return res.status(500).json({ error: error.message });
    }

    // in DB verknüpfen
    await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        invoiceUrl: uploadedFile.path,
      },
    });

    res.status(200).json({ invoiceUrl: uploadedFile.path });
  });
}

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase'; // dein Supabase-Client mit Service Role Key

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { path } = req.query;

  if (!path || typeof path !== 'string') {
    return res.status(400).json({ error: 'Pfad zur Rechnung fehlt.' });
  }

  const { data, error } = await supabase.storage
    .from('invoices')
    .createSignedUrl(path, 60 * 60); // gültig für 1 Stunde

  console.log({ data, error });
  if (error || !data?.signedUrl) {
    return res
      .status(500)
      .json({ error: 'Konnte Signatur-URL nicht erstellen.' });
  }

  return res.status(200).json({ url: data.signedUrl });
}

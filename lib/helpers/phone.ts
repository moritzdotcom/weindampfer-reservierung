export function normalizePhoneForWhatsApp(phone?: string | null) {
  if (!phone) return null;

  let normalized = phone.trim();

  // Alles außer Zahlen und + entfernen
  normalized = normalized.replace(/[^\d+]/g, '');

  // Deutsche Nummern wie 0170... zu 49170...
  if (normalized.startsWith('0')) {
    normalized = `49${normalized.slice(1)}`;
  }

  // +49170... zu 49170...
  if (normalized.startsWith('+')) {
    normalized = normalized.slice(1);
  }

  // 0049170... zu 49170...
  if (normalized.startsWith('00')) {
    normalized = normalized.slice(2);
  }

  return normalized || null;
}

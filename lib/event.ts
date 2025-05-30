export function formatEventDate(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function fullEventName(event: { name: string; date: Date | string }) {
  return `${event.name} - ${formatEventDate(event.date)}`;
}

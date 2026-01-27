import { Event } from '@/generated/prisma';
import { fullEventName } from '@/lib/event';
import {
  CssBaseline,
  Dialog,
  DialogContent,
  MenuItem,
  TextField,
  ThemeProvider,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import ReservationFormWeindampfer from './reservationFormWeindampfer';
import ReservationFormJeckeria from './reservationFormJeckeria';
import { jeckeriaTheme, weindampferTheme } from '@/theme';

export default function ReservationForm({ events }: { events: Event[] }) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    events.length > 0
      ? events.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        )[0].id
      : null,
  );
  const [showSuccess, setShowSuccess] = useState(false);

  const selectedEvent = events.find((event) => event.id === selectedEventId);

  const pageTheme = useMemo(
    () =>
      selectedEvent?.eventType === 'JECKERIA'
        ? jeckeriaTheme
        : weindampferTheme,
    [selectedEvent],
  );

  return (
    <ThemeProvider theme={pageTheme}>
      <CssBaseline />
      <div className="max-w-3xl mx-auto p-6">
        <div>
          <RenderEventTypeImage event={selectedEvent} />
          <h4 className="text-2xl sm:text-3xl font-extralight font-cocogoose text-center">
            Tischreservierung
          </h4>
          {events.length == 1 && (
            <p className="text-center text-lg text-gray-300 mt-2 mb-8">
              {fullEventName(events[0])}
            </p>
          )}
        </div>
        {/* Select Event Dropdown */}
        {events.length === 0 ? (
          <div className="text-center text-xl text-gray-200 my-20">
            Keine zukünftigen Veranstaltungen gefunden.
            <br />
            Bitte versuche es später noch einmal.
          </div>
        ) : showSuccess ? (
          <div></div>
        ) : (
          <div>
            <RenderEventTypeText event={selectedEvent} />

            {events.length > 1 && (
              <div className="my-12">
                <TextField
                  select
                  label="Veranstaltung wählen"
                  fullWidth
                  value={selectedEventId || ''}
                  onChange={(e) => {
                    setSelectedEventId(e.target.value);
                  }}
                >
                  {events.map((event) => (
                    <MenuItem key={event.id} value={event.id}>
                      {fullEventName(event)}
                    </MenuItem>
                  ))}
                </TextField>
              </div>
            )}
            <RenderEventTypeForm
              event={selectedEvent}
              onSuccess={() => setShowSuccess(true)}
            />
          </div>
        )}
      </div>
      <SuccessDialog open={showSuccess} onClose={() => setShowSuccess(false)} />
    </ThemeProvider>
  );
}

function SuccessDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose}>
      <h2 className="font-cocogoose font-light text-black px-5 pt-5 text-xl text-center">
        Buchungsanfrage gesendet
      </h2>
      <DialogContent>
        <h4 className="text-lg text-gray-800">
          Vielen Dank! Deine Anfrage wurde übermittelt. Du erhältst in Kürze
          eine Rückmeldung von uns.
          <br />
          <br />
          <b>Wichtig: Deine Reservierung ist noch nicht bestätigt.</b>
        </h4>
      </DialogContent>
      <div className="w-full flex justify-center items-center px-6 pb-6 mt-2">
        <button
          className="w-full rounded py-2 bg-gray-300 text-gray-900 hover:bg-gray-400 transition"
          onClick={onClose}
        >
          Weitere Reservierung
        </button>
      </div>
    </Dialog>
  );
}

function RenderEventTypeForm({
  event,
  onSuccess,
}: {
  event: Event | undefined;
  onSuccess: () => void;
}) {
  if (!event) return null;

  switch (event.eventType) {
    case 'WEINDAMPFER':
      return <ReservationFormWeindampfer event={event} onSuccess={onSuccess} />;
    case 'JECKERIA':
      return <ReservationFormJeckeria event={event} onSuccess={onSuccess} />;
    default:
      return null;
  }
}

function RenderEventTypeImage({ event }: { event: Event | undefined }) {
  if (!event)
    return (
      <img
        src="/logo-white.png"
        className="mx-auto h-20 my-12"
        alt="Weindampfer"
      />
    );

  switch (event.eventType) {
    case 'WEINDAMPFER':
      return (
        <img
          src="/logo-white.png"
          className="mx-auto h-20 my-12"
          alt="Weindampfer"
        />
      );
    case 'JECKERIA':
      return (
        <img src="/jeckeria.jpg" className="mx-auto my-12" alt="Jeckeria" />
      );
    default:
      return (
        <img
          src="/logo-white.png"
          className="mx-auto h-20 my-12"
          alt="Weindampfer"
        />
      );
  }
}

function RenderEventTypeText({ event }: { event: Event | undefined }) {
  if (!event) return null;

  switch (event.eventType) {
    case 'WEINDAMPFER':
      return (
        <div className="text-neutral-400 leading-relaxed text-base sm:text-lg mt-8">
          <p className="text-white text-xl font-semibold block mb-2">
            Willkommen an Bord, liebe Weindampfer-Gäste!
          </p>
          Hier könnt ihr ganz einfach euren Tisch für unsere Events reservieren
          - perfekt für Gruppen, die stilvoll feiern wollen.
          <br />
          <br />
          <p className="text-white font-medium">
            Eure Vorteile auf einen Blick:
          </p>
          <ul className="list-disc list-outside ml-4 mt-2 mb-4">
            <li>Eigener Tisch & reservierter Bereich</li>
            <li>Persönlicher Tischkellner</li>
            <li>Schnellerer Einlass über den VIP-Check-In</li>
            <li>Garantierte Tickets für die gesamte Gruppe</li>
          </ul>
          <p className="text-white font-medium">
            So läuft die Reservierung ab:
          </p>
          <ul className="list-disc list-outside ml-4 mt-2 mb-4">
            <li>Formular ausfüllen & absenden</li>
            <li>Wir prüfen eure Anfrage und bestätigen sie per Mail</li>
            <li>Ihr erhaltet eine Rechnung - Zahlung innerhalb von 7 Tagen</li>
            <li>
              Nach Geldeingang erhaltet ihr eure finalen Unterlagen / Tickets
            </li>
            <li>Am Eventtag: Kommt vorbei & genießt die Fahrt!</li>
          </ul>
          Wir freuen uns auf euch!
          <br />
          <p className="mt-4 block">Euer Weindampfer-Team</p>
        </div>
      );
    case 'JECKERIA':
      return (
        <div className="text-neutral-400 leading-relaxed text-base sm:text-lg mt-8">
          <Typography fontWeight={500} fontSize={20} color="primary">
            Helau, ihr Jecken!
          </Typography>
          Hier könnt ihr ganz einfach euren Tisch für die Jeckeria reservieren -
          perfekt für Gruppen, die stilvoll feiern wollen.
          <br />
          <br />
          <Typography fontWeight={500} fontSize={18} color="primary">
            Eure Vorteile auf einen Blick:
          </Typography>
          <ul className="list-disc list-outside ml-4 mt-2 mb-4">
            <li>Eigener Tisch & reservierter Bereich</li>
            <li>Persönlicher Tischkellner</li>
            <li>Schnellerer Einlass über den VIP-Check-In</li>
            <li>Garantierte Tickets für die gesamte Gruppe</li>
          </ul>
          <Typography fontWeight={500} fontSize={18} color="primary">
            So läuft die Reservierung ab:
          </Typography>
          <ul className="list-disc list-outside ml-4 mt-2 mb-4">
            <li>Formular ausfüllen & absenden</li>
            <li>Wir prüfen eure Anfrage und bestätigen sie per Mail</li>
            <li>Ihr erhaltet eine Rechnung - Zahlung innerhalb von 7 Tagen</li>
            <li>
              Nach Geldeingang erhaltet ihr eure finalen Unterlagen / Tickets
            </li>
          </ul>
          Wir freuen uns auf euch!
          <br />
          <p className="mt-4 block">Euer Jeckeria-Team</p>
        </div>
      );
    default:
      return null;
  }
}

import { Event } from '@/generated/prisma';
import { fullEventName } from '@/lib/event';
import {
  Dialog,
  DialogContent,
  Divider,
  MenuItem,
  TextField,
} from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import ARGBConfirmation from './argbConfirmation';
import ReservationCostSummary from './reservationCostSummary';

export default function ReservationForm({ events }: { events: Event[] }) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    events.length > 0
      ? events.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0].id
      : null
  );
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [personCount, setPersonCount] = useState('');
  const [tableType, setTableType] = useState('Stehtisch');
  const [ticketsNeeded, setTicketsNeeded] = useState('yes');
  const [occasion, setOccasion] = useState('');
  const [phone, setPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [argbChecked, setArgbChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errorObj, setErrorObj] = useState({
    name: '',
    email: '',
    personCount: '',
    ticketsNeeded: '',
    submit: '',
    occasion: '',
    phone: '',
    streetAddress: '',
    city: '',
    zipCode: '',
  });

  const [formDirty, setFormDirty] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const resetErrorObj = () => {
    setErrorObj({
      name: '',
      email: '',
      personCount: '',
      ticketsNeeded: '',
      submit: '',
      occasion: '',
      phone: '',
      streetAddress: '',
      city: '',
      zipCode: '',
    });
  };

  const validateInputs = () => {
    let errorOccured = false;
    resetErrorObj();

    if (email) {
      if (!validateEmail(email)) {
        errorOccured = true;
        setErrorObj((prev) => ({ ...prev, email: 'Ungültige E-Mail-Adresse' }));
      }
    } else {
      errorOccured = true;
      setErrorObj((prev) => ({
        ...prev,
        email: 'E-Mail darf nicht leer sein',
      }));
    }
    if (Number(personCount) < 1 || Number(personCount) > 25) {
      errorOccured = true;
      setErrorObj((prev) => ({
        ...prev,
        personCount: 'Anzahl muss zwischen 1 und 25 liegen',
      }));
    }
    if (!name) {
      errorOccured = true;
      setErrorObj((prev) => ({ ...prev, name: 'Name darf nicht leer sein' }));
    }
    if (!ticketsNeeded) {
      errorOccured = true;
      setErrorObj((prev) => ({
        ...prev,
        ticketsNeeded: 'Bitte wähle eine Option',
      }));
    }
    if (!occasion) {
      errorOccured = true;
      setErrorObj((prev) => ({
        ...prev,
        occasion: 'Anlass darf nicht leer sein',
      }));
    }
    if (!argbChecked) {
      errorOccured = true;
      setErrorObj((prev) => ({
        ...prev,
        submit: 'Bitte bestätige die ARGB-Bedingungen',
      }));
    }
    if (!phone) {
      errorOccured = true;
      setErrorObj((prev) => ({
        ...prev,
        phone: 'Telefonnummer darf nicht leer sein',
      }));
    }
    if (!streetAddress) {
      errorOccured = true;
      setErrorObj((prev) => ({
        ...prev,
        streetAddress: 'Straße und Hausnummer dürfen nicht leer sein',
      }));
    }
    if (!city) {
      errorOccured = true;
      setErrorObj((prev) => ({
        ...prev,
        city: 'Stadt darf nicht leer sein',
      }));
    }
    if (!zipCode) {
      errorOccured = true;
      setErrorObj((prev) => ({
        ...prev,
        zipCode: 'Postleitzahl darf nicht leer sein',
      }));
    }
    return !errorOccured;
  };

  const onSubmit = async () => {
    setFormDirty(true);
    if (!validateInputs()) return;
    setLoading(true);
    try {
      await axios.post('/api/reservations', {
        eventId: selectedEventId,
        name,
        email,
        people: Number(personCount),
        tableType,
        ticketsNeeded: ticketsNeeded === 'yes',
        occasion,
        phone,
        streetAddress,
        city,
        zipCode,
      });
      // Reset form after successful submission
      resetErrorObj();
      setName('');
      setEmail('');
      setPersonCount('');
      setTableType('Stehtisch');
      setTicketsNeeded('yes');
      setOccasion('');
      setPhone('');
      setStreetAddress('');
      setCity('');
      setZipCode('');
      setFormDirty(false);
      setShowSuccess(true);
      setArgbChecked(false);
    } catch (error) {
      setErrorObj((prev) => ({
        ...prev,
        submit:
          'Fehler beim Senden der Reservierung. Bitte versuche es später erneut.',
      }));
    }
    setLoading(false);
  };

  const selectedEvent = events.find((event) => event.id === selectedEventId);

  useEffect(() => {
    if (formDirty) validateInputs();
  }, [name, email, personCount, ticketsNeeded]);

  return (
    <>
      <div className="max-w-3xl mx-auto p-6">
        <div>
          <img
            src="/logo-white.png"
            alt="Weindampfer Logo"
            className="mx-auto h-20 my-12"
          />
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
            <div>
              <div className="flex flex-col gap-7">
                <Divider
                  sx={{
                    ':before': { borderColor: 'var(--color-neutral-500)' },
                    ':after': { borderColor: 'var(--color-neutral-500)' },
                    fontSize: '1.2rem',
                  }}
                >
                  Persönliche Daten
                </Divider>
                <TextField
                  fullWidth
                  label="Name"
                  autoComplete="name"
                  required
                  error={Boolean(errorObj.name)}
                  helperText={errorObj.name}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <TextField
                  fullWidth
                  label="E-Mail"
                  autoComplete="email"
                  required
                  value={email}
                  error={Boolean(errorObj.email)}
                  helperText={errorObj.email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                  fullWidth
                  label="Telefonnummer"
                  autoComplete="tel"
                  required
                  value={phone}
                  error={Boolean(errorObj.phone)}
                  helperText={errorObj.phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <TextField
                  fullWidth
                  label="Straße und Hausnummer"
                  autoComplete="street-address"
                  required
                  value={streetAddress}
                  error={Boolean(errorObj.streetAddress)}
                  helperText={errorObj.streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                />
                <div className="flex gap-4 mb-8">
                  <TextField
                    fullWidth
                    label="Postleitzahl"
                    autoComplete="postal-code"
                    required
                    value={zipCode}
                    error={Boolean(errorObj.zipCode)}
                    helperText={errorObj.zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                  />
                  <TextField
                    fullWidth
                    label="Stadt"
                    autoComplete="address-level2"
                    required
                    value={city}
                    error={Boolean(errorObj.city)}
                    helperText={errorObj.city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <Divider
                  sx={{
                    ':before': { borderColor: 'var(--color-neutral-500)' },
                    ':after': { borderColor: 'var(--color-neutral-500)' },
                    fontSize: '1.2rem',
                  }}
                >
                  Angaben zur Reservierung
                </Divider>
                <TextField
                  label="Anzahl Personen"
                  type="number"
                  required
                  error={Boolean(errorObj.personCount)}
                  helperText={errorObj.personCount}
                  slotProps={{ htmlInput: { min: 1, max: 25 } }}
                  value={personCount}
                  onChange={(e) => setPersonCount(e.target.value)}
                  fullWidth
                />
                <TextField
                  select
                  label="Tischart wählen"
                  fullWidth
                  value={tableType}
                  onChange={(e) => {
                    setTableType(e.target.value);
                  }}
                >
                  <MenuItem value="Stehtisch">
                    Stehtisch auf der Tanzfläche
                  </MenuItem>
                  <MenuItem value="Empore">Tisch auf der Empore</MenuItem>
                </TextField>
                <TextField
                  select
                  label="Benötigst du Tickets?"
                  value={ticketsNeeded}
                  onChange={(e) => setTicketsNeeded(e.target.value)}
                  fullWidth
                  error={Boolean(errorObj.ticketsNeeded)}
                  helperText={errorObj.ticketsNeeded}
                >
                  <MenuItem value="yes">Ja</MenuItem>
                  <MenuItem value="no">Nein (Habe schon welche)</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  label="Anlass"
                  value={occasion}
                  required
                  error={Boolean(errorObj.occasion)}
                  helperText={errorObj.occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  placeholder="z.B. Geburtstag, Jubiläum, etc."
                />
                <ReservationCostSummary
                  personCount={Number(personCount)}
                  ticketsNeeded={ticketsNeeded === 'yes'}
                  minimumSpend={selectedEvent?.minimumSpend || 0}
                  ticketPrice={selectedEvent?.ticketPrice || 0}
                />
                <ARGBConfirmation onChecked={setArgbChecked} />
                <div>
                  {errorObj.submit && (
                    <div className="text-red-500 text-sm mb-2 text-center">
                      {errorObj.submit}
                    </div>
                  )}
                  <button
                    onClick={onSubmit}
                    className="w-full bg-white hover:bg-gray-100 text-black font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={
                      !name ||
                      !email ||
                      !personCount ||
                      !argbChecked ||
                      !occasion ||
                      !phone ||
                      !streetAddress ||
                      !city ||
                      !zipCode ||
                      loading
                    }
                  >
                    {loading ? 'Sende Anfrage...' : 'Reservierung anfragen'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <SuccessDialog open={showSuccess} onClose={() => setShowSuccess(false)} />
    </>
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

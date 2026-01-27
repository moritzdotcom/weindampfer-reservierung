import { Event } from '@/generated/prisma';
import { Divider, MenuItem, TextField } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import ARGBConfirmation from './argbConfirmation';
import ReservationCostSummary from './reservationCostSummary';

export default function ReservationFormWeindampfer({
  event,
  onSuccess,
}: {
  event: Event;
  onSuccess: () => void;
}) {
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
    if (Number(personCount) < 6 || Number(personCount) > 25) {
      errorOccured = true;
      setErrorObj((prev) => ({
        ...prev,
        personCount: 'Anzahl muss zwischen 6 und 25 liegen',
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
        eventId: event.id,
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
      setArgbChecked(false);
      onSuccess();
    } catch (error) {
      setErrorObj((prev) => ({
        ...prev,
        submit:
          'Fehler beim Senden der Reservierung. Bitte versuche es später erneut.',
      }));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (formDirty) validateInputs();
  }, [
    name,
    email,
    personCount,
    tableType,
    ticketsNeeded,
    occasion,
    phone,
    streetAddress,
    city,
    zipCode,
    argbChecked,
  ]);

  return (
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
          slotProps={{ htmlInput: { min: 6, max: 25 } }}
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
          <MenuItem value="Stehtisch">Stehtisch auf der Tanzfläche</MenuItem>
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
          minimumSpend={event?.minimumSpend || 0}
          ticketPrice={event?.ticketPrice || 0}
          minimumSpendMode={event?.minimumSpendMode || 'PerCapita'}
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
  );
}

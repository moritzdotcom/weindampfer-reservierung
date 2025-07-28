import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Session } from '@/hooks/useSession';
import { ApiGetEventsResponse } from '../api/events';
import BackendBackButton from '@/components/backendBackButton';
import { Divider, MenuItem, TextField, Typography } from '@mui/material';
import { fullEventName } from '@/lib/event';

export default function BackendFriendsAndFamilyPage({
  session,
}: {
  session: Session;
}) {
  const router = useRouter();
  const [events, setEvents] = useState<ApiGetEventsResponse>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [personCount, setPersonCount] = useState('');
  const [tableType, setTableType] = useState('Stehtisch');
  const [ticketsNeeded, setTicketsNeeded] = useState('yes');
  const [occasion, setOccasion] = useState(
    `Friends & Family - Eingeladen von ${session.user.name}`
  );

  const [errorObj, setErrorObj] = useState({
    name: '',
    email: '',
    personCount: '',
    ticketsNeeded: '',
    submit: '',
    occasion: '',
  });

  const [loading, setLoading] = useState(false);
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

    return !errorOccured;
  };

  const onSubmit = async () => {
    setFormDirty(true);
    if (!validateInputs()) return;
    setLoading(true);
    try {
      await axios.post('/api/reservations/friendsAndFamily', {
        eventId: selectedEventId,
        name,
        email,
        people: Number(personCount),
        tableType,
        ticketsNeeded: ticketsNeeded === 'yes',
        occasion,
      });
      // Reset form after successful submission
      resetErrorObj();
      setName('');
      setEmail('');
      setPersonCount('');
      setTableType('Stehtisch');
      setTicketsNeeded('yes');
      setOccasion(`Friends & Family - Eingeladen von ${session.user.name}`);
      setFormDirty(false);
      setShowSuccess(true);
    } catch (error) {
      setErrorObj((prev) => ({
        ...prev,
        submit:
          'Fehler beim Senden der Reservierung. Bitte versuche es später erneut.',
      }));
    }
    setLoading(false);
  };

  const selectedEvent = useMemo(
    () => events.filter((e) => e.id == selectedEventId)[0],
    [selectedEventId, events]
  );

  useEffect(() => {
    if (!router.isReady) return;
    if (session.status === 'unauthenticated') {
      router.push('/backend/login');
    }
  }, [session.status, router.isReady]);

  useEffect(() => {
    axios
      .get('/api/events')
      .then(({ data }: { data: ApiGetEventsResponse }) => {
        setEvents(data);
        if (data.length == 1) {
          setSelectedEventId(data[0].id);
        } else {
          setSelectedEventId(
            data.sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            )[0].id
          );
        }
      });
  }, []);

  useEffect(() => {
    if (formDirty) validateInputs();
  }, [name, email, personCount, tableType, ticketsNeeded, occasion]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <BackendBackButton />
      <Typography variant="h4" textAlign="center" gutterBottom>
        Friends & Family Reservierung
      </Typography>

      <div className="my-7 flex flex-col sm:flex-row items-center gap-5">
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

      <Divider
        sx={{
          ':before': { borderColor: 'var(--color-neutral-500)' },
          ':after': { borderColor: 'var(--color-neutral-500)' },
          fontSize: '1.2rem',
        }}
      >
        Persönliche Daten
      </Divider>

      <div className="mt-5 flex flex-col gap-7">
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
          label="Tickets benötigt?"
          value={ticketsNeeded}
          onChange={(e) => setTicketsNeeded(e.target.value)}
          fullWidth
          error={Boolean(errorObj.ticketsNeeded)}
          helperText={errorObj.ticketsNeeded}
        >
          <MenuItem value="yes">Ja</MenuItem>
          <MenuItem value="no">Nein</MenuItem>
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
        <div>
          {errorObj.submit && (
            <div className="text-red-500 text-sm mb-2 text-center">
              {errorObj.submit}
            </div>
          )}
          <button
            onClick={onSubmit}
            className="w-full bg-white hover:bg-gray-100 text-black font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!name || !email || !personCount || !occasion || loading}
          >
            {loading ? 'Senden...' : 'Reservierung erstellen'}
          </button>
        </div>
      </div>
    </div>
  );
}

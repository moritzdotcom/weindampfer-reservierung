import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Skeleton,
  InputAdornment,
  MenuItem,
} from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/router';
import { Session } from '@/hooks/useSession';
import { ApiGetEventsResponse } from '../api/events';
import { ApiPutEventResponse } from '../api/events/[eventId]';
import { formatEventDate } from '@/lib/event';
import { Check, CopyAll, Edit } from '@mui/icons-material';
import BackendBackButton from '@/components/backendBackButton';
import { EventType, MinimumSpendMode } from '@/prisma/generated/client';

export default function BackendEventsPage({ session }: { session: Session }) {
  const [events, setEvents] = useState<ApiGetEventsResponse>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchEvents = async () => {
    const res = await axios.get<ApiGetEventsResponse>('/api/events');
    const sorted = res.data.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    setLoading(false);
    setEvents(sorted);
  };

  const updateEvents = (event: ApiPutEventResponse) => {
    setEvents((prev) => prev.map((e) => (e.id == event.id ? event : e)));
  };

  useEffect(() => {
    setLoading(true);
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    if (session.status === 'unauthenticated') {
      router.push('/backend/login');
    }
  }, [session.status, router.isReady]);

  return (
    <Box className="max-w-5xl mx-auto px-4 py-8">
      <BackendBackButton />
      <Box className="flex flex-col sm:flex-row gap-3 justify-between items-center mb-6">
        <h4 className="text-3xl text-center">Veranstaltungen verwalten</h4>
        <button
          className="rounded-full bg-gray-100 text-gray-900 px-6 py-2 text-sm font-medium shadow-sm hover:bg-gray-300 transition"
          onClick={() => setCreateDialogOpen(true)}
        >
          Neue Veranstaltung erstellen
        </button>
      </Box>
      {loading && (
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Skeleton variant="rounded" height={164} sx={{ borderRadius: 4 }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Skeleton variant="rounded" height={164} sx={{ borderRadius: 4 }} />
          </Grid>
        </Grid>
      )}
      <Grid container spacing={4}>
        {events.map((event) => (
          <EventCard key={event.id} event={event} onUpdate={updateEvents} />
        ))}
      </Grid>

      <NewEventDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={fetchEvents}
      />
    </Box>
  );
}

function EventCard({
  event,
  onUpdate,
}: {
  event: ApiGetEventsResponse[number];
  onUpdate: (event: ApiGetEventsResponse[number]) => void;
}) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/${event.id}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 4000);
    });
  };

  return (
    <Grid size={{ xs: 12, sm: 6 }}>
      <Box className="rounded-2xl bg-gray-100 border border-gray-200 p-6">
        <div className="mb-2">
          <h6 className="text-xl font-semibold text-gray-900">{event.name}</h6>
        </div>
        <p className="text-sm text-gray-700 mb-2">
          Datum: {formatEventDate(event.date)}
        </p>
        <p className="text-sm text-gray-700 mb-2">
          Mindestverzehr: {event.minimumSpend} €
        </p>
        <p className="text-sm text-gray-700 mb-2">
          Ticketpreis: {event.ticketPrice} €
        </p>
        <div className="flex justify-between flex-wrap gap-2 mt-4">
          <button
            onClick={() => setEditDialogOpen(true)}
            className="w-full px-4 py-2 rounded bg-neutral-600 text-base text-white hover:bg-neutral-800 transition flex items-center justify-center gap-2"
          >
            <Edit fontSize="small" />
            <p>Bearbeiten</p>
          </button>
          <button
            onClick={handleCopyLink}
            disabled={copiedLink}
            className={
              'w-full px-4 py-2 rounded text-base text-white transition flex items-center justify-center gap-2' +
              (copiedLink
                ? ' bg-emerald-600 hover:bg-emerald-700'
                : ' bg-sky-600 hover:bg-sky-800')
            }
          >
            {copiedLink ? (
              <Check fontSize="small" />
            ) : (
              <CopyAll fontSize="small" />
            )}
            <p>{copiedLink ? 'Link Kopiert!' : 'Reservierungslink kopieren'}</p>
          </button>
        </div>
      </Box>
      <EditEventDialog
        event={event}
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onUpdate={(updatedEvent) => {
          onUpdate(updatedEvent);
          setEditDialogOpen(false);
        }}
      />
    </Grid>
  );
}

function NewEventDialog({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [minimumSpendMode, setMinimumSpendMode] =
    useState<MinimumSpendMode>('PerCapita');
  const [eventType, setEventType] = useState<EventType>('WEINDAMPFER');
  const [minimumSpend, setMinimumSpend] = useState('50');
  const [ticketPrice, setTicketPrice] = useState('30');
  const [minimumSpendPremium, setMinimumSpendPremium] = useState('');
  const [ticketPricePremium, setTicketPricePremium] = useState('');

  const handleCreate = async () => {
    await axios.post('/api/events', {
      name,
      date,
      minimumSpendMode,
      eventType,
      minimumSpend: Number(minimumSpend),
      ticketPrice: Number(ticketPrice),
      minimumSpendPremium: minimumSpendPremium
        ? Number(minimumSpendPremium)
        : undefined,
      ticketPricePremium: ticketPricePremium
        ? Number(ticketPricePremium)
        : undefined,
    });
    setName('');
    setDate('');
    setMinimumSpend('50');
    setTicketPrice('30');
    setMinimumSpendPremium('');
    setTicketPricePremium('');
    onSuccess();
    onClose();
  };

  return (
    <Dialog
      slotProps={{ paper: { sx: { background: 'var(--color-black)' } } }}
      open={open}
      onClose={onClose}
    >
      <DialogTitle sx={{ color: 'white' }}>
        Neue Veranstaltung erstellen
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Veranstaltungsname"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
        />
        <TextField
          label="Datum"
          type="date"
          fullWidth
          value={date}
          onChange={(e) => setDate(e.target.value)}
          margin="normal"
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          select
          label="Event Typ"
          fullWidth
          value={eventType}
          onChange={(e) => {
            setEventType(e.target.value as EventType);
          }}
          margin="normal"
        >
          <MenuItem value="WEINDAMPFER">Weindampfer</MenuItem>
          <MenuItem value="JECKERIA">Jeckeria</MenuItem>
        </TextField>
        <TextField
          select
          label="Mindestverzehr Art"
          fullWidth
          value={minimumSpendMode}
          onChange={(e) => {
            setMinimumSpendMode(e.target.value as MinimumSpendMode);
          }}
          margin="normal"
        >
          <MenuItem value="PerCapita">Pro Kopf</MenuItem>
          <MenuItem value="PerTable">Pro Tisch</MenuItem>
        </TextField>
        <TextField
          label="Mindestverzehr"
          type="number"
          fullWidth
          value={minimumSpend}
          onChange={(e) => setMinimumSpend(e.target.value)}
          margin="normal"
          slotProps={{
            input: {
              endAdornment: <InputAdornment position="end">€</InputAdornment>,
            },
          }}
        />
        <TextField
          label="Mindestverzehr (Premium)"
          type="number"
          fullWidth
          value={minimumSpendPremium}
          onChange={(e) => setMinimumSpendPremium(e.target.value)}
          margin="normal"
          slotProps={{
            input: {
              endAdornment: <InputAdornment position="end">€</InputAdornment>,
            },
          }}
        />
        <TextField
          label="Ticketpreis"
          type="number"
          fullWidth
          value={ticketPrice}
          onChange={(e) => setTicketPrice(e.target.value)}
          margin="normal"
          slotProps={{
            input: {
              endAdornment: <InputAdornment position="end">€</InputAdornment>,
            },
          }}
        />
        <TextField
          label="Ticketpreis (Premium)"
          type="number"
          fullWidth
          value={ticketPricePremium}
          onChange={(e) => setTicketPricePremium(e.target.value)}
          margin="normal"
          slotProps={{
            input: {
              endAdornment: <InputAdornment position="end">€</InputAdornment>,
            },
          }}
        />
      </DialogContent>
      <div className="w-full flex gap-5 items-center p-4">
        <button
          className="w-full py-2 rounded bg-neutral-900 text-white hover:bg-neutral-700"
          onClick={onClose}
        >
          Abbrechen
        </button>
        <button
          className="w-full py-2 rounded  bg-gray-200 text-gray-900 hover:bg-gray-400 disabled:opacity-60"
          onClick={handleCreate}
          disabled={!name.trim()}
        >
          Erstellen
        </button>
      </div>
    </Dialog>
  );
}

function EditEventDialog({
  event,
  open,
  onClose,
  onUpdate,
}: {
  event: ApiGetEventsResponse[number];
  open: boolean;
  onClose: () => void;
  onUpdate: (event: ApiPutEventResponse) => void;
}) {
  const [name, setName] = useState(event.name);
  const [date, setDate] = useState(
    new Date(event.date).toISOString().split('T')[0],
  );
  const [eventType, setEventType] = useState<EventType>(event.eventType);
  const [minimumSpendMode, setMinimumSpendMode] = useState<MinimumSpendMode>(
    event.minimumSpendMode,
  );
  const [minimumSpend, setMinimumSpend] = useState(event.minimumSpend || '50');
  const [ticketPrice, setTicketPrice] = useState(event.ticketPrice || '30');
  const [minimumSpendPremium, setMinimumSpendPremium] = useState(
    event.minimumSpendPremium || '',
  );
  const [ticketPricePremium, setTicketPricePremium] = useState(
    event.ticketPricePremium || '',
  );

  const handleUpdate = async () => {
    const { data } = await axios.put<ApiPutEventResponse>(
      `/api/events/${event.id}`,
      {
        name,
        date,
        eventType,
        minimumSpendMode,
        minimumSpend: Number(minimumSpend),
        ticketPrice: Number(ticketPrice),
        minimumSpendPremium: minimumSpendPremium
          ? Number(minimumSpendPremium)
          : undefined,
        ticketPricePremium: ticketPricePremium
          ? Number(ticketPricePremium)
          : undefined,
      },
    );
    onUpdate(data);
    onClose();
  };

  return (
    <Dialog
      slotProps={{ paper: { sx: { background: 'var(--color-black)' } } }}
      open={open}
      onClose={onClose}
    >
      <DialogTitle sx={{ color: 'white' }}>Event bearbeiten</DialogTitle>
      <DialogContent>
        <TextField
          label="Veranstaltungsname"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
        />
        <TextField
          label="Datum"
          type="date"
          fullWidth
          value={date}
          onChange={(e) => setDate(e.target.value)}
          margin="normal"
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          select
          label="Event Typ"
          margin="normal"
          fullWidth
          value={eventType}
          onChange={(e) => {
            setEventType(e.target.value as EventType);
          }}
        >
          <MenuItem value="WEINDAMPFER">Weindampfer</MenuItem>
          <MenuItem value="JECKERIA">Jeckeria</MenuItem>
        </TextField>
        <TextField
          select
          label="Mindestverzehr Art"
          margin="normal"
          fullWidth
          value={minimumSpendMode}
          onChange={(e) => {
            setMinimumSpendMode(e.target.value as MinimumSpendMode);
          }}
        >
          <MenuItem value="PerCapita">Pro Kopf</MenuItem>
          <MenuItem value="PerTable">Pro Tisch</MenuItem>
        </TextField>
        <TextField
          label="Mindestverzehr"
          type="number"
          fullWidth
          value={minimumSpend}
          onChange={(e) => setMinimumSpend(e.target.value)}
          margin="normal"
          slotProps={{
            input: {
              endAdornment: <InputAdornment position="end">€</InputAdornment>,
            },
          }}
        />
        <TextField
          label="Mindestverzehr (Premium)"
          type="number"
          fullWidth
          value={minimumSpendPremium}
          onChange={(e) => setMinimumSpendPremium(e.target.value)}
          margin="normal"
          slotProps={{
            input: {
              endAdornment: <InputAdornment position="end">€</InputAdornment>,
            },
          }}
        />

        <TextField
          label="Ticketpreis"
          type="number"
          fullWidth
          value={ticketPrice}
          onChange={(e) => setTicketPrice(e.target.value)}
          margin="normal"
          slotProps={{
            input: {
              endAdornment: <InputAdornment position="end">€</InputAdornment>,
            },
          }}
        />
        <TextField
          label="Ticketpreis (Premium)"
          type="number"
          fullWidth
          value={ticketPricePremium}
          onChange={(e) => setTicketPricePremium(e.target.value)}
          margin="normal"
          slotProps={{
            input: {
              endAdornment: <InputAdornment position="end">€</InputAdornment>,
            },
          }}
        />
      </DialogContent>
      <div className="w-full flex gap-5 items-center p-4">
        <button
          className="w-full py-2 rounded bg-neutral-900 text-white hover:bg-neutral-700"
          onClick={onClose}
        >
          Abbrechen
        </button>
        <button
          className="w-full py-2 rounded  bg-gray-200 text-gray-900 hover:bg-gray-400 disabled:opacity-60"
          onClick={handleUpdate}
          disabled={!name.trim()}
        >
          Speichern
        </button>
      </div>
    </Dialog>
  );
}

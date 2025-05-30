import { Session } from '@/hooks/useSession';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { ApiGetEventsResponse } from '../api/events';
import {
  Box,
  CircularProgress,
  Fade,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import DownloadIcon from '@mui/icons-material/Download';
import { ApiGetReservationsResponse } from '../api/events/[eventId]/reservations';
import { formatEventDate } from '@/lib/event';
import ReservationCard from '@/components/reservationCard';

export default function BackendReservationsPage({
  session,
}: {
  session: Session;
}) {
  const router = useRouter();
  const [events, setEvents] = useState<ApiGetEventsResponse>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [reservations, setReservations] =
    useState<ApiGetReservationsResponse>();

  const selectedEvent = useMemo(
    () => events.filter((e) => e.id == selectedEventId)[0],
    [selectedEventId, events]
  );

  const filteredReservations = useMemo(() => {
    return reservations?.filter((r) => r.confirmationState == 'CONFIRMED');
  }, [reservations]);

  const updateReservation = (
    reservation: ApiGetReservationsResponse[number]
  ) => {
    setReservations((res) =>
      res
        ? res.map((r) => (r.id == reservation.id ? reservation : r))
        : undefined
    );
  };

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
        const preselect = router.query.eventId as string;
        if (preselect) {
          setSelectedEventId(preselect);
        } else if (data.length == 1) {
          setSelectedEventId(data[0].id);
        } else {
          setSelectedEventId(
            data.sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )[0].id
          );
        }
      });
  }, [router.query.eventId]);

  useEffect(() => {
    if (selectedEventId) {
      axios.get(`/api/events/${selectedEventId}/reservations`).then((res) => {
        setReservations(res.data);
      });
    }
  }, [selectedEventId]);

  return (
    <Box className="max-w-5xl mx-auto px-4 py-16 overflow-x-hidden">
      <Box className="flex flex-col md:flex-row gap-3 justify-between items-center mb-6">
        <Typography variant="h4">Reservierungen</Typography>
        {selectedEvent && (
          <div className="flex flex-col md:flex-row gap-3 items-center">
            <button
              className="px-4 py-2 rounded-full bg-neutral-800 text-white text-lg hover:bg-neutral-600 flex items-center gap-1"
              onClick={() => {
                window.open(
                  `/api/events/${selectedEvent.id}/guestListPdf`,
                  '_blank'
                );
              }}
            >
              <DownloadIcon fontSize="inherit" />
              Gästeliste {formatEventDate(selectedEvent.date)}
            </button>
          </div>
        )}
      </Box>

      <div className="my-7">
        <TextField
          select
          label="Veranstaltung wählen"
          sx={{ width: { xs: '100%', sm: '50%' } }}
          value={selectedEventId || ''}
          onChange={(e) => {
            setSelectedEventId(e.target.value);
          }}
        >
          {events.map((event) => (
            <MenuItem key={event.id} value={event.id}>
              {event.name}
            </MenuItem>
          ))}
        </TextField>
      </div>

      <Fade in={Boolean(selectedEvent)} timeout={300}>
        <div>
          {!filteredReservations ? (
            <Box className="flex justify-center items-center">
              <CircularProgress />
            </Box>
          ) : filteredReservations.length === 0 ? (
            <Typography>Keine bestätigten Anfragen.</Typography>
          ) : (
            <motion.div
              key={`${selectedEvent?.id}`}
              variants={{
                hidden: {},
                show: {
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
              initial="hidden"
              animate="show"
              className="space-y-8"
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0, x: -30 },
                  show: {
                    opacity: 1,
                    x: 0,
                    transition: { duration: 0.4 },
                  },
                }}
              >
                <p className="text-lg font-medium text-gray-200 mb-4">
                  {filteredReservations.length} Bestätigte Reservierungen
                  <br />
                  {filteredReservations.reduce(
                    (sum, r) => sum + r.people,
                    0
                  )}{' '}
                  Personen
                  <br />
                  {filteredReservations
                    .filter((r) => r.ticketsNeeded)
                    .reduce((sum, r) => sum + r.people, 0)}{' '}
                  Tickets benötigt
                </p>
              </motion.div>
              {filteredReservations
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .map((reservation) => {
                  const doubleBooking = filteredReservations.find(
                    (r) =>
                      r.id !== reservation.id &&
                      r.tableNumber == reservation.tableNumber &&
                      reservation.tableNumber
                  );
                  return (
                    <ReservationCard
                      key={reservation.id}
                      doubleBooking={doubleBooking}
                      reservation={reservation}
                      onUpdate={updateReservation}
                    />
                  );
                })}
            </motion.div>
          )}
        </div>
      </Fade>
    </Box>
  );
}

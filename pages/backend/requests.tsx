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
import SortButton from '@/components/sortButton';
import { ConfirmationState } from '@/generated/prisma';
import { ApiGetReservationsResponse } from '../api/events/[eventId]/reservations';
import { translateState, translateStateAdj } from '@/lib/reservation';
import { WarningAmber } from '@mui/icons-material';
import { fullEventName } from '@/lib/event';
import BackendBackButton from '@/components/backendBackButton';

export default function BackendRequestsPage({ session }: { session: Session }) {
  const router = useRouter();
  const [events, setEvents] = useState<ApiGetEventsResponse>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedConfirmationState, setSelectedConfirmationState] =
    useState<ConfirmationState>('REQUESTED');
  const [reservations, setReservations] =
    useState<ApiGetReservationsResponse>();
  const [sortOption, setSortOption] = useState<string>('Neuste zuerst');
  const [loading, setLoading] = useState(false);

  function sortReservations(
    reservations: typeof filteredReservations,
    sortBy: string,
  ) {
    if (!reservations) return [];
    return [...reservations].sort((a, b) => {
      switch (sortBy) {
        case 'Neuste zuerst':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case 'Älteste zuerst':
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case 'Personen aufsteigend':
          return a.people - b.people;
        case 'Personen absteigend':
          return b.people - a.people;
        default:
          return 0;
      }
    });
  }

  const selectedEvent = useMemo(
    () => events.filter((e) => e.id == selectedEventId)[0],
    [selectedEventId, events],
  );

  const filteredReservations = useMemo(() => {
    return reservations?.filter(
      (r) => r.confirmationState == selectedConfirmationState,
    );
  }, [reservations, selectedConfirmationState]);

  const confirmedReservations = useMemo(() => {
    return (
      reservations?.filter((r) => r.confirmationState === 'CONFIRMED') || []
    );
  }, [reservations]);

  const updateState = async (
    reservationId: string,
    state: ConfirmationState,
  ) => {
    setReservations((res) =>
      res
        ? res.map((r) =>
            r.id == reservationId ? { ...r, confirmationState: state } : r,
          )
        : undefined,
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
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
            )[0].id,
          );
        }
      });
  }, [router.query.eventId]);

  useEffect(() => {
    if (selectedEventId) {
      setLoading(true);
      axios
        .get(`/api/events/${selectedEventId}/reservations`)
        .then((res) => {
          setReservations(res.data);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [selectedEventId]);

  return (
    <Box className="max-w-5xl mx-auto px-4 py-8 overflow-x-hidden">
      <BackendBackButton />
      <Typography variant="h4" gutterBottom>
        Reservierungsanfragen
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
        <TextField
          select
          label="Reservierungs Status"
          fullWidth
          value={selectedConfirmationState}
          onChange={(e) => {
            setSelectedConfirmationState(e.target.value as ConfirmationState);
          }}
        >
          {['REQUESTED', 'CONFIRMED', 'CANCELLED'].map((state) => (
            <MenuItem key={state} value={state}>
              {translateState(state as ConfirmationState)}
            </MenuItem>
          ))}
        </TextField>
      </div>

      {loading && (
        <Box className="flex justify-center items-center">
          <CircularProgress />
        </Box>
      )}
      <Fade in={!loading} timeout={300}>
        <div>
          <div className="flex justify-between text-sky-600">
            <p className="text-lg font-medium text-gray-200">
              {confirmedReservations.length} Bestätigte Reservierungen
              <br />
              {confirmedReservations.reduce((sum, r) => sum + r.people, 0)}{' '}
              Personen
              <br />
              {confirmedReservations
                .filter((r) => r.ticketsNeeded)
                .reduce((sum, r) => sum + r.people, 0)}{' '}
              Tickets benötigt
            </p>
            <SortButton
              options={[
                'Neuste zuerst',
                'Älteste zuerst',
                'Personen aufsteigend',
                'Personen absteigend',
              ]}
              defaultSelected="Neuste zuerst"
              onChange={setSortOption}
            />
          </div>
          {!filteredReservations ? (
            <Box className="flex justify-center items-center">
              <CircularProgress />
            </Box>
          ) : filteredReservations?.length === 0 ? (
            <p className="mt-10 text-center text-gray-400">
              Keine {translateStateAdj(selectedConfirmationState)} Anfragen.
            </p>
          ) : (
            <motion.div
              key={`${selectedEvent.id}${selectedConfirmationState}${sortOption}`}
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
              className="space-y-4"
            >
              {sortReservations(filteredReservations, sortOption).map(
                (reservation) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    onUpdateState={(state) =>
                      updateState(reservation.id, state)
                    }
                    variants={{
                      hidden: { opacity: 0, x: -50 },
                      show: {
                        opacity: 1,
                        x: 0,
                        transition: { duration: 0.4, ease: 'easeOut' },
                      },
                    }}
                  />
                ),
              )}
            </motion.div>
          )}
        </div>
      </Fade>
    </Box>
  );
}

function ReservationCard({
  reservation,
  onUpdateState,
  variants,
}: {
  reservation: ApiGetReservationsResponse[number];
  onUpdateState: (state: ConfirmationState) => void;
  variants: any;
}) {
  const [animating, setAnimating] = useState<null | 'left' | 'right'>(null);

  const handleAction = (state: ConfirmationState) => {
    setAnimating(state === 'CONFIRMED' ? 'left' : 'right');
  };

  const handleAnimationComplete = () => {
    if (animating) {
      const newState = animating === 'left' ? 'CONFIRMED' : 'CANCELLED';
      axios
        .put(`/api/reservations/${reservation.id}`, {
          confirmationState: newState,
        })
        .then(() => {
          onUpdateState(newState);
        })
        .catch((e) => {
          alert('Fehler');
        });
    }
  };

  return (
    <motion.div
      variants={variants}
      animate={
        animating === 'left'
          ? { x: '-100%', opacity: 0, height: 0 }
          : animating === 'right'
            ? { x: '100%', opacity: 0, height: 0 }
            : { x: 0, opacity: 1, height: 'full' }
      }
      transition={{ duration: 0.3 }}
      onAnimationComplete={handleAnimationComplete}
    >
      <div className="mb-6 mt-3">
        <div className="p-4 border-2 border-neutral-700 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-lg">
              {reservation.name} ({reservation.people} Personen)
            </span>
            <span className="text-xs px-2 py-1 border rounded-full text-neutral-300 border-neutral-300">
              {translateState(reservation.confirmationState)}
            </span>
          </div>

          <p className="my-1 text-neutral-200">
            {reservation.email} / {reservation.phone}
          </p>
          <p className="my-1 text-neutral-200">
            {reservation.tableType}
            {reservation.drinkPackage ? ` • ${reservation.drinkPackage}` : ''}
          </p>
          {reservation.occasion && (
            <p className="my-1 text-neutral-300">{reservation.occasion}</p>
          )}
          <div className="flex items-center gap-2 my-1">
            <p className="my-1 text-neutral-400">
              Tickets
              <b>
                {reservation.ticketsNeeded ? ' benötigt' : ' nicht benötigt'}
              </b>
            </p>
            {reservation.ticketsNeeded ? (
              <WarningAmber fontSize="small" color="warning" />
            ) : null}
          </div>

          <div className="flex gap-3 mt-4">
            {reservation.confirmationState !== 'CONFIRMED' && (
              <button
                className="px-4 py-2 text-sm rounded-full border border-green-600 text-green-600 hover:text-green-700 hover:border-green-700 disabled:border-gray-500 disabled:text-gray-500"
                onClick={() => handleAction('CONFIRMED')}
                disabled={!!animating}
              >
                Bestätigen
              </button>
            )}
            {reservation.confirmationState !== 'CANCELLED' && (
              <button
                className="px-4 py-2 text-sm rounded-full border border-red-600 text-red-600 hover:text-red-700 hover:border-red-700"
                onClick={() => handleAction('CANCELLED')}
                disabled={!!animating}
              >
                Ablehnen
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

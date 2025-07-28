import { Session } from '@/hooks/useSession';
import {
  Box,
  Divider,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ApiGetReservationsResponse } from '../api/reservations';
import axios from 'axios';
import { translateState } from '@/lib/reservation';
import { fullEventName } from '@/lib/event';
import EditReservationDialog from '@/components/editReservationDialog';

export default function BackendSearchReservationPage({
  session,
}: {
  session: Session;
}) {
  const router = useRouter();
  const [reservations, setReservations] = useState<ApiGetReservationsResponse>(
    []
  );
  const [filteredReservations, setFilteredReservations] =
    useState<ApiGetReservationsResponse>([]);
  const [loading, setLoading] = useState(false);

  const [selectedReservation, setSelectedReservation] = useState<
    ApiGetReservationsResponse[number] | null
  >(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilter] = useState<{
    event?: string;
    state?: string;
  }>({});

  const sortReservations = (reservations: ApiGetReservationsResponse) => {
    return reservations.sort((a, b) => {
      const aDate = new Date(a.event.date).getTime();
      const bDate = new Date(b.event.date).getTime();
      return bDate - aDate; // Sort by createdAt descending
    });
  };

  const fetchReservations = async () => {
    const res = await axios.get<ApiGetReservationsResponse>(
      `/api/reservations`
    );
    setLoading(false);
    setReservations(sortReservations(res.data));
    setFilteredReservations(sortReservations(res.data));
  };

  const handleSave = (
    updatedReservation: ApiGetReservationsResponse[number]
  ) => {
    axios
      .put<ApiGetReservationsResponse[number]>(
        `/api/reservations/${updatedReservation.id}`,
        updatedReservation
      )
      .then(() => {
        setFilteredReservations((prev) =>
          prev.map((r) =>
            r.id === updatedReservation.id ? updatedReservation : r
          )
        );
        setReservations((prev) =>
          prev.map((r) =>
            r.id === updatedReservation.id ? updatedReservation : r
          )
        );
        setSelectedReservation(null);
      })
      .catch((error) => {
        console.error('Error updating reservation:', error);
        alert(
          'Fehler beim Aktualisieren der Reservierung. Bitte versuche es später erneut.'
        );
      });
  };

  useEffect(() => {
    if (!searchQuery && !filters.event && !filters.state) {
      setFilteredReservations(reservations);
      return;
    }
    let filtered = [...reservations];
    if (searchQuery !== '') {
      filtered = filtered.filter(
        (reservation) =>
          reservation.name.toLowerCase().includes(searchQuery) ||
          reservation.email.toLowerCase().includes(searchQuery) ||
          reservation.event.name.toLowerCase().includes(searchQuery)
      );
    }
    if (filters.state || filters.event) {
      filtered = filtered.filter((reservation) => {
        const matchesState =
          !filters.state || reservation.confirmationState === filters.state;
        const matchesEvent =
          !filters.event || reservation.event.id === filters.event;
        return matchesState && matchesEvent;
      });
    }
    setFilteredReservations(filtered);
  }, [searchQuery, reservations, filters]);

  useEffect(() => {
    setLoading(true);
    fetchReservations();
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    if (session.status === 'unauthenticated') {
      router.push('/backend/login');
    }
  }, [session.status, router.isReady]);

  return (
    <Box className="mx-auto px-4 py-16">
      <Box className="flex flex-col sm:flex-row gap-3 justify-between items-center mb-12">
        <Typography
          variant="h4"
          className="text-center"
          marginBottom={{ xs: 2, sm: 0 }}
        >
          Reservierung suchen
        </Typography>
      </Box>
      {loading ? (
        <Typography variant="body1" className="text-center">
          Lade Reservierungen...
        </Typography>
      ) : (
        <>
          {reservations.length > 0 ? (
            <>
              <Divider className="block sm:hidden!">Suchen & Filtern</Divider>
              <div className="flex flex-col sm:flex-row gap-4 my-8">
                <TextField
                  variant="outlined"
                  label="Suche"
                  type="search"
                  className="w-full sm:w-2/4"
                  placeholder="Name, E-Mail..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
                />
                <TextField
                  select
                  variant="outlined"
                  label="Status filtern"
                  className="w-full sm:w-1/4"
                  value={filters.state || ''}
                  onChange={(e) =>
                    setFilter((prev) => ({
                      ...prev,
                      state: e.target.value || undefined,
                    }))
                  }
                >
                  <MenuItem value="">Alle</MenuItem>
                  <MenuItem value="REQUESTED">Offen</MenuItem>
                  <MenuItem value="CONFIRMED">Bestätigt</MenuItem>
                  <MenuItem value="CANCELLED">Abgelehnt</MenuItem>
                </TextField>
                <TextField
                  select
                  variant="outlined"
                  label="Event filtern"
                  className="w-full sm:w-1/4"
                  value={filters.event || ''}
                  onChange={(e) =>
                    setFilter((prev) => ({
                      ...prev,
                      event: e.target.value || undefined,
                    }))
                  }
                >
                  <MenuItem value="">Alle</MenuItem>
                  {reservations
                    .map((r) => r.event)
                    .filter(
                      (event, index, self) =>
                        self.findIndex((e) => e.id === event.id) === index
                    )
                    .map((event) => (
                      <MenuItem key={event.id} value={event.id}>
                        {fullEventName(event)}
                      </MenuItem>
                    ))}
                </TextField>
              </div>
              <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Event</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Gäste</TableCell>
                      <TableCell>Anlass</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredReservations.map((reservation) => (
                      <TableRow
                        hover
                        key={reservation.id}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {fullEventName(reservation.event)}
                        </TableCell>
                        <TableCell component="th" scope="row">
                          {reservation.name}
                        </TableCell>
                        <TableCell>{reservation.email}</TableCell>
                        <TableCell>
                          {translateState(reservation.confirmationState)}
                        </TableCell>
                        <TableCell align="right">
                          {reservation.people}
                        </TableCell>
                        <TableCell>{reservation.occasion}</TableCell>
                        <TableCell>
                          <button
                            className="text-sky-400 hover:text-sky-600 transition"
                            onClick={() => setSelectedReservation(reservation)}
                          >
                            Bearbeiten
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          ) : (
            <Typography variant="body1" className="text-center">
              Keine Reservierungen gefunden.
            </Typography>
          )}
        </>
      )}
      <EditReservationDialog
        reservation={selectedReservation}
        onClose={() => setSelectedReservation(null)}
        onSave={handleSave}
      />
    </Box>
  );
}

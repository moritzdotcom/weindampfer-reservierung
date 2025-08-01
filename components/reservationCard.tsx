import axios from 'axios';
import { FormEvent, useRef, useState } from 'react';
import { ApiGetReservationsResponse } from '@/pages/api/events/[eventId]/reservations';
import {
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import CheckIcon from '@mui/icons-material/Check';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { fullReservationPrice } from '@/lib/reservation';

export default function ReservationCard({
  reservation,
  doubleBooking,
  onUpdate,
}: {
  reservation: ApiGetReservationsResponse[number];
  doubleBooking?: ApiGetReservationsResponse[number];
  onUpdate: (reservation: ApiGetReservationsResponse[number]) => void;
}) {
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [notifying, setNotifying] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [savingTableNumber, setSavingTableNumber] = useState(false);

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleConfirmPayment = async () => {
    await axios.put(`/api/reservations/${reservation.id}`, { payed: true });
    onUpdate({ ...reservation, payed: true });
    setPaymentDialogOpen(false);
    setAnchorEl(null);
  };

  const handleNotify = async () => {
    setNotifying(true);
    await axios.post(`/api/reservations/${reservation.id}/notify`);
    onUpdate({ ...reservation, notified: new Date() });
    setNotifying(false);
  };

  const handlePaymentReminder = async () => {
    await axios.post(`/api/reservations/${reservation.id}/sendPaymentReminder`);
    onUpdate({ ...reservation, paymentReminderSent: new Date() });
    setAnchorEl(null);
  };

  const handleCancelReservation = async () => {
    await axios.post(`/api/reservations/${reservation.id}/cancel`, {
      reason: cancelReason,
    });
    onUpdate({ ...reservation, confirmationState: 'CANCELLED' });
    setAnchorEl(null);
  };

  const handleUpdateTableNumber = async (tableNumber: string) => {
    onUpdate({ ...reservation, tableNumber });
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    if (tableNumber.length <= 0) return;

    setSavingTableNumber(true);

    debounceTimeout.current = setTimeout(async () => {
      await axios.put(`/api/reservations/${reservation.id}`, { tableNumber });
      setSavingTableNumber(false);
    }, 1000);
  };

  async function handleUploadInvoice(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get('file') as File;

    if (!file || file.type !== 'application/pdf') {
      alert('Bitte eine PDF-Datei hochladen.');
      return;
    }

    try {
      const { data } = await axios.post(
        `/api/reservations/${reservation.id}/uploadInvoice`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      onUpdate({
        ...reservation,
        invoiceUrl: data.invoiceUrl,
      });
      alert('Rechnung erfolgreich hochgeladen!');
    } catch (error) {
      console.error('Fehler beim Hochladen der Rechnung:', error);
      alert('Fehler beim Hochladen der Rechnung. Bitte versuche es erneut.');
    }
  }

  async function fetchInvoiceUrl(invoicePath: string) {
    console.log(reservation);
    const res = await fetch(
      `/api/reservations/invoiceUrl?path=${encodeURIComponent(invoicePath)}`
    );
    const json = await res.json();

    if (json.url) {
      window.open(json.url, '_blank');
    } else {
      alert('Fehler beim Laden der Rechnung');
    }
  }

  return (
    <motion.div
      key={reservation.id}
      variants={{
        hidden: { opacity: 0, x: -30 },
        show: {
          opacity: 1,
          x: 0,
          transition: { duration: 0.4 },
        },
      }}
      className="p-4 border border-gray-400 rounded-xl"
    >
      <Box className="flex flex-row gap-2 justify-between items-start flex-wrap">
        <div className="flex flex-col sm:flex-row gap-1">
          <h6 className="text-xl font-medium">{reservation.name}</h6>
          <h6 className="text-xl font-medium">
            ({reservation.people} Personen)
          </h6>
        </div>
        <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
          <MoreHorizIcon />
        </IconButton>
      </Box>
      <Typography className="text-gray-400 hover:text-gray-200 transition">
        {reservation.tableType}
      </Typography>
      <Typography className="text-sm text-gray-400 hover:text-gray-200 transition">
        {reservation.email} / {reservation.phone}
      </Typography>
      {reservation.streetAddress && (
        <Typography className="text-sm text-gray-400 hover:text-gray-200 transition">
          {reservation.streetAddress}, {reservation.zipCode} {reservation.city}
        </Typography>
      )}

      <div className="flex items-center gap-2 my-2">
        <Typography className="text-sm mt-1 font-medium">
          {fullReservationPrice(reservation)} €
        </Typography>
        <Tooltip
          title={reservation.payed ? 'Zahlung erhalten' : 'Zahlung ausstehend'}
        >
          <button
            className={`${
              reservation.payed ? 'text-emerald-600' : 'text-amber-600'
            }`}
            onClick={() => setPaymentDialogOpen(!reservation.payed)}
          >
            {reservation.payed ? 'Bezahlt' : 'Nix Geld'}
          </button>
        </Tooltip>
      </div>

      <Typography className="text-sm text-gray-400">
        {reservation.occasion}
      </Typography>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4">
        <Box className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <TextField
            label="Tischnummer"
            variant="outlined"
            size="small"
            sx={{ width: 200 }}
            error={Boolean(doubleBooking)}
            value={reservation.tableNumber || ''}
            onChange={(e) => handleUpdateTableNumber(e.target.value)}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    {savingTableNumber && (
                      <CircularProgress size="1.3rem" sx={{ color: 'white' }} />
                    )}
                  </InputAdornment>
                ),
              },
            }}
          />
          {doubleBooking && (
            <p className="text-red-600">Tisch doppelt belegt!</p>
          )}
        </Box>
        {reservation.notified ? (
          <Tooltip
            title={`Benachrichtigt am: ${new Date(
              reservation.notified
            ).toLocaleDateString('de')} ${
              reservation.paymentReminderSent
                ? ` - Erinnert am: ${new Date(
                    reservation.paymentReminderSent
                  ).toLocaleDateString('de')}`
                : ''
            }`}
          >
            <button className="border bg-neutral-800 text-white px-3 py-2 rounded-full flex items-center gap-1 text-base cursor-default!">
              <CheckIcon fontSize="inherit" />
              <span>Benachrichtigt</span>
            </button>
          </Tooltip>
        ) : (
          <button
            onClick={handleNotify}
            disabled={notifying}
            className="border border-sky-500 text-sky-500 px-3 py-2 rounded-full flex items-center gap-1 text-base"
          >
            <MailOutlineIcon fontSize="inherit" />
            <span>{notifying ? 'Lädt...' : 'Benachrichtigen'}</span>
          </button>
        )}
      </div>
      <div className="mt-5">
        <Divider />
        {reservation.invoiceUrl ? (
          <div className="mt-2 text-sm text-gray-400">
            <span className="mr-2">Bereits hochgeladen:</span>
            <button
              className="text-sky-500 underline hover:text-sky-400"
              onClick={() => fetchInvoiceUrl(reservation.invoiceUrl || '')}
            >
              Rechnung herunterladen
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleUploadInvoice}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4"
          >
            <label className="inline-flex items-center px-4 py-2 bg-white text-black border border-gray-300 rounded-lg shadow cursor-pointer hover:bg-gray-100 transition">
              <input
                type="file"
                name="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              📎 PDF auswählen
            </label>
            {selectedFile && (
              <p className="text-sm text-gray-400">{selectedFile.name}</p>
            )}
            <button
              type="submit"
              className="bg-black text-white px-4 py-2 rounded-lg shadow hover:bg-gray-800 transition"
            >
              Rechnung hochladen
            </button>
          </form>
        )}
      </div>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem disabled={reservation.payed} onClick={handleConfirmPayment}>
          Zahlungseingang bestätigen
        </MenuItem>
        <Divider />
        <MenuItem
          disabled={
            Boolean(reservation.paymentReminderSent) ||
            reservation.payed ||
            !reservation.notified ||
            new Date(reservation.notified).getTime() - new Date().getTime() <
              1000 * 60 * 60 * 24 * 7
          }
          onClick={handlePaymentReminder}
        >
          Zahlungserinnerung versenden
        </MenuItem>
        <Divider />
        <MenuItem
          disabled={reservation.payed}
          onClick={() => {
            setAnchorEl(null);
            setCancelDialogOpen(true);
          }}
        >
          Stornieren & benachrichtigen
        </MenuItem>
      </Menu>
      <Dialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
      >
        <DialogTitle>Zahlungseingang bestätigen</DialogTitle>
        <DialogContent>
          <Typography>
            Möchtest du den Zahlungseingang für{' '}
            <strong>{reservation.name}</strong> bestätigen?
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            px: 3,
            pb: 2,
            pt: 1,
          }}
        >
          <button
            className="w-full shadow rounded bg-gray-300 hover:bg-gray-400 px-3 py-2 transition hover:scale-105 mr-3"
            onClick={() => setPaymentDialogOpen(false)}
          >
            Abbrechen
          </button>
          <button
            className="w-full shadow rounded text-white bg-green-600 hover:bg-green-700 px-3 py-2 transition hover:scale-105 ml-3"
            onClick={handleConfirmPayment}
          >
            Bestätigen
          </button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        slotProps={{ paper: { sx: { background: 'var(--color-black)' } } }}
      >
        <DialogTitle sx={{ color: 'white' }}>
          Reservierung Stornieren
        </DialogTitle>
        <DialogContent>
          <p className="text-lg mb-3 text-gray-300">
            Bitte gib einen Stornierungsgrund an. Dieser wird dem Kunden in der
            Stornierungsbestätigung mitgeteilt.
          </p>
          <TextField
            fullWidth
            label="Stornierungsgrund"
            placeholder="Nicht bezahlt"
            multiline
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            maxRows={4}
            minRows={2}
          />
        </DialogContent>
        <DialogActions
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            px: 3,
            pb: 2,
            pt: 1,
            backgroundColor: 'var(--color-black)',
          }}
        >
          <button
            className="w-full shadow rounded bg-neutral-900 hover:bg-neutral-600 px-3 py-2 transition hover:scale-105 mr-3"
            onClick={() => setCancelDialogOpen(false)}
          >
            Abbrechen
          </button>
          <button
            className="w-full shadow rounded text-white bg-red-600 hover:bg-red-700 px-3 py-2 transition hover:scale-105 ml-3"
            onClick={handleCancelReservation}
          >
            Stornieren
          </button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}

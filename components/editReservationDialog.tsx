import {
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  TextField,
  Slide,
  MenuItem,
} from '@mui/material';
import { forwardRef, useEffect, useState } from 'react';
import { TransitionProps } from '@mui/material/transitions';
import { ApiGetReservationsResponse } from '@/pages/api/reservations';
import { fullReservationPrice } from '@/lib/reservation';
import WarningIcon from '@mui/icons-material/Warning';

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function EditReservationDialog({
  reservation,
  onClose,
  onSave,
}: {
  reservation: ApiGetReservationsResponse[number] | null;
  onClose: () => void;
  onSave: (updated: ApiGetReservationsResponse[number]) => void;
}) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    streetAddress: '',
    city: '',
    zipCode: '',
    people: '',
    occasion: '',
    ticketsNeeded: true,
    tableType: '',
  });

  useEffect(() => {
    if (reservation) {
      setForm({
        name: reservation.name,
        email: reservation.email,
        phone: reservation.phone,
        streetAddress: reservation.streetAddress,
        city: reservation.city,
        zipCode: reservation.zipCode,
        people: `${reservation.people}`,
        occasion: reservation.occasion,
        ticketsNeeded: reservation.ticketsNeeded,
        tableType: reservation.tableType,
      });
    }
  }, [reservation]);

  const handleChange = (key: string, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = () => {
    if (!reservation) return;
    onSave({
      ...reservation,
      ...form,
      people: Number(form.people),
    });
  };

  const previousPrice = reservation ? fullReservationPrice(reservation) : 0;
  const newPrice = reservation
    ? fullReservationPrice({
        ...reservation,
        ...form,
        people: Number(form.people),
      })
    : 0;

  return (
    <Dialog
      open={!!reservation}
      onClose={onClose}
      slots={{ transition: Transition }}
      fullWidth
      slotProps={{ paper: { sx: { background: 'var(--color-neutral-800)' } } }}
      maxWidth="sm"
    >
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 600, color: '#fff' }}>
        Reservierung bearbeiten
      </DialogTitle>
      <div className="flex flex-col gap-6 px-5 py-3">
        <TextField
          label="Name"
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
          fullWidth
        />
        <TextField
          label="E-Mail"
          value={form.email}
          onChange={(e) => handleChange('email', e.target.value)}
          fullWidth
        />
        <TextField
          label="Personenanzahl"
          type="number"
          value={form.people}
          onChange={(e) => handleChange('people', e.target.value)}
          fullWidth
        />
        <TextField
          label="Telefon"
          value={form.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          fullWidth
        />
        <TextField
          label="Straße und Hausnummer"
          value={form.streetAddress}
          onChange={(e) => handleChange('streetAddress', e.target.value)}
          fullWidth
        />
        <TextField
          label="Stadt"
          value={form.city}
          onChange={(e) => handleChange('city', e.target.value)}
          fullWidth
        />
        <TextField
          label="Postleitzahl"
          value={form.zipCode}
          onChange={(e) => handleChange('zipCode', e.target.value)}
          fullWidth
        />
        <TextField
          label="Anlass"
          value={form.occasion}
          onChange={(e) => handleChange('occasion', e.target.value)}
          fullWidth
        />
        <TextField
          label="Tischart"
          value={form.tableType}
          onChange={(e) => handleChange('tableType', e.target.value)}
          fullWidth
          select
        >
          <MenuItem value="Stehtisch">Stehtisch</MenuItem>
          <MenuItem value="Empore">Empore</MenuItem>
        </TextField>
        <TextField
          label="Tickets benötigt?"
          value={form.ticketsNeeded ? 'yes' : 'no'}
          onChange={(e) =>
            handleChange('ticketsNeeded', e.target.value === 'yes')
          }
          fullWidth
          select
        >
          <MenuItem value="yes">Ja</MenuItem>
          <MenuItem value="no">Nein</MenuItem>
        </TextField>
      </div>
      {previousPrice !== newPrice && (
        <div className="flex items-center gap-5 mx-5 rounded px-5 py-3 text-amber-600 bg-amber-100 border border-amber-600">
          <WarningIcon sx={{ fontSize: 30 }} />
          <div>
            <p className="font-bold">
              Preisänderung: {previousPrice}€ → {newPrice}€
            </p>
            {reservation?.payed ? (
              <p className="text-sm">
                Diese Reservierung ist <b>bereits bezahlt</b>. Bitte den Gast
                informieren, dass der Preis sich geändert hat.
              </p>
            ) : (
              <p className="text-sm">
                Diese Reservierung ist <b>noch nicht bezahlt</b>. Bitte den Gast
                informieren, dass der Preis sich geändert hat.
              </p>
            )}
          </div>
        </div>
      )}
      <DialogActions
        sx={{
          justifyContent: 'space-between',
          px: 3,
          pb: 2,
          background: 'var(--color-neutral-800)',
        }}
      >
        <Button
          fullWidth
          variant="contained"
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            background: 'var(--color-neutral-700)',
            color: '#fff',
            '&:hover': { background: 'var(--color-neutral-800)' },
          }}
          onClick={onClose}
        >
          Abbrechen
        </Button>
        <Button
          fullWidth
          variant="contained"
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            background: '#000',
            color: '#fff',
            '&:hover': { background: '#222' },
          }}
          onClick={handleSubmit}
        >
          Speichern
        </Button>
      </DialogActions>
    </Dialog>
  );
}

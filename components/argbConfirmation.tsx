import { Checkbox, FormControlLabel, Typography } from '@mui/material';
import Link from 'next/link';
import { ChangeEvent, useState } from 'react';

export default function ARGBConfirmation({
  onChecked,
}: {
  onChecked: (checked: boolean) => void;
}) {
  const [checked, setChecked] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setChecked(e.target.checked);
    onChecked(e.target.checked);
  };

  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={checked}
          onChange={handleChange}
          sx={(theme) => ({
            color: theme.palette.text.secondary,
            '&.Mui-checked': { color: theme.palette.primary.main },
          })}
        />
      }
      label={
        <Typography
          variant="body2"
          sx={(theme) => ({
            fontSize: '0.875rem',
            color: theme.palette.text.secondary,
            display: 'inline',
          })}
        >
          Mit dem Absenden akzeptierst du die{' '}
          <Link
            href="/argb"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'underline' }}
          >
            <Typography
              component="span"
              sx={(theme) => ({
                color:
                  theme.palette.mode === 'dark'
                    ? theme.palette.common.white
                    : theme.palette.primary.main,
                fontWeight: 600,
              })}
            >
              Allgemeinen Reservierungs- und Geschäftsbedingungen
            </Typography>
          </Link>
          .*
        </Typography>
      }
      sx={{
        width: '100%',
        justifyContent: 'start',
      }}
    />
  );
}

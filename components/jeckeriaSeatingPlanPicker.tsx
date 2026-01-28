import * as React from 'react';
import { Box, Typography } from '@mui/material';

type TableType = 'Jecken-Tisch' | 'Bühne' | 'Dancefloor';

type Props = {
  value: TableType;
  onChange: (next: TableType) => void;
  src?: string; // default: "/jeckeriaTischplan.jpg"
};

type Zone = {
  id: string;
  tableType: TableType;
  label: string;
  // percentages relative to image
  rects: Array<{ left: number; top: number; width: number; height: number }>;
};

const ZONES: Zone[] = [
  {
    id: 'jecken',
    tableType: 'Jecken-Tisch',
    label: 'Jecken-Tisch',
    // zwei Blöcke oben links & oben rechts
    rects: [
      { left: 8, top: 21, width: 31, height: 13 }, // left
      { left: 62, top: 21, width: 31, height: 13 }, // right
    ],
  },
  {
    id: 'dancefloor',
    tableType: 'Dancefloor',
    label: 'Dancefloor (Stehtische)',
    rects: [{ left: 18.32, top: 40, width: 66.5, height: 39 }],
  },
  {
    id: 'buehne',
    tableType: 'Bühne',
    label: 'Bühne (Stehtische)',
    rects: [{ left: 24, top: 81.5, width: 52, height: 13 }],
  },
];

function isActivationKey(e: React.KeyboardEvent) {
  return e.key === 'Enter' || e.key === ' ';
}

export default function JeckeriaSeatingPlanPicker({
  value,
  onChange,
  src = '/jeckeriaTischplan.jpg',
}: Props) {
  const [hoveredType, setHoveredType] = React.useState<TableType | null>(null);

  const activeType = hoveredType ?? value;

  return (
    <Box>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: 520,
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          userSelect: 'none',
        }}
      >
        <Box
          component="img"
          src={src}
          alt="Jeckeria Tischplan"
          sx={{ width: '100%', height: 'auto', display: 'block' }}
          draggable={false}
        />

        {/* Clickable overlays */}
        {ZONES.flatMap((zone) =>
          zone.rects.map((r, idx) => {
            const isActive = activeType === zone.tableType;
            const isSelected = value === zone.tableType;

            return (
              <Box
                key={`${zone.id}-${idx}`}
                role="button"
                tabIndex={0}
                aria-label={`${zone.label} auswählen`}
                onMouseEnter={() => setHoveredType(zone.tableType)}
                onMouseLeave={() => setHoveredType(null)}
                onFocus={() => setHoveredType(zone.tableType)}
                onBlur={() => setHoveredType(null)}
                onClick={() => onChange(zone.tableType)}
                onKeyDown={(e) => {
                  if (isActivationKey(e)) {
                    e.preventDefault();
                    onChange(zone.tableType);
                  }
                }}
                sx={{
                  position: 'absolute',
                  left: `${r.left}%`,
                  top: `${r.top}%`,
                  width: `${r.width}%`,
                  height: `${r.height}%`,
                  cursor: 'pointer',
                  borderRadius: 1.5,
                  outline: 'none',

                  // Hover preview (Zone einfärben)
                  backgroundColor: isActive
                    ? 'rgba(250,250,250, 0.40)'
                    : 'transparent',
                  transition: 'background-color 120ms ease',

                  // Selected state
                  boxShadow: isSelected
                    ? 'inset 0 0 0 2px rgba(250,250,250,0.9)'
                    : 'none',

                  // Focus ring
                  '&:focus-visible': {
                    boxShadow:
                      'inset 0 0 0 2px rgba(250,250,250,1), 0 0 0 3px rgba(250,250,250,0.25)',
                  },
                }}
              />
            );
          }),
        )}
      </Box>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 1, display: 'block' }}
      >
        Klicke auf eine Zone im Tischplan, um die Tischart zu wählen.
      </Typography>
    </Box>
  );
}

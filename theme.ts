// theme.ts
import { createTheme } from '@mui/material/styles';

export const weindampferTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      paper: '#1f2937', // Tailwind bg-gray-800
      default: '#000',
    },
    text: {
      primary: '#ffffff',
      secondary: '#e5e7eb',
    },
  },
  components: {
    // Dialogs - immer hellgrau
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#f3f4f6', // Tailwind bg-gray-100
        },
      },
    },
    // Paper (falls Dialog/Paper genutzt)
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: '0.5rem',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#ffffff',
          '&.Mui-focused': {
            color: '#ffffff',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: 'var(--color-neutral-900)',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--color-neutral-700)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--color-neutral-400)',
          },
          // Neuer weißer Focus-Ring
          '&.Mui-focused': {
            boxShadow: '0 0 0 3px rgba(255,255,255,0)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--color-neutral-200)',
          },
        },
        input: {
          color: 'var(--color-neutral-200)',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          padding: '16.5px 14px',
          color: '#ffffff',
        },
        icon: {
          color: '#ffffff',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          color: '#1f2937', // dunkler Text auf hellgrauem Hintergrund
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          color: '#1f2937',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '1rem',
          backgroundColor: '#f3f4f6',
        },
      },
    },
  },
});

const JECKERIA_PURPLE = '#652E70';

export const jeckeriaTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: JECKERIA_PURPLE,
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#F59E0B', // warmes Karnevals-Gelb (Akzent)
    },
    background: {
      default: '#faf7fb', // leicht lila-weiß
      paper: '#ffffff',
    },
    text: {
      primary: '#1f2937', // Tailwind gray-800
      secondary: '#4b5563', // gray-600
    },
    divider: '#e5e7eb',
  },

  components: {
    /* ---------- Paper & Dialog ---------- */
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: '0.75rem',
        },
        root: {
          backgroundImage: 'none',
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRadius: '1rem',
        },
      },
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: {
          color: JECKERIA_PURPLE,
          fontWeight: 700,
        },
      },
    },

    MuiDialogContent: {
      styleOverrides: {
        root: {
          color: '#1f2937',
        },
      },
    },

    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '1rem',
          backgroundColor: '#faf7fb',
        },
      },
    },

    /* ---------- Inputs ---------- */
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#4b5563',
          '&.Mui-focused': {
            color: JECKERIA_PURPLE,
          },
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          borderRadius: '0.75rem',

          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#d1d5db',
          },

          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: JECKERIA_PURPLE,
          },

          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: JECKERIA_PURPLE,
            borderWidth: 2,
          },

          '&.Mui-focused': {
            boxShadow: '0 0 0 4px rgba(101, 46, 112, 0.15)',
          },
        },
        input: {
          color: '#1f2937',
        },
      },
    },

    MuiSelect: {
      styleOverrides: {
        select: {
          padding: '16.5px 14px',
          color: '#1f2937',
        },
        icon: {
          color: JECKERIA_PURPLE,
        },
      },
    },

    /* ---------- Buttons ---------- */
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '9999px', // pill buttons → Karneval vibes
          textTransform: 'none',
          fontWeight: 600,
        },
        containedPrimary: {
          backgroundColor: JECKERIA_PURPLE,
          '&:hover': {
            backgroundColor: '#53265c',
          },
        },
      },
    },
  },
});

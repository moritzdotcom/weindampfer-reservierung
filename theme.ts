// theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      paper: '#1f2937', // Tailwind bg-gray-800
      default: '#1f2937',
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

export default theme;

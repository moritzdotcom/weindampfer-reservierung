import UseSession from '@/hooks/useSession';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { weindampferTheme } from '@/theme';

export default function App({ Component, pageProps }: AppProps) {
  const session = UseSession();

  const appProps = Object.assign(
    {
      session,
    },
    pageProps,
  );

  return (
    <ThemeProvider theme={weindampferTheme}>
      <CssBaseline />

      <Component {...appProps} />
    </ThemeProvider>
  );
}

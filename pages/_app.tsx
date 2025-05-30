import UseSession from '@/hooks/useSession';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { ThemeProvider } from '@mui/material';
import theme from '@/theme';

export default function App({ Component, pageProps }: AppProps) {
  const session = UseSession();

  const appProps = Object.assign(
    {
      session,
    },
    pageProps
  );

  return (
    <ThemeProvider theme={theme}>
      <Component {...appProps} />
    </ThemeProvider>
  );
}

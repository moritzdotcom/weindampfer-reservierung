import Link from 'next/link';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

export default function BackendBackButton() {
  return (
    <div className="mb-5">
      <Link
        className="bg-neutral-800 text-white text-lg px-4 py-2 rounded hover:bg-neutral-600 transition-colors inline-flex items-center"
        href="/backend"
        title="Zurück zur Admin-Seite"
      >
        <ArrowBackIosIcon fontSize="inherit" />
        Zurück
      </Link>
    </div>
  );
}

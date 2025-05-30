import { Box } from '@mui/material';

export default function ARGBPage({ baseUrl }: { baseUrl: string }) {
  return (
    <Box className="max-w-5xl mx-auto px-4 py-16 font-sans text-gray-200">
      <Box className="text-center mb-6">
        <img
          src="/logo-white.png"
          alt="Weindampfer Logo"
          className="mx-auto h-16 mb-8"
        />
        <h1 className="text-3xl font-semibold">
          Allgemeine Reservierungs- und Geschäftsbedingungen KM Entertainment
          GmbH 2025
        </h1>
      </Box>
      <div className="flex flex-col gap-2">
        <p>
          Die KM Entertainment GmbH (nachfolgend „KM“) bietet über das
          Online-Reservierungsformular unter {baseUrl} (nachfolgend
          „Reservierungsformular“) die Möglichkeit der Reservierung von
          Stehtischen auf dem Weindampfer für eine bestimmte Veranstaltung an.
          Diese Reservierungs- und Geschäftsbedingungen (nachfolgend „ARGB“)
          gelten für alle über das Reservierungsformular erfolgenden
          Reservierungen sowie für den Zutritt und Aufenthalt auf dem
          Weindampfer.
        </p>

        <h3 className="text-xl font-semibold mt-5">
          A) Reservierungen / Bedingungen
        </h3>

        <div>
          <p className="text-stone-400 font-light">A.1</p>
          <p>
            Reservierungen sind ausschließlich über das Reservierungsformular
            oder die E-Mail-Adresse reservierung@derweindampfer.de möglich.
          </p>
        </div>
        <div>
          <p className="text-stone-400 font-light">A.2</p>
          <p>
            Mit der Bestätigung der Reservierung geben Sie ein verbindliches
            Angebot ab und erkennen den darin enthaltenen Mindestverzehr sowie
            die Allgemeinen Geschäftsbedingungen an.
          </p>
        </div>
        <div>
          <p className="text-stone-400 font-light">A.3</p>
          <p>
            Eine Buchungsbestätigung per E-Mail erfolgt nach Eingang der
            Anfrage. Bei Zusage erhalten Sie eine Rechnung, die innerhalb von 5
            Tagen bezahlt werden muss.
          </p>
        </div>
        <div>
          <p className="text-stone-400 font-light">A.4</p>
          <p>
            Falls die Zahlung nicht innerhalb der Frist erfolgt, wird die
            Reservierung automatisch storniert.
          </p>
        </div>
        <div>
          <p className="text-stone-400 font-light">A.5</p>
          <p>
            Um eine gültige Reservierung zu garantieren, muss der Kunde 30
            Minuten vor der Abfahrt am Boarding Punkt erscheinen. Ansonsten
            verfällt die Reservierung und der Tisch wird anderweitig vergeben.
          </p>
        </div>

        <h3 className="text-xl font-semibold mt-5">
          B) Nutzung und Weitergabe
        </h3>

        <div>
          <p className="text-stone-400 font-light">B.1</p>
          <p>
            Die Weitergabe von Reservierungen an Dritte ist nur mit
            ausdrücklicher schriftlicher Zustimmung der KM Entertainment GmbH
            erlaubt.
          </p>
        </div>

        <h3 className="text-xl font-semibold mt-5">C) Einlass</h3>
        <div>
          <p className="text-stone-400 font-light">C.1</p>
          <p>
            Der Zutritt zum Weindampfer ist nur mit einer gültigen
            Reservierungsbestätigung in Kombination mit einem Ticket möglich.
          </p>
        </div>

        <h3 className="text-xl font-semibold mt-5">
          D) Haftung und Schluss-Bestimmungen
        </h3>
        <div>
          <p className="text-stone-400 font-light">D.1</p>
          <p>
            Der Aufenthalt auf dem Weindampfer erfolgt auf eigene Gefahr. Die KM
            Entertainment GmbH haftet nur bei grober Fahrlässigkeit.
          </p>
        </div>

        <h3 className="text-xl font-semibold mt-5">E) Kontakt</h3>
        <p>KM Entertainment GmbH</p>
        <p>Pfalzstraße 17</p>
        <p>40477 Düsseldorf</p>
        <p>Telefon: 0211 87512669</p>
        <p>E-Mail: info@derweindampfer.de</p>
      </div>
    </Box>
  );
}

export function getStaticProps() {
  return {
    props: { baseUrl: process.env.PUBLIC_URL || '' },
  };
}

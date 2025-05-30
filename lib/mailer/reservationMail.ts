import { sendMail } from '@/lib/mailer';

export default function sendReservationMail(
  email: string,
  name: string,
  people: string,
  date: string,
  price: number
) {
  return sendMail({
    to: email,
    sendCopy: true,
    subject: 'Deine Reservierung wurde bestätigt',
    text: `Hallo ${name},\n\ndeine Reservierung für ${people} Pers. am ${date} ist bestätigt!\nBitte überweise ${price} € im Voraus auf das unten stehende Konto. Bei Nichtzahlung innerhalb einer Woche verfällt die Reservierung.\n\nLiebe Grüße,\nDas Weindampfer-Team`,
    html: `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Reservierung bestätigt</title>
</head>
<body style="margin:0; padding:0; font-family:Arial,sans-serif; background-color:#f9f9f9;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; margin:20px 0; border-radius:8px; overflow:hidden;">
          <!-- Logo -->
          <tr>
            <td style="padding:20px; text-align:center;">
              <img src="${
                process.env.PUBLIC_URL
              }logo-black.png" alt="Weindampfer Logo" style="max-width:200px; height:auto;" />
            </td>
          </tr>
          <!-- Überschrift -->
          <tr>
            <td style="padding:0 20px 10px;">
              <h1 style="margin:0; font-size:24px; color:#333333; text-align:center;">Reservierung bestätigt</h1>
            </td>
          </tr>
          <!-- Bestätigungs-Box mit Zahlungsdaten -->
          <tr>
            <td style="padding:0 20px 20px;">
              <div style="background-color:#f0f0f0; padding:20px; border-radius:5px; color:#333333; font-size:16px; line-height:1.5;">
                <p>Hallo <strong>${name}</strong>,</p>
                <p>deine Reservierung für <strong>${people} Personen</strong> am <strong>${date}</strong> ist bestätigt!</p>
                <hr style="border:none; border-top:1px solid #cccccc; margin:16px 0;" />
                <p><strong>Zahlungsdaten:</strong><br/>
                  Bitte überweise <strong>${price} €</strong> im Voraus auf folgendes Konto:<br/>
                  Name: KM Entertainment GmbH<br/>
                  IBAN: DE49 3016 0213 0088 9520 14<br/>
                  BIC: GENODED1DNE<br/>
                  Verwendungszweck: Tischreservierung ${name} / ${date}
                </p>
                <p style="color:#000000; font-weight:bold;">
                  Zahlung innerhalb einer Woche erforderlich, sonst verfällt die Reservierung.
                </p>
              </div>
            </td>
          </tr>
          <!-- Rechtlicher Hinweis -->
          <tr>
            <td style="padding:0 20px 20px; font-size:12px; font-style:italic; color:#666666; line-height:1.4;">
              Weitere Details findest du in unseren 
              <a href="${
                process.env.PUBLIC_URL
              }argb" style="color:#666666; text-decoration:underline;">Allgemeinen Reservierungs- und Geschäftsbedingungen</a>.
            </td>
          </tr>
          <!-- Abschiedsfloskel -->
          <tr>
            <td style="padding:0 20px 20px; color:#333333; font-size:14px; line-height:1.5;">
              Wir freuen uns auf deinen Besuch!<br/><br/>
              Liebe Grüße<br/>
              Dein Weindampfer-Team
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#000000; padding:15px; text-align:center;">
              <p style="margin:0; font-size:12px; color:#ffffff;">
                © ${new Date().getFullYear()} Weindampfer - Alle Rechte vorbehalten
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });
}

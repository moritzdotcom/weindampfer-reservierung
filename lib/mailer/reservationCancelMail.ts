import { EventType } from '@/generated/prisma/wasm';
import { renderGreeting, renderImage, sendMail } from '@/lib/mailer';

export default function sendReservationCancelMail(
  email: string,
  name: string,
  people: number,
  date: string,
  reason: string,
  eventType: EventType,
) {
  return sendMail({
    to: email,
    sendCopy: true,
    subject: 'Deine Weindampfer-Reservierung wurde storniert',
    text: `Hallo ${name}, leider müssen wir deine Reservierung für ${people} Personen am ${date} stornieren. Grund: ${reason}. Wir hoffen, dich dennoch bald auf dem Weindampfer begrüßen zu dürfen. Liebe Grüße, Dein Weindampfer-Team`,
    html: `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <title>Reservierung storniert</title>
</head>
<body style="margin:0; padding:0; font-family:Arial,sans-serif; background-color:#f9f9f9;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; margin:20px 0; border-radius:8px; overflow:hidden;">
          <!-- Logo -->
          <tr>
            <td style="padding:20px; text-align:center;">
              ${renderImage(eventType)}
            </td>
          </tr>
          <!-- Überschrift -->
          <tr>
            <td style="padding:0 20px 10px;">
              <h1 style="margin:0; font-size:24px; color:#333333; text-align:center;">
                Reservierung storniert
              </h1>
            </td>
          </tr>
          <!-- Stornierungs-Box -->
          <tr>
            <td style="padding:0 20px 20px;">
              <div style="background-color:#fdecea; padding:20px; border-radius:5px; color:#333333; font-size:16px; line-height:1.5;">
                <p>Hallo <strong>${name}</strong>,</p>
                <p>leider müssen wir deine Reservierung für <strong>${people} Personen</strong> am <strong>${date} stornieren</strong>.</p>
                <hr style="border:none; border-top:1px solid #ffcccc; margin:16px 0;" />
                <p><strong>Grund der Stornierung:</strong><br/>
                  ${reason}
                </p>
              </div>
            </td>
          </tr>
          <!-- Optionaler Hinweis -->
          <tr>
            <td style="padding:0 20px 20px; color:#333333; font-size:14px; line-height:1.5;">
              Wir bedauern die Unannehmlichkeiten und hoffen, dich bald trotzdem auf dem Weindampfer begrüßen zu dürfen.
            </td>
          </tr>
          <!-- Abschiedsfloskel -->
          <tr>
            <td style="padding:0 20px 20px; color:#333333; font-size:14px; line-height:1.5;">
              Liebe Grüße<br/>
              ${renderGreeting(eventType)}
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

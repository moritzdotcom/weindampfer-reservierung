import { renderGreeting, renderImage, sendMail } from '@/lib/mailer';
import { EventType } from '@/prisma/generated/enums';

export default function sendReservationChangeEventMail(
  email: string,
  name: string,
  people: number,
  oldDate: string,
  newDate: string,
  eventType: EventType,
) {
  return sendMail({
    to: email,
    sendCopy: true,
    subject: 'Deine Weindampfer-Reservierung wurde verschoben',
    text: `Hallo ${name}, deine Reservierung für ${people} Personen am ${oldDate} wurde auf den ${newDate} verschoben. Deine Reservierung bleibt selbstverständlich bestehen. Bei Fragen kannst du dich jederzeit bei uns melden. Liebe Grüße, Dein Weindampfer-Team`,
    html: `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <title>Reservierung verschoben</title>
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
                Deine Reservierung wurde verschoben
              </h1>
            </td>
          </tr>

          <!-- Info-Box -->
          <tr>
            <td style="padding:0 20px 20px;">
              <div style="background-color:#fff4e5; padding:20px; border-radius:5px; color:#333333; font-size:16px; line-height:1.6;">
                <p>Hallo <strong>${name}</strong>,</p>
                <p>
                  deine Reservierung für <strong>${people} Personen</strong> wurde
                  vom <strong>${oldDate}</strong> auf den <strong>${newDate}</strong> verschoben.
                </p>
              </div>
            </td>
          </tr>

          <!-- Zusatztext -->
          <tr>
            <td style="padding:0 20px 20px; color:#333333; font-size:14px; line-height:1.6;">
              Wir freuen uns, dich am neuen Termin an Bord begrüßen zu dürfen.
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

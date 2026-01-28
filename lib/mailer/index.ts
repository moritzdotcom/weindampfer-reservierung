import { EventType } from '@/prisma/generated/client';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT || '587'),
  secure: process.env.MAIL_PORT === '465',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export function sendMail({
  to,
  subject,
  text,
  html,
  sendCopy,
  attachments,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  sendCopy?: boolean;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }[];
}) {
  return transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    bcc: sendCopy ? process.env.MAIL_FROM : undefined,
    subject,
    text,
    html,
    attachments,
  });
}

export function renderImage(eventType: EventType) {
  if (eventType === 'WEINDAMPFER') {
    return `<img src="${
      process.env.PUBLIC_URL
    }logo-black.png" alt="Weindampfer Logo" style="max-width:200px; height:auto;" />`;
  } else if (eventType === 'JECKERIA') {
    return `<img src="${
      process.env.PUBLIC_URL
    }jeckeria.jpg" alt="Jeckeria Logo" style="max-width:300px; height:auto;" />`;
  }
}

export function renderGreeting(eventType: EventType) {
  if (eventType === 'WEINDAMPFER') {
    return `Dein Weindampfer-Team`;
  } else if (eventType === 'JECKERIA') {
    return `Dein Jeckeria-Team`;
  }
}

import AdminHeader from '@/components/adminHeader';
import HtmlHead from '@/components/head';
import ReservationForm from '@/components/reservationForm';
import { Event } from '@/prisma/generated/client';
import { Session } from '@/hooks/useSession';
import prisma from '@/lib/prismadb';
import { GetServerSidePropsContext } from 'next';

export default function EventReservationPage({
  events,
  session,
}: {
  events: Event[];
  session: Session;
}) {
  return (
    <>
      <HtmlHead eventName={events.length > 0 ? events[0].name : undefined} />
      <div className="w-full min-h-screen">
        {session.status == 'authenticated' && (
          <AdminHeader name={session.user.name} />
        )}
        <ReservationForm events={events} />
      </div>
    </>
  );
}

export async function getServerSideProps({
  query,
  res,
}: GetServerSidePropsContext) {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=10, stale-while-revalidate=59',
  );
  const eventId = query.eventId as string | undefined;

  const events = await prisma.event.findMany({
    where: { id: eventId },
  });

  return {
    props: {
      events: JSON.parse(JSON.stringify(events)),
    },
  };
}

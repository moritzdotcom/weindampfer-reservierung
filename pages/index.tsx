import AdminHeader from '@/components/adminHeader';
import HtmlHead from '@/components/head';
import ReservationForm from '@/components/reservationForm';
import { Event } from '@/prisma/generated/client';
import { Session } from '@/hooks/useSession';
import prisma from '@/lib/prismadb';
import { GetServerSidePropsContext } from 'next';

export default function ReservationPage({
  events,
  session,
}: {
  events: Event[];
  session: Session;
}) {
  return (
    <>
      <HtmlHead />
      <div className="w-full min-h-screen">
        {session.status == 'authenticated' && (
          <AdminHeader name={session.user.name} />
        )}
        <ReservationForm events={events} />
      </div>
    </>
  );
}

export async function getServerSideProps({ res }: GetServerSidePropsContext) {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=10, stale-while-revalidate=59',
  );

  try {
    const events = await prisma.event.findMany({
      where: { date: { gte: new Date() } },
    });

    return {
      props: {
        events: JSON.parse(JSON.stringify(events)),
      },
    };
  } catch (error) {
    console.error('Error fetching events:', error);
    return {
      props: {
        events: [],
      },
    };
  }
}

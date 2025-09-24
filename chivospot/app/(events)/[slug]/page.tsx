import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getEventBySlug } from "@/lib/events";
import { EventDetail } from "@/components/EventDetail";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const event = await getEventBySlug(params.slug);
  if (!event) return { title: "Evento no encontrado" };
  return {
    title: event.title,
    description: event.summary ?? "Evento en ChivoSpot",
    openGraph: {
      title: event.title,
      description: event.summary ?? undefined,
      images: event.imageUrl ? [event.imageUrl] : undefined,
    },
  };
}

export default async function EventPage({ params }: PageProps) {
  const event = await getEventBySlug(params.slug);
  if (!event) return notFound();

  await prisma.eventMetric.upsert({
    where: { eventId: event.id },
    update: { views: { increment: 1 } },
    create: { eventId: event.id, views: 1, clicksMap: 0, saves: 0 },
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.summary ?? undefined,
    startDate: event.startTime.toISOString(),
    endDate: event.endTime?.toISOString(),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.venue.name,
      address: event.venue.municipality,
      geo: {
        "@type": "GeoCoordinates",
        latitude: event.venue.latitude,
        longitude: event.venue.longitude,
      },
    },
    image: event.imageUrl ? [event.imageUrl] : undefined,
    organizer: {
      "@type": "Organization",
      name: event.organizer.displayName,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <EventDetail event={event} />
    </>
  );
}

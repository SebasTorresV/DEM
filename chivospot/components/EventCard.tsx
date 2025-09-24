import Image from "next/image";
import Link from "next/link";
import type { Event, Venue } from "@prisma/client";
import { formatDateRange } from "@/lib/utils/date";

export type EventCardProps = {
  event: Event & { venue: Venue; categories: { category: { name: string; slug: string } }[] };
};

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee";

export function EventCard({ event }: EventCardProps) {
  const dateRange = formatDateRange(new Date(event.startTime), event.endTime ? new Date(event.endTime) : undefined);
  const categories = event.categories.map((cat) => cat.category.name).join(" · ");

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-transform hover:-translate-y-1">
      <div className="relative aspect-[16/9] w-full">
        <Image
          src={event.imageUrl || FALLBACK_IMAGE}
          alt={`Imagen del evento ${event.title}`}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-primary-500">
          <span>{dateRange}</span>
          <span>{event.venue.municipality}</span>
        </div>
        <h3 className="text-lg font-semibold text-slate-900">{event.title}</h3>
        {event.summary && <p className="text-sm text-slate-600">{event.summary}</p>}
        <p className="text-xs text-slate-500">{categories}</p>
        <div className="mt-auto flex items-center justify-between">
          <div className="text-sm font-semibold text-primary-600">
            {event.priceMin != null ? `$${event.priceMin.toFixed(2)}` : "Gratis"}
            {event.priceMax != null && event.priceMax !== event.priceMin ? ` - $${event.priceMax.toFixed(2)}` : ""}
          </div>
          <div className="flex gap-2">
            <Link
              href={`/evento/${event.slug}`}
              className="rounded-full border border-primary-200 px-3 py-1 text-sm text-primary-600 hover:bg-primary-50"
            >
              Ver
            </Link>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${event.venue.latitude},${event.venue.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-primary-500 px-3 py-1 text-sm text-white hover:bg-primary-600"
            >
              Cómo llegar
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

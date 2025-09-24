"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import type { Event, Venue, EventMetric, Organizer } from "@prisma/client";
import { formatDateRange } from "@/lib/utils/date";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ReminderButton } from "@/components/ReminderButton";

export type EventDetailProps = {
  event: Event & { venue: Venue; metrics?: EventMetric | null; organizer: Organizer };
};

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee";

export function EventDetail({ event }: EventDetailProps) {
  const [clicks, setClicks] = useState(event.metrics?.clicksMap ?? 0);
  const [, startTransition] = useTransition();

  const handleClickMap = () => {
    setClicks((value) => value + 1);
    startTransition(async () => {
      await fetch(`/api/events/${event.slug}/metrics`, { method: "POST" }).catch(() => undefined);
    });
  };

  return (
    <section className="grid gap-8 md:grid-cols-[2fr,1fr]">
      <div className="space-y-6">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl">
          <Image
            src={event.imageUrl || FALLBACK_IMAGE}
            alt={`Imagen del evento ${event.title}`}
            fill
            className="object-cover"
          />
        </div>
        <article className="space-y-4">
          <h1 className="text-3xl font-bold text-slate-900">{event.title}</h1>
          {event.summary && <p className="text-lg text-slate-600">{event.summary}</p>}
          <dl className="grid gap-2 text-sm text-slate-600">
            <div>
              <dt className="font-semibold text-slate-700">Fecha y hora</dt>
              <dd>{formatDateRange(new Date(event.startTime), event.endTime ? new Date(event.endTime) : undefined)}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-700">Lugar</dt>
              <dd>
                {event.venue.name} · {event.venue.municipality}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-700">Organiza</dt>
              <dd>{event.organizer.displayName}</dd>
            </div>
          </dl>
          {event.description && (
            <div className="prose max-w-none prose-p:text-slate-700" dangerouslySetInnerHTML={{ __html: event.description }} />
          )}
        </article>
      </div>
      <aside className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <p className="text-sm text-slate-500">Precio</p>
          <p className="text-2xl font-semibold text-primary-600">
            {event.priceMin != null ? `$${event.priceMin.toFixed(2)}` : "Gratis"}
            {event.priceMax != null && event.priceMax !== event.priceMin ? ` - $${event.priceMax.toFixed(2)}` : ""}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <a
            onClick={handleClickMap}
            href={`https://www.google.com/maps/dir/?api=1&destination=${event.venue.latitude},${event.venue.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-primary-500 px-4 py-2 text-center text-white hover:bg-primary-600"
          >
            Cómo llegar
          </a>
          <FavoriteButton eventId={event.id} />
          <ReminderButton eventId={event.id} />
        </div>
        <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-700">Métricas rápidas</p>
          <ul className="mt-2 space-y-1">
            <li>Vistas: {event.metrics?.views ?? 0}</li>
            <li>Clicks mapa: {clicks}</li>
            <li>Guardados: {event.metrics?.saves ?? 0}</li>
          </ul>
        </div>
      </aside>
    </section>
  );
}

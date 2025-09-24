"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import type { Event, Venue } from "@prisma/client";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

type Props = {
  events: (Event & { venue: Venue })[];
};

export function MapView({ events }: Props) {
  const center = events.length ? [events[0].venue.latitude, events[0].venue.longitude] : [13.6929, -89.2182];

  return (
    <div className="h-[420px] overflow-hidden rounded-xl border border-slate-200">
      <MapContainer center={center as [number, number]} zoom={12} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> colaboradores'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {events.map((event) => (
          <Marker key={event.id} position={[event.venue.latitude, event.venue.longitude]} icon={markerIcon}>
            <Popup>
              <div className="flex flex-col gap-1">
                <strong className="text-sm">{event.title}</strong>
                <span className="text-xs text-slate-600">{event.venue.municipality}</span>
                <Link className="text-xs text-primary-600" href={`/evento/${event.slug}`}>
                  Ver evento
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

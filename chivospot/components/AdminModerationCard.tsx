"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

const statuses = [
  { value: "pending", label: "Pendiente" },
  { value: "approved", label: "Aprobado" },
  { value: "published", label: "Publicado" },
  { value: "archived", label: "Archivado" },
];

type Props = {
  event: {
    id: number;
    title: string;
    summary: string | null;
    status: string;
    organizer: { displayName: string };
    venue: { municipality: string };
  };
};

export function AdminModerationCard({ event }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(event.status);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const submit = (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    startTransition(async () => {
      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        setMessage("No se pudo actualizar");
        return;
      }
      setMessage(null);
      router.refresh();
    });
  };

  return (
    <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">{event.title}</h2>
          <p className="text-sm text-slate-500">
            {event.organizer.displayName} · {event.venue.municipality}
          </p>
        </div>
        <span className="text-xs uppercase tracking-wide text-slate-500">{event.status}</span>
      </div>
      {event.summary && <p className="mt-2 text-sm text-slate-600">{event.summary}</p>}
      <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          {statuses.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-70"
        >
          {pending ? "Actualizando..." : "Actualizar estado"}
        </button>
      </div>
      {message && <p className="mt-2 text-sm text-red-600">{message}</p>}
    </form>
  );
}

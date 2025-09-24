import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateRange } from "@/lib/utils/date";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const userId = Number(session.user.id);
  const [favorites, reminders] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId },
      include: { event: { include: { venue: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.reminder.findMany({
      where: { userId },
      include: { event: { include: { venue: true } } },
      orderBy: { remindAt: "asc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold">Hola, {session.user.name ?? session.user.email}</h1>
        <p className="text-sm text-slate-600">Tu agenda personal de eventos guardados y recordatorios.</p>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Favoritos</h2>
        <ul className="space-y-3">
          {favorites.map((favorite) => (
            <li key={favorite.eventId} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-1">
                <span className="text-sm uppercase text-primary-500">
                  {formatDateRange(
                    new Date(favorite.event.startTime),
                    favorite.event.endTime ? new Date(favorite.event.endTime) : undefined
                  )}
                </span>
                <a className="text-lg font-semibold" href={`/evento/${favorite.event.slug}`}>
                  {favorite.event.title}
                </a>
                <span className="text-sm text-slate-500">{favorite.event.venue.municipality}</span>
              </div>
            </li>
          ))}
          {favorites.length === 0 && <p className="text-sm text-slate-600">Aún no tienes eventos guardados.</p>}
        </ul>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Recordatorios</h2>
        <ul className="space-y-3">
          {reminders.map((reminder) => (
            <li key={reminder.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-slate-500">
                  Te recordaremos el {new Date(reminder.remindAt).toLocaleString("es-SV")}
                </span>
                <a className="text-lg font-semibold" href={`/evento/${reminder.event.slug}`}>
                  {reminder.event.title}
                </a>
              </div>
            </li>
          ))}
          {reminders.length === 0 && <p className="text-sm text-slate-600">No tienes recordatorios activos.</p>}
        </ul>
      </section>
    </div>
  );
}

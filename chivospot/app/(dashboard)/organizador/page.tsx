import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrganizerForm } from "@/components/OrganizerForm";
import { StatsMini } from "@/components/StatsMini";
import { formatDateRange } from "@/lib/utils/date";

export default async function OrganizerDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== "organizer") {
    redirect("/login");
  }

  const organizer = await prisma.organizer.findFirst({
    where: { userId: Number(session.user.id) },
  });

  if (!organizer) {
    redirect("/");
  }

  const [venues, categories, events] = await Promise.all([
    prisma.venue.findMany({ select: { id: true, name: true } }),
    prisma.category.findMany({ select: { slug: true, name: true } }),
    prisma.event.findMany({
      where: { organizerId: organizer.id },
      include: { venue: true, metrics: true },
      orderBy: { startTime: "asc" },
    }),
  ]);

  return (
    <div className="space-y-10">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold">Panel del organizador</h1>
        <p className="text-sm text-slate-600">
          Administra tus eventos publicados, revisa métricas básicas y crea nuevos eventos para tu comunidad.
        </p>
      </section>
      <section className="grid gap-8 lg:grid-cols-[1.4fr,1fr]">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Crea o edita un evento</h2>
          <OrganizerForm venues={venues} categories={categories} />
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Tus eventos</h2>
          <div className="space-y-4">
            {events.map((event) => (
              <article key={event.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <a href={`/evento/${event.slug}`} className="text-lg font-semibold text-primary-600">
                      {event.title}
                    </a>
                    <span className="text-xs uppercase tracking-wide text-slate-500">{event.status}</span>
                  </div>
                  <p className="text-sm text-slate-500">
                    {formatDateRange(new Date(event.startTime), event.endTime ? new Date(event.endTime) : undefined)} · {event.venue.name}
                  </p>
                </div>
                <div className="mt-4">
                  <StatsMini metrics={event.metrics} />
                </div>
              </article>
            ))}
            {events.length === 0 && <p className="text-sm text-slate-600">Aún no tienes eventos publicados.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}

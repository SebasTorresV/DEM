import dynamic from "next/dynamic";
import { SearchBar } from "@/components/SearchBar";
import { EventCard } from "@/components/EventCard";
import { getEvents } from "@/lib/events";
import { getNowRange, getUpcomingRange } from "@/lib/utils/date";

const MapView = dynamic(() => import("@/components/MapView").then((mod) => mod.MapView), {
  ssr: false,
  loading: () => <div className="flex h-[420px] items-center justify-center rounded-xl border border-slate-200 bg-white">Cargando mapa…</div>,
});

const tabs = [
  { id: "ahora", label: "Ahora" },
  { id: "proximos", label: "Próximos" },
];

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const view = typeof searchParams.view === "string" ? searchParams.view : "ahora";
  const q = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const municipality = typeof searchParams.municipality === "string" ? searchParams.municipality : undefined;
  const category = typeof searchParams.category === "string" ? searchParams.category : undefined;
  const rangeParam = typeof searchParams.range === "string" ? searchParams.range : undefined;

  const range = (() => {
    if (rangeParam === "today") return getNowRange();
    if (rangeParam === "weekend") {
      const start = new Date();
      const day = start.getDay();
      if (day <= 4) {
        start.setDate(start.getDate() + (5 - day));
      } else if (day === 0) {
        start.setDate(start.getDate() - 2);
      }
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 2);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    if (rangeParam && !Number.isNaN(Number(rangeParam))) {
      return getUpcomingRange(Number(rangeParam));
    }
    return view === "ahora" ? getNowRange() : getUpcomingRange(60);
  })();

  const events = await getEvents({
    q,
    municipality,
    category,
    from: range.start,
    to: range.end,
    status: "published",
  });

  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Descubre eventos en El Salvador</h1>
          <p className="text-sm text-slate-600">
            Explora qué hacer hoy o planea tus próximas aventuras con el mapa interactivo y filtros.
          </p>
        </div>
        <SearchBar defaultQuery={q} />
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const active = view === tab.id;
            const url = new URL("/", "http://localhost:3000");
            Object.entries(searchParams).forEach(([key, value]) => {
              if (typeof value === "string") url.searchParams.set(key, value);
            });
            url.searchParams.set("view", tab.id);
            return (
              <a
                key={tab.id}
                href={`${url.pathname}${url.search}`}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-primary-500 text-white" : "bg-white text-slate-600 hover:bg-primary-50"
                }`}
              >
                {tab.label}
              </a>
            );
          })}
        </div>
      </section>
      <section className="grid gap-8 lg:grid-cols-[1.4fr,1fr]">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Eventos {view === "ahora" ? "para hoy" : "próximamente"}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          {events.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
              No encontramos eventos con esos filtros. Prueba otra búsqueda.
            </p>
          )}
        </div>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Mapa</h2>
          <MapView events={events} />
        </div>
      </section>
    </div>
  );
}

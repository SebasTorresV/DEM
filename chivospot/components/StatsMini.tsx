import type { EventMetric } from "@prisma/client";

type Props = {
  metrics: EventMetric | null;
};

export function StatsMini({ metrics }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { label: "Vistas", value: metrics?.views ?? 0 },
        { label: "Mapa", value: metrics?.clicksMap ?? 0 },
        { label: "Guardados", value: metrics?.saves ?? 0 },
      ].map((metric) => (
        <div key={metric.label} className="rounded-lg bg-slate-50 p-4 text-center">
          <p className="text-xs uppercase text-slate-500">{metric.label}</p>
          <p className="text-xl font-semibold text-primary-600">{metric.value}</p>
        </div>
      ))}
    </div>
  );
}

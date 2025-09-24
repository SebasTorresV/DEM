"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

const municipalities = [
  "San Salvador",
  "Santa Tecla",
  "Antiguo Cuscatlán",
  "Soyapango",
  "Santa Ana",
  "San Miguel",
];

const quickRanges = [
  { label: "Hoy", value: "today" },
  { label: "Fin de semana", value: "weekend" },
  { label: "30 días", value: "30" },
];

type Props = {
  defaultQuery?: string;
};

export function SearchBar({ defaultQuery }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState(defaultQuery ?? params.get("q") ?? "");
  const [municipality, setMunicipality] = useState(params.get("municipality") ?? "");

  const applyFilter = useCallback(
    (extra: Record<string, string | null>) => {
      const newParams = new URLSearchParams(params.toString());
      if (query) newParams.set("q", query);
      else newParams.delete("q");
      if (municipality) newParams.set("municipality", municipality);
      else newParams.delete("municipality");

      Object.entries(extra).forEach(([key, value]) => {
        if (value) newParams.set(key, value);
        else newParams.delete(key);
      });

      router.push(`/?${newParams.toString()}`);
    },
    [municipality, params, query, router]
  );

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <label className="sr-only" htmlFor="search">
          Buscar eventos
        </label>
        <input
          id="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Busca por nombre, artista o palabra clave"
          className="flex-1 rounded-lg border border-slate-200 px-4 py-3 text-base shadow-sm focus:border-primary-400"
        />
        <button
          onClick={() => applyFilter({})}
          className="mt-2 rounded-lg bg-primary-500 px-4 py-3 text-white hover:bg-primary-600 md:mt-0"
        >
          Buscar
        </button>
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {quickRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => applyFilter({ range: range.value })}
              className="rounded-full border border-primary-200 px-4 py-1 text-sm font-medium text-primary-600 hover:bg-primary-50"
            >
              {range.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="municipality" className="text-sm text-slate-600">
            Municipio
          </label>
          <select
            id="municipality"
            value={municipality}
            onChange={(event) => setMunicipality(event.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            {municipalities.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

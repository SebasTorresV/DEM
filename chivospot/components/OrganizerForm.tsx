"use client";

import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { eventSchema, type EventInput } from "@/lib/validators/event";
import { useRouter } from "next/navigation";

interface Props {
  initial?: Partial<EventInput> & { id?: number };
  venues: { id: number; name: string }[];
  categories: { slug: string; name: string }[];
}

const formSchema = eventSchema.extend({
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  endTime: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

export function OrganizerForm({ initial, venues, categories }: Props) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<EventInput>({
    id: initial?.id,
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    summary: initial?.summary ?? "",
    description: initial?.description ?? "",
    imageUrl: initial?.imageUrl ?? "",
    startTime: initial?.startTime ?? new Date().toISOString(),
    endTime: initial?.endTime ?? "",
    priceMin: initial?.priceMin,
    priceMax: initial?.priceMax,
    venueId: initial?.venueId ?? venues[0]?.id ?? 1,
    categories: initial?.categories ?? [],
    status: initial?.status ?? "pending",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!formData.categories.length && categories.length) {
      setFormData((prev) => ({ ...prev, categories: [categories[0].slug] }));
    }
  }, [categories, formData.categories.length]);

  const handleChange = <K extends keyof EventInput>(field: K, value: EventInput[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleCategory = (slug: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(slug)
        ? prev.categories.filter((item) => item !== slug)
        : [...prev.categories, slug],
    }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});
    const result = formSchema.safeParse(formData);
    if (!result.success) {
      const errorMap: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) errorMap[String(issue.path[0])] = issue.message;
      });
      setErrors(errorMap);
      setSubmitting(false);
      return;
    }

    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.data),
    });

    setSubmitting(false);

    if (res.ok) {
      router.refresh();
    } else {
      const json = await res.json().catch(() => ({ message: "Error" }));
      setErrors({ general: json.message ?? "No se pudo guardar" });
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {errors.general && <p className="text-sm text-red-600">{errors.general}</p>}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="title">
            Título
          </label>
          <input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
          />
          {errors.title && <p className="text-xs text-red-600">{errors.title}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="slug">
            Slug
          </label>
          <input
            id="slug"
            value={formData.slug}
            onChange={(e) => handleChange("slug", e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
          />
          {errors.slug && <p className="text-xs text-red-600">{errors.slug}</p>}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="start">
            Inicio
          </label>
          <input
            type="datetime-local"
            id="start"
            value={formData.startTime.slice(0, 16)}
            onChange={(e) => handleChange("startTime", new Date(e.target.value).toISOString())}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="end">
            Fin
          </label>
          <input
            type="datetime-local"
            id="end"
            value={formData.endTime ? formData.endTime.slice(0, 16) : ""}
            onChange={(e) => handleChange("endTime", e.target.value ? new Date(e.target.value).toISOString() : "")}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="priceMin">
            Precio mínimo
          </label>
          <input
            id="priceMin"
            type="number"
            step="0.01"
            value={formData.priceMin ?? ""}
            onChange={(e) => handleChange("priceMin", e.target.value ? Number(e.target.value) : undefined)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="priceMax">
            Precio máximo
          </label>
          <input
            id="priceMax"
            type="number"
            step="0.01"
            value={formData.priceMax ?? ""}
            onChange={(e) => handleChange("priceMax", e.target.value ? Number(e.target.value) : undefined)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="imageUrl">
          Imagen
        </label>
        <input
          id="imageUrl"
          value={formData.imageUrl ?? ""}
          onChange={(e) => handleChange("imageUrl", e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="summary">
          Resumen
        </label>
        <textarea
          id="summary"
          value={formData.summary ?? ""}
          onChange={(e) => handleChange("summary", e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
          rows={3}
        />
        {errors.summary && <p className="text-xs text-red-600">{errors.summary}</p>}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="description">
          Descripción
        </label>
        <textarea
          id="description"
          value={formData.description ?? ""}
          onChange={(e) => handleChange("description", e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
          rows={6}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="venue">
          Lugar
        </label>
        <select
          id="venue"
          value={formData.venueId}
          onChange={(e) => handleChange("venueId", Number(e.target.value))}
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
        >
          {venues.map((venue) => (
            <option key={venue.id} value={venue.id}>
              {venue.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">Categorías</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const active = formData.categories.includes(category.slug);
            return (
              <button
                type="button"
                key={category.slug}
                onClick={() => toggleCategory(category.slug)}
                className={`rounded-full border px-4 py-1 text-sm ${
                  active ? "border-primary-400 bg-primary-50 text-primary-600" : "border-slate-200 text-slate-600"
                }`}
              >
                {category.name}
              </button>
            );
          })}
        </div>
        {errors.categories && <p className="text-xs text-red-600">{errors.categories}</p>}
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-primary-500 px-6 py-2 font-semibold text-white hover:bg-primary-600 disabled:opacity-70"
        >
          {submitting ? "Guardando..." : "Guardar evento"}
        </button>
      </div>
    </form>
  );
}

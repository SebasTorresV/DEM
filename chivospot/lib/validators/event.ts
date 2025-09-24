import { z } from "zod";

export const eventSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(3, "El título es requerido"),
  slug: z
    .string()
    .min(3, "El slug es requerido")
    .regex(/^[a-z0-9-]+$/, "Usa solo minúsculas, números y guiones"),
  summary: z.string().max(180, "Máximo 180 caracteres").optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  startTime: z.string(),
  endTime: z.string().optional().or(z.literal("")),
  priceMin: z.number().nonnegative().nullable().optional(),
  priceMax: z.number().nonnegative().nullable().optional(),
  venueId: z.number(),
  organizerId: z.number().optional(),
  categories: z.array(z.string()),
  status: z.enum(["pending", "approved", "published", "archived"]).optional(),
});

export type EventInput = z.infer<typeof eventSchema>;

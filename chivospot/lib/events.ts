import { prisma } from "@/lib/prisma";
import { withinRadius } from "@/lib/utils/geo";
import type { Prisma } from "@prisma/client";

export type EventFilters = {
  q?: string;
  category?: string;
  from?: Date;
  to?: Date;
  municipality?: string;
  lat?: number;
  lon?: number;
  radiusKm?: number;
  status?: "pending" | "approved" | "published";
};

export async function getEvents(filters: EventFilters = {}) {
  const where: Prisma.EventWhereInput = {
    status: filters.status ?? "published",
  };

  if (filters.from || filters.to) {
    const startFilter: Prisma.DateTimeFilter = {};
    if (filters.from) startFilter.gte = filters.from;
    if (filters.to) startFilter.lte = filters.to;
    where.startTime = startFilter;
  }

  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { summary: { contains: filters.q, mode: "insensitive" } },
      { description: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  if (filters.category) {
    where.categories = {
      some: { category: { slug: filters.category } },
    };
  }

  if (filters.municipality) {
    where.venue = { municipality: filters.municipality };
  }

  const events = await prisma.event.findMany({
    where,
    include: {
      venue: true,
      categories: { include: { category: true } },
      metrics: true,
    },
    orderBy: { startTime: "asc" },
  });

  if (filters.lat != null && filters.lon != null) {
    const radius = filters.radiusKm ?? 10;
    return events.filter((event) =>
      withinRadius(
        filters.lat!,
        filters.lon!,
        event.venue.latitude,
        event.venue.longitude,
        radius
      )
    );
  }

  return events;
}

export async function getEventBySlug(slug: string) {
  return prisma.event.findUnique({
    where: { slug },
    include: {
      venue: true,
      organizer: true,
      categories: { include: { category: true } },
      metrics: true,
    },
  });
}

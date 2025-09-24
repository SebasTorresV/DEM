import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEvents } from "@/lib/events";
import { eventSchema } from "@/lib/validators/event";
import { sanitizeDescription } from "@/lib/utils/sanitize";
import { rateLimit } from "@/lib/server/rate-limit";

function parseNumber(value: string | null) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function resolveRange(range: string | null) {
  if (!range) return { from: undefined, to: undefined };
  const now = new Date();
  if (range === "today") {
    const from = new Date(now);
    from.setHours(0, 0, 0, 0);
    const to = new Date(now);
    to.setHours(23, 59, 59, 999);
    return { from, to };
  }
  if (range === "weekend") {
    const from = new Date(now);
    const day = now.getDay();
    if (day <= 4) {
      from.setDate(from.getDate() + (5 - day));
    } else if (day === 0) {
      from.setDate(from.getDate() - 2);
    }
    from.setHours(0, 0, 0, 0);
    const to = new Date(from);
    to.setDate(from.getDate() + 2);
    to.setHours(23, 59, 59, 999);
    return { from, to };
  }
  const days = Number(range);
  if (Number.isFinite(days)) {
    const from = new Date(now);
    const to = new Date(now);
    to.setDate(to.getDate() + days);
    to.setHours(23, 59, 59, 999);
    return { from, to };
  }
  return { from: undefined, to: undefined };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const q = searchParams.get("q") ?? undefined;
  const category = searchParams.get("category") ?? undefined;
  const municipality = searchParams.get("municipality") ?? undefined;
  const range = resolveRange(searchParams.get("range"));
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  const lat = parseNumber(searchParams.get("lat"));
  const lon = parseNumber(searchParams.get("lon"));
  const radiusKm = parseNumber(searchParams.get("radiusKm"));

  const from = fromParam ? new Date(fromParam) : range.from;
  const to = toParam ? new Date(toParam) : range.to;

  const events = await getEvents({
    q,
    category,
    municipality,
    from,
    to,
    lat,
    lon,
    radiusKm,
    status: "published",
  });

  return NextResponse.json(events);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || !["organizer", "admin"].includes(session.user.role ?? "")) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const rate = rateLimit(`events:${ip}`, { limit: 10, windowMs: 60_000 });
  if (!rate.success) {
    return NextResponse.json({ message: "Demasiadas peticiones" }, { status: 429 });
  }

  const body = await request.json();
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const data = parsed.data;
  const organizer = await prisma.organizer.findFirst({
    where: { userId: Number(session.user.id) },
  });

  const organizerId =
    session.user.role === "admin"
      ? data.organizerId ?? organizer?.id ?? undefined
      : organizer?.id;

  if (!organizerId) {
    return NextResponse.json({ message: "Organizador no configurado" }, { status: 400 });
  }

  const payload = {
    title: data.title,
    slug: data.slug,
    summary: data.summary || null,
    description: data.description ? sanitizeDescription(data.description) : null,
    imageUrl: data.imageUrl || null,
    startTime: new Date(data.startTime),
    endTime: data.endTime ? new Date(data.endTime) : null,
    priceMin: data.priceMin ?? null,
    priceMax: data.priceMax ?? null,
    status: data.status ?? "pending",
    venue: { connect: { id: data.venueId } },
    organizer: { connect: { id: organizerId } },
  };

  const categoryConnect = data.categories.map((slug) => ({
    category: { connect: { slug } },
  }));

  const event = await prisma.$transaction(async (tx) => {
    if (data.id) {
      await tx.eventCategory.deleteMany({ where: { eventId: data.id } });
      return tx.event.update({
        where: { id: data.id },
        data: {
          ...payload,
          categories: {
            create: categoryConnect,
          },
        },
        include: {
          venue: true,
          organizer: true,
          categories: { include: { category: true } },
          metrics: true,
        },
      });
    }

    return tx.event.create({
      data: {
        ...payload,
        categories: {
          create: categoryConnect,
        },
        metrics: {
          create: { views: 0, clicksMap: 0, saves: 0 },
        },
      },
      include: {
        venue: true,
        organizer: true,
        categories: { include: { category: true } },
        metrics: true,
      },
    });
  });

  return NextResponse.json(event, { status: data.id ? 200 : 201 });
}

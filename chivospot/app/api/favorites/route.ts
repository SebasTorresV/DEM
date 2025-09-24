import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { rateLimit } from "@/lib/server/rate-limit";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for") ?? session.user.id;
  const rate = rateLimit(`favorites:${ip}`, { limit: 20, windowMs: 60_000 });
  if (!rate.success) {
    return NextResponse.json({ message: "Demasiadas peticiones" }, { status: 429 });
  }

  const { eventId } = await request.json();
  if (!eventId) {
    return NextResponse.json({ message: "Evento requerido" }, { status: 400 });
  }

  try {
    await prisma.favorite.create({
      data: { userId: Number(session.user.id), eventId },
    });

    await prisma.eventMetric.upsert({
      where: { eventId },
      create: { eventId, views: 0, clicksMap: 0, saves: 1 },
      update: { saves: { increment: 1 } },
    });
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) {
      throw error;
    }
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

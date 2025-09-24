import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: { slug: string } }) {
  const event = await prisma.event.findUnique({ where: { slug: params.slug } });
  if (!event) {
    return NextResponse.json({ message: "Evento no encontrado" }, { status: 404 });
  }

  await prisma.eventMetric.upsert({
    where: { eventId: event.id },
    create: { eventId: event.id, clicksMap: 1, views: 0, saves: 0 },
    update: { clicksMap: { increment: 1 } },
  });

  return NextResponse.json({ ok: true });
}

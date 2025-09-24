import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/server/rate-limit";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  }

  const rate = rateLimit(`reminder:${session.user.id}`, { limit: 5, windowMs: 60_000 });
  if (!rate.success) {
    return NextResponse.json({ message: "Demasiados recordatorios" }, { status: 429 });
  }

  const { eventId, remindAt } = await request.json();
  if (!eventId || !remindAt) {
    return NextResponse.json({ message: "Datos incompletos" }, { status: 400 });
  }

  await prisma.reminder.create({
    data: {
      eventId,
      userId: Number(session.user.id),
      remindAt: new Date(remindAt),
      channel: "local",
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}

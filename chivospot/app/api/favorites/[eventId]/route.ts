import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request: Request, { params }: { params: { eventId: string } }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  }

  const eventId = Number(params.eventId);
  if (!Number.isFinite(eventId)) {
    return NextResponse.json({ message: "Evento inválido" }, { status: 400 });
  }

  await prisma.favorite.delete({
    where: {
      userId_eventId: { userId: Number(session.user.id), eventId },
    },
  }).catch(() => undefined);

  return NextResponse.json({ ok: true });
}

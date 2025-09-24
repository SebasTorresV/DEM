import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { EventStatus } from "@prisma/client";

async function handleUpdate(statusValue: unknown, id: number) {
  if (typeof statusValue !== "string" || !["pending", "approved", "published", "archived"].includes(statusValue)) {
    return NextResponse.json({ message: "Estado inválido" }, { status: 400 });
  }

  const event = await prisma.event.update({
    where: { id },
    data: { status: statusValue as EventStatus },
    include: { venue: true, organizer: true, metrics: true },
  });

  return NextResponse.json(event);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ message: "ID inválido" }, { status: 400 });
  }

  const { status } = await request.json();
  return handleUpdate(status, id);
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ message: "ID inválido" }, { status: 400 });
  }

  const formData = await request.formData();
  const status = formData.get("status");
  return handleUpdate(status, id);
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const events = await prisma.event.findMany({
    where: { status: { in: ["pending", "approved"] } },
    include: {
      organizer: { include: { user: true } },
      venue: true,
      categories: { include: { category: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(events);
}
